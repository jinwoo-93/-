import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkNewMessages, getUnreadCount } from '@/lib/chat';

export const dynamic = 'force-dynamic';

/**
 * 새 메시지 확인 API (Long Polling)
 * 클라이언트는 이 엔드포인트를 주기적으로 호출하여 새 메시지를 확인합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lastCheckedStr = searchParams.get('lastChecked');

    // 마지막 확인 시간 파싱 (없으면 1분 전)
    const lastCheckedAt = lastCheckedStr
      ? new Date(lastCheckedStr)
      : new Date(Date.now() - 60 * 1000);

    const [newMessagesResult, unreadCount] = await Promise.all([
      checkNewMessages(session.user.id, lastCheckedAt),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        hasNew: newMessagesResult.hasNew,
        newCount: newMessagesResult.count,
        totalUnread: unreadCount,
        latestMessage: newMessagesResult.latestMessage,
        checkedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat poll API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
