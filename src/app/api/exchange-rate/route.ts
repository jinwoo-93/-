import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRate } from '@/lib/exchange-rate';

// 현재 환율 조회 API
export async function GET(request: NextRequest) {
  try {
    const result = await getExchangeRate();

    return NextResponse.json({
      success: true,
      data: {
        krwToCny: result.krwToCny,
        cnyToKrw: result.cnyToKrw,
        source: result.source,
        // 참고용 변환 예시
        examples: {
          '10000_KRW_to_CNY': Math.round(10000 * result.krwToCny * 100) / 100,
          '100_CNY_to_KRW': Math.round(100 * result.cnyToKrw),
        },
      },
    });
  } catch (error) {
    console.error('[Exchange Rate] GET error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '환율 조회에 실패했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
