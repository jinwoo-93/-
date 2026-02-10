import { NextRequest, NextResponse } from 'next/server';
import { processExpiredVotings } from '@/lib/jury';

export const dynamic = 'force-dynamic';

/**
 * 만료된 분쟁 투표 처리 Cron Job
 * 매일 오전 0시 (UTC)에 실행
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 확인
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const result = await processExpiredVotings();

    console.log(`[Dispute Cron] Processed ${result.processed} disputes, resolved ${result.resolved}`);

    return NextResponse.json({
      success: true,
      message: '만료된 분쟁 투표가 처리되었습니다.',
      data: result,
    });
  } catch (error) {
    console.error('[Dispute Cron] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}
