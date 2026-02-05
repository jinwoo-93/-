import { prisma } from './db';
import { sendNotification } from './fcm';
import { translateText } from './translation';
import { pusherServer, getChatChannelName, PUSHER_EVENTS, type PusherMessage } from './pusher';

/**
 * 채팅방 생성 또는 조회
 * 두 사용자 간의 채팅방이 이미 있으면 반환, 없으면 생성
 */
export async function getOrCreateChatRoom(
  userId1: string,
  userId2: string,
  orderId?: string
): Promise<{ roomId: string; isNew: boolean }> {
  // 일관된 순서로 정렬 (participant1 < participant2)
  const [participant1Id, participant2Id] =
    userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  // 기존 채팅방 조회
  const existingRoom = await prisma.chatRoom.findUnique({
    where: {
      participant1Id_participant2Id: {
        participant1Id,
        participant2Id,
      },
    },
  });

  if (existingRoom) {
    return { roomId: existingRoom.id, isNew: false };
  }

  // 새 채팅방 생성
  const newRoom = await prisma.chatRoom.create({
    data: {
      participant1Id,
      participant2Id,
      orderId,
    },
  });

  return { roomId: newRoom.id, isNew: true };
}

/**
 * 메시지 전송
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
  images: string[] = [],
  orderId?: string
): Promise<{
  success: boolean;
  message?: any;
  error?: string;
}> {
  try {
    // 채팅방 조회 또는 생성
    const { roomId } = await getOrCreateChatRoom(senderId, receiverId, orderId);

    // 메시지 생성
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          chatRoomId: roomId,
          senderId,
          receiverId,
          content,
          images,
          messageType: images.length > 0 ? 'IMAGE' : 'TEXT',
        },
        include: {
          sender: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
            },
          },
        },
      });

      // 채팅방 마지막 메시지 업데이트
      await tx.chatRoom.update({
        where: { id: roomId },
        data: {
          lastMessage: content.substring(0, 100),
          lastMessageAt: new Date(),
        },
      });

      return newMessage;
    });

    // 수신자에게 푸시 알림 전송
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { nickname: true, profileImage: true },
    });

    // Pusher로 실시간 메시지 전송
    const pusherMessage: PusherMessage = {
      id: message.id,
      roomId,
      senderId,
      senderName: sender?.nickname || '사용자',
      senderImage: sender?.profileImage || undefined,
      content,
      contentType: images.length > 0 ? 'IMAGE' : 'TEXT',
      createdAt: message.createdAt.toISOString(),
      isRead: false,
    };

    try {
      await pusherServer.trigger(
        getChatChannelName(roomId),
        PUSHER_EVENTS.NEW_MESSAGE,
        pusherMessage
      );
    } catch (pusherError) {
      console.error('[Chat] Pusher trigger failed:', pusherError);
      // Pusher 실패해도 메시지는 저장되었으므로 계속 진행
    }

    // FCM 푸시 알림 전송 (앱이 백그라운드일 때)
    await sendNotification(
      receiverId,
      `${sender?.nickname || '사용자'}님의 새 메시지`,
      content.length > 50 ? content.substring(0, 50) + '...' : content,
      { type: 'MESSAGE', roomId }
    );

    return { success: true, message };
  } catch (error) {
    console.error('[Chat] Failed to send message:', error);
    return { success: false, error: '메시지 전송에 실패했습니다.' };
  }
}

/**
 * 채팅방 메시지 목록 조회 (페이지네이션)
 */
export async function getChatMessages(
  roomId: string,
  userId: string,
  cursor?: string,
  limit: number = 50
): Promise<{
  messages: any[];
  nextCursor: string | null;
}> {
  // 참여자 확인
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    return { messages: [], nextCursor: null };
  }

  if (room.participant1Id !== userId && room.participant2Id !== userId) {
    return { messages: [], nextCursor: null };
  }

  const messages = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
  });

  let nextCursor: string | null = null;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    nextCursor = nextItem?.id || null;
  }

  return {
    messages: messages.reverse(), // 시간순으로 정렬
    nextCursor,
  };
}

/**
 * 사용자의 채팅방 목록 조회
 */
export async function getUserChatRooms(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  rooms: any[];
  total: number;
}> {
  const where = {
    OR: [{ participant1Id: userId }, { participant2Id: userId }],
  };

  const [rooms, total] = await Promise.all([
    prisma.chatRoom.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true,
          },
        },
      },
    }),
    prisma.chatRoom.count({ where }),
  ]);

  // 상대방 정보 조회
  const roomsWithPartner = await Promise.all(
    rooms.map(async (room) => {
      const partnerId =
        room.participant1Id === userId ? room.participant2Id : room.participant1Id;

      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      });

      // 읽지 않은 메시지 수
      const unreadCount = await prisma.message.count({
        where: {
          chatRoomId: room.id,
          receiverId: userId,
          isRead: false,
        },
      });

      return {
        ...room,
        partner,
        unreadCount,
        lastMessage: room.messages[0] || null,
      };
    })
  );

  return { rooms: roomsWithPartner, total };
}

/**
 * 메시지 읽음 처리
 */
export async function markMessagesAsRead(
  roomId: string,
  userId: string
): Promise<number> {
  // 읽지 않은 메시지 ID 조회
  const unreadMessages = await prisma.message.findMany({
    where: {
      chatRoomId: roomId,
      receiverId: userId,
      isRead: false,
    },
    select: { id: true },
  });

  if (unreadMessages.length === 0) {
    return 0;
  }

  const messageIds = unreadMessages.map((m) => m.id);

  // 읽음 처리
  const result = await prisma.message.updateMany({
    where: {
      id: { in: messageIds },
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  // Pusher로 읽음 상태 전송
  try {
    await pusherServer.trigger(
      getChatChannelName(roomId),
      PUSHER_EVENTS.MESSAGE_READ,
      { messageIds, readerId: userId }
    );
  } catch (pusherError) {
    console.error('[Chat] Pusher read trigger failed:', pusherError);
  }

  return result.count;
}

/**
 * 읽지 않은 메시지 총 개수
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });
}

/**
 * 새 메시지 확인 (Long Polling용)
 * 마지막으로 확인한 시간 이후의 새 메시지가 있는지 확인
 */
export async function checkNewMessages(
  userId: string,
  lastCheckedAt: Date
): Promise<{
  hasNew: boolean;
  count: number;
  latestMessage?: any;
}> {
  const newMessages = await prisma.message.findMany({
    where: {
      receiverId: userId,
      createdAt: { gt: lastCheckedAt },
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: {
      sender: {
        select: {
          id: true,
          nickname: true,
          profileImage: true,
        },
      },
    },
  });

  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      createdAt: { gt: lastCheckedAt },
    },
  });

  return {
    hasNew: count > 0,
    count,
    latestMessage: newMessages[0] || undefined,
  };
}

/**
 * 메시지 자동 번역
 */
export async function translateMessage(
  content: string,
  targetLang: 'KO' | 'ZH'
): Promise<string> {
  try {
    const translated = await translateText(
      content,
      targetLang === 'ZH' ? 'ZH' : 'KO'
    );
    return translated || content;
  } catch {
    return content;
  }
}
