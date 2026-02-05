import { NextRequest, NextResponse } from 'next/server';
import { updateExchangeRate } from '@/lib/exchange-rate';

// Vercel Cron Job에서 호출하는 환율 업데이트 API
// 매일 오전 9시 KST (0시 UTC)에 실행
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 확인
    const authHeader = request.headers.get('authorization');

    // 개발 환경이 아닌 경우 인증 확인
    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const result = await updateExchangeRate();

    if (result.success) {
      console.log(`[Exchange Rate] Updated successfully:`, result.rates);

      return NextResponse.json({
        success: true,
        message: '환율이 업데이트되었습니다.',
        data: {
          source: result.source,
          rates: result.rates,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      console.error(`[Exchange Rate] Update failed:`, result.error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: '환율 업데이트에 실패했습니다.',
            details: result.error,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Exchange Rate] Unexpected error:', error);

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
