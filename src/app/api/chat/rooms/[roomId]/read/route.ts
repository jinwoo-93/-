import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { markMessagesAsRead } from '@/lib/chat';

/**
 * 채팅방 메시지 읽음 처리
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

    const markedCount = await markMessagesAsRead(roomId, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        markedCount,
      },
    });
  } catch (error) {
    console.error('Mark read API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
