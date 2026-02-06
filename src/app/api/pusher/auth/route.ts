import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { pusherServer } from '@/lib/pusher';

/**
 * Pusher 프라이빗 채널 인증
 * POST /api/pusher/auth
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    if (!socketId || !channel) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 채널 권한 확인
    if (channel.startsWith('private-chat-')) {
      // 채팅방 접근 권한 확인 (채팅방 참여자인지)
      const roomId = channel.replace('private-chat-', '');
      // 여기서 DB 조회로 권한 확인 가능
      // 지금은 간단히 인증만 수행
    } else if (channel.startsWith('private-user-')) {
      // 사용자 채널은 본인만 접근 가능
      const userId = channel.replace('private-user-', '');
      if (userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Pusher 인증
    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || '',
        image: session.user.image || '',
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
