import { NextRequest, NextResponse } from 'next/server';
import { processMonthlySettlements } from '@/lib/cron/settlement';

export const dynamic = 'force-dynamic';

/**
 * 배송업체 월별 정산 크론잡
 * POST /api/cron/settlements
 *
 * Vercel Cron 설정:
 * vercel.json에 추가:
 * {
 *   "crons": [{
 *     "path": "/api/cron/settlements",
 *     "schedule": "0 0 1 * *"
 *   }]
 * }
 *
 * 보안:
 * - Vercel Cron 요청인지 확인
 * - Authorization 헤더 검증
 */
export async function POST(request: NextRequest) {
  try {
    // Vercel Cron 인증 확인
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '인증되지 않은 요청입니다.' } },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting monthly settlement process...');

    const result = await processMonthlySettlements();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          processedCount: result.processedCount,
          totalAmount: result.totalAmount,
          message: `${result.processedCount}개 배송업체 정산 완료`,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SETTLEMENT_ERROR',
            message: '정산 처리 중 오류가 발생했습니다.',
            details: result.errors,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Cron] Settlement error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 테스트용 GET 엔드포인트
 * GET /api/cron/settlements?test=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isTest = searchParams.get('test') === 'true';

  if (!isTest) {
    return NextResponse.json(
      { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'POST 메서드만 허용됩니다.' } },
      { status: 405 }
    );
  }

  // 테스트 모드
  console.log('[Cron] Test mode - processing settlements...');
  const result = await processMonthlySettlements();

  return NextResponse.json({
    success: true,
    test: true,
    data: result,
  });
}
