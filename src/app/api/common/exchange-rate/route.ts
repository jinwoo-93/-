import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 환율 조회
export async function GET(request: NextRequest) {
  try {
    const rate = await prisma.exchangeRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: 'KRW',
          toCurrency: 'CNY',
        },
      },
    });

    if (!rate) {
      // 기본값 반환
      return NextResponse.json({
        success: true,
        data: {
          fromCurrency: 'KRW',
          toCurrency: 'CNY',
          rate: 0.0054,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, data: rate });
  } catch (error) {
    console.error('Exchange rate GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
