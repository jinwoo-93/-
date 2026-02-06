import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { pusherServer, getChatChannelName, PUSHER_EVENTS } from '@/lib/pusher';

/**
 * 타이핑 상태 전송
 * POST /api/chat/typing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { roomId, isTyping } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'roomId가 필요합니다.' } },
        { status: 400 }
      );
    }

    const channelName = getChatChannelName(roomId);
    const event = isTyping ? PUSHER_EVENTS.TYPING_START : PUSHER_EVENTS.TYPING_END;

    await pusherServer.trigger(channelName, event, {
      roomId,
      userId: session.user.id,
      userName: session.user.name || '',
      isTyping,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing status error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
