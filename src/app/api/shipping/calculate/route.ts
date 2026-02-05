import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  calculateMultipleShippingRates,
  calculateShippingFee,
  getChargeableWeight,
  getKoreaRegionCode,
} from '@/lib/shipping';

/**
 * 배송비 계산 API
 * POST /api/shipping/calculate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      weight,           // 무게 (kg)
      direction,        // KR_TO_CN | CN_TO_KR
      zipCode,          // 우편번호 (한국 배송지)
      region,           // 지역 코드 (직접 지정 시)
      length,           // 가로 (cm)
      width,            // 세로 (cm)
      height,           // 높이 (cm)
      companyId,        // 특정 배송사 ID (선택)
    } = body;

    // 필수 파라미터 검증
    if (!weight || !direction) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '무게와 배송 방향은 필수입니다.' } },
        { status: 400 }
      );
    }

    if (!['KR_TO_CN', 'CN_TO_KR'].includes(direction)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '올바른 배송 방향을 선택해주세요.' } },
        { status: 400 }
      );
    }

    // 부피 무게 계산 (가로 x 세로 x 높이가 있는 경우)
    const chargeableWeight = getChargeableWeight(weight, length, width, height);

    // 지역 코드 결정
    let regionCode = region;
    if (!regionCode && zipCode && direction === 'CN_TO_KR') {
      regionCode = getKoreaRegionCode(zipCode);
    }

    // 특정 배송사가 지정된 경우
    if (companyId) {
      const company = await prisma.shippingCompany.findUnique({
        where: { id: companyId, isVerified: true },
        select: {
          id: true,
          name: true,
          nameZh: true,
          pricePerKg: true,
          minimumFee: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: '배송사를 찾을 수 없습니다.' } },
          { status: 404 }
        );
      }

      const result = calculateShippingFee(
        { weight: chargeableWeight, direction, region: regionCode },
        company.pricePerKg || undefined,
        company.minimumFee || undefined
      );

      return NextResponse.json({
        success: true,
        data: {
          companyId: company.id,
          companyName: company.name,
          companyNameZh: company.nameZh,
          actualWeight: weight,
          chargeableWeight,
          region: regionCode,
          feeKRW: result.feeKRW,
          feeCNY: result.feeCNY,
          estimatedDays: result.estimatedDays,
        },
      });
    }

    // 모든 검증된 배송사의 요금 비교
    const companies = await prisma.shippingCompany.findMany({
      where: {
        isVerified: true,
        serviceRoutes: {
          array_contains: direction === 'KR_TO_CN'
            ? [{ from: 'KR', to: 'CN' }]
            : [{ from: 'CN', to: 'KR' }],
        },
      },
      select: {
        id: true,
        name: true,
        nameZh: true,
        pricePerKg: true,
        minimumFee: true,
        averageRating: true,
        onTimeRate: true,
        hasExcellentBadge: true,
      },
      orderBy: { averageRating: 'desc' },
    });

    // 배송사가 없으면 기본 요금 반환
    if (companies.length === 0) {
      const defaultResult = calculateShippingFee(
        { weight: chargeableWeight, direction, region: regionCode }
      );

      return NextResponse.json({
        success: true,
        data: {
          rates: [{
            companyId: null,
            companyName: '일반 배송',
            companyNameZh: '普通配送',
            actualWeight: weight,
            chargeableWeight,
            region: regionCode,
            totalFeeKRW: defaultResult.feeKRW,
            totalFeeCNY: defaultResult.feeCNY,
            estimatedDays: defaultResult.estimatedDays,
          }],
          cheapest: {
            feeKRW: defaultResult.feeKRW,
            feeCNY: defaultResult.feeCNY,
          },
        },
      });
    }

    // 여러 배송사 요금 계산
    const rates = calculateMultipleShippingRates(
      { weight: chargeableWeight, direction, region: regionCode },
      companies
    );

    // 배송사 추가 정보 포함
    const ratesWithInfo = rates.map((rate) => {
      const company = companies.find((c) => c.id === rate.companyId);
      return {
        ...rate,
        actualWeight: weight,
        chargeableWeight,
        region: regionCode,
        averageRating: company?.averageRating || 0,
        onTimeRate: company?.onTimeRate || 0,
        hasExcellentBadge: company?.hasExcellentBadge || false,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        rates: ratesWithInfo,
        cheapest: {
          companyId: ratesWithInfo[0]?.companyId,
          feeKRW: ratesWithInfo[0]?.totalFeeKRW,
          feeCNY: ratesWithInfo[0]?.totalFeeCNY,
        },
        recommended: ratesWithInfo.find((r) => r.hasExcellentBadge) || ratesWithInfo[0],
      },
    });
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '배송비 계산 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
