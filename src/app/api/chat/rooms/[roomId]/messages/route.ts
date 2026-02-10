import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getChatMessages, sendMessage, markMessagesAsRead } from '@/lib/chat';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const sendMessageSchema = z.object({
  content: z.string().min(1, '메시지 내용이 필요합니다.').max(2000, '메시지는 2000자 이내로 작성해주세요.'),
  images: z.array(z.string().url()).max(5, '이미지는 최대 5개까지 첨부할 수 있습니다.').optional(),
});

/**
 * 채팅방 메시지 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    // 권한 확인
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '채팅방을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (room.participant1Id !== session.user.id && room.participant2Id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    const { messages, nextCursor } = await getChatMessages(roomId, session.user.id, cursor, limit);

    // 메시지 읽음 처리
    await markMessagesAsRead(roomId, session.user.id);

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        nextCursor,
        hasMore: nextCursor !== null,
      },
    });
  } catch (error) {
    console.error('Chat messages API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 메시지 전송
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { roomId } = params;

    // 권한 확인
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '채팅방을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (room.participant1Id !== session.user.id && room.participant2Id !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = sendMessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다.',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { content, images } = validated.data;

    // 수신자 결정
    const receiverId =
      room.participant1Id === session.user.id ? room.participant2Id : room.participant1Id;

    const result = await sendMessage(session.user.id, receiverId, content, images || []);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'SEND_ERROR', message: result.error || '메시지 전송에 실패했습니다.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.message,
    }, { status: 201 });
  } catch (error) {
    console.error('Send message API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
