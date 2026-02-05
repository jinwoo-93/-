import { NextRequest, NextResponse } from 'next/server';
import { calculateCustomsDuty, getAllCustomsRates } from '@/lib/customs';
import { prisma } from '@/lib/db';

/**
 * 관부가세 계산
 * POST /api/customs/calculate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productPriceKRW,
      productPriceCNY,
      shippingFeeKRW = 0,
      category = 'default',
      quantity = 1,
      originCountry = 'CN',
    } = body;

    if (!productPriceKRW && !productPriceCNY) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '상품 가격을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 환율 조회
    const exchangeRates = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: 'KRW',
        targetCurrency: { in: ['USD', 'CNY'] },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const rateMap: Record<string, number> = {
      USD: 1350,  // 기본값
      CNY: 185,   // 기본값
    };

    exchangeRates.forEach((rate) => {
      rateMap[rate.targetCurrency] = rate.rate;
    });

    // CNY -> KRW 변환 (필요시)
    let priceKRW = productPriceKRW;
    if (!priceKRW && productPriceCNY) {
      priceKRW = Math.round(productPriceCNY * rateMap.CNY);
    }

    // 관부가세 계산
    const result = calculateCustomsDuty(
      {
        productPriceKRW: priceKRW * quantity,
        shippingFeeKRW,
        category,
        quantity,
        originCountry,
      },
      { USD: rateMap.USD, CNY: rateMap.CNY }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        exchangeRates: rateMap,
        input: {
          productPriceKRW: priceKRW,
          shippingFeeKRW,
          category,
          quantity,
          originCountry,
        },
      },
    });
  } catch (error) {
    console.error('Customs calculation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '계산 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 관세율 목록 조회
 * GET /api/customs/calculate
 */
export async function GET() {
  try {
    const rates = getAllCustomsRates();

    return NextResponse.json({
      success: true,
      data: {
        rates,
        dutyFreeThreshold: {
          general: 150, // USD
          usa: 200,     // USD (미국발)
        },
        vatRate: 10,
        notes: [
          '과세가격 = 상품가격 + 국제배송비',
          '미화 $150 이하 면세 (미국발 $200)',
          '관세 = 과세가격 × 관세율',
          '부가세 = (과세가격 + 관세) × 10%',
        ],
      },
    });
  } catch (error) {
    console.error('Customs rates fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
