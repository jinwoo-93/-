import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

/**
 * Pusher 서버 인스턴스 (API 라우트에서 사용)
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
  useTLS: true,
});

/**
 * Pusher 클라이언트 인스턴스 (클라이언트에서 사용)
 */
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || '',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
        authEndpoint: '/api/pusher/auth',
      }
    );
  }
  return pusherClientInstance;
};

/**
 * 채팅방 채널 이름 생성
 */
export const getChatChannelName = (roomId: string): string => {
  return `private-chat-${roomId}`;
};

/**
 * 사용자 알림 채널 이름 생성
 */
export const getUserChannelName = (userId: string): string => {
  return `private-user-${userId}`;
};

/**
 * Pusher 이벤트 타입
 */
export const PUSHER_EVENTS = {
  // 채팅 이벤트
  NEW_MESSAGE: 'new-message',
  MESSAGE_READ: 'message-read',
  TYPING_START: 'typing-start',
  TYPING_END: 'typing-end',

  // 알림 이벤트
  NEW_NOTIFICATION: 'new-notification',
  ORDER_UPDATE: 'order-update',

  // 시스템 이벤트
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
} as const;

/**
 * 메시지 타입
 */
export interface PusherMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  content: string;
  contentType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  createdAt: string;
  isRead: boolean;
}

/**
 * 타이핑 상태 타입
 */
export interface TypingStatus {
  roomId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}
