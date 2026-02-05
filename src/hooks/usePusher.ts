'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Channel } from 'pusher-js';
import {
  getPusherClient,
  getChatChannelName,
  getUserChannelName,
  PUSHER_EVENTS,
  type PusherMessage,
  type TypingStatus,
} from '@/lib/pusher';

/**
 * Pusher 연결 상태 훅
 */
export function usePusherConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();

    const handleConnectionChange = () => {
      setIsConnected(pusher.connection.state === 'connected');
    };

    pusher.connection.bind('state_change', handleConnectionChange);
    handleConnectionChange();

    return () => {
      pusher.connection.unbind('state_change', handleConnectionChange);
    };
  }, []);

  return { isConnected };
}

/**
 * 채팅방 실시간 구독 훅
 */
export function useChatRoom(roomId: string | null) {
  const [messages, setMessages] = useState<PusherMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingStatus>>(new Map());
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const pusher = getPusherClient();
    const channelName = getChatChannelName(roomId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // 새 메시지 수신
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (data: PusherMessage) => {
      setMessages((prev) => {
        // 중복 체크
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    // 메시지 읽음 처리
    channel.bind(PUSHER_EVENTS.MESSAGE_READ, (data: { messageIds: string[]; readerId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          data.messageIds.includes(m.id) ? { ...m, isRead: true } : m
        )
      );
    });

    // 타이핑 시작
    channel.bind(PUSHER_EVENTS.TYPING_START, (data: TypingStatus) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.set(data.userId, data);
        return updated;
      });
    });

    // 타이핑 종료
    channel.bind(PUSHER_EVENTS.TYPING_END, (data: TypingStatus) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [roomId]);

  // 메시지 초기화 (기존 메시지 로드 시)
  const initMessages = useCallback((initialMessages: PusherMessage[]) => {
    setMessages(initialMessages);
  }, []);

  // 메시지 추가 (낙관적 업데이트용)
  const addMessage = useCallback((message: PusherMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    initMessages,
    addMessage,
  };
}

/**
 * 사용자 알림 채널 구독 훅
 */
export function useUserNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const pusher = getPusherClient();
    const channelName = getUserChannelName(userId);
    const channel = pusher.subscribe(channelName);

    // 새 알림 수신
    channel.bind(PUSHER_EVENTS.NEW_NOTIFICATION, (data: any) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // 주문 업데이트
    channel.bind(PUSHER_EVENTS.ORDER_UPDATE, (data: any) => {
      // 주문 상태 변경 처리
      console.log('Order update:', data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    clearNotifications,
  };
}

/**
 * 타이핑 상태 전송 훅
 */
export function useTypingIndicator(roomId: string | null, userId: string | null, userName: string) {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const sendTypingStart = useCallback(async () => {
    if (!roomId || !userId || isTypingRef.current) return;

    isTypingRef.current = true;

    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, isTyping: true }),
      });
    } catch (error) {
      console.error('Failed to send typing status:', error);
    }
  }, [roomId, userId]);

  const sendTypingEnd = useCallback(async () => {
    if (!roomId || !userId || !isTypingRef.current) return;

    isTypingRef.current = false;

    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, isTyping: false }),
      });
    } catch (error) {
      console.error('Failed to send typing status:', error);
    }
  }, [roomId, userId]);

  const handleTyping = useCallback(() => {
    sendTypingStart();

    // 기존 타이머 클리어
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 2초 후 타이핑 종료
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEnd();
    }, 2000);
  }, [sendTypingStart, sendTypingEnd]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTypingEnd();
    };
  }, [sendTypingEnd]);

  return { handleTyping };
}
