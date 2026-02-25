import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 배송업체 정산 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    // 배송업체 사용자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'SHIPPING') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '배송업체 권한이 필요합니다.' },
        },
        { status: 403 }
      );
    }

    // 해당 배송업체 정보 조회
    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!shippingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '등록된 배송업체가 없습니다.' },
        },
        { status: 404 }
      );
    }

    // 쿼리 파라미터에서 연도 추출
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    // 월별 정산 데이터 생성 (1월 ~ 12월)
    const settlements = [];
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      // 해당 월의 주문 조회
      const orders = await prisma.order.findMany({
        where: {
          shippingCompanyId: shippingCompany.id,
          status: {
            in: ['SHIPPING', 'DELIVERED', 'CONFIRMED'],
          },
          shippedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          shippingFeeKRW: true,
        },
      });

      if (orders.length === 0) continue; // 주문이 없는 월은 스킵

      // 총 수익 계산 (배송료 합계)
      const totalRevenue = orders.reduce((sum, order) => sum + order.shippingFeeKRW, 0);

      // 공제액 계산 (파손/분실 배상금 등)
      // TODO: 실제 배상금 데이터를 Dispute 테이블에서 조회해야 함
      const totalDeductions = 0; // 임시값

      const netAmount = totalRevenue - totalDeductions;

      // 정산 상태 결정
      const currentDate = new Date();
      const settlementDate = new Date(year, month, 15); // 익월 15일 지급
      let status: 'PENDING' | 'CONFIRMED' | 'PAID' = 'PENDING';
      let paidAt = null;

      if (currentDate >= settlementDate) {
        status = 'PAID';
        paidAt = settlementDate.toISOString();
      } else if (currentDate >= endDate) {
        status = 'CONFIRMED';
      }

      settlements.push({
        id: `${year}-${month}`,
        year,
        month,
        totalRevenue,
        totalDeductions,
        netAmount,
        status,
        paidAt,
        createdAt: endDate.toISOString(),
      });
    }

    return NextResponse.json({ success: true, data: settlements });
  } catch (error) {
    console.error('Shipping settlements GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
