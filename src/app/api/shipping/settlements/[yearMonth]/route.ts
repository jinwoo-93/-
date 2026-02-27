import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 특정 월 정산 내역 + 배송업체 정보 조회 (PDF 생성용)
export async function GET(
  request: NextRequest,
  { params }: { params: { yearMonth: string } }
) {
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

    // yearMonth 파싱 (예: "2024-01")
    const [year, month] = params.yearMonth.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '잘못된 연월 형식입니다.' },
        },
        { status: 400 }
      );
    }

    // 배송업체 정보 조회
    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        nameZh: true,
      },
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

    // TODO: ShippingCompany 모델에 businessNumber (사업자번호) 필드 추가 필요
    const companyInfo = {
      ...shippingCompany,
      businessNumber: null,
    };

    // 해당 월의 주문 조회
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

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

    // 총 수익 계산
    const totalRevenue = orders.reduce((sum, order) => sum + order.shippingFeeKRW, 0);

    // 공제액 계산 (파손/분실 배상금 등)
    const orderIds = await prisma.order.findMany({
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
      select: { id: true },
    });

    const disputes = await prisma.dispute.findMany({
      where: {
        orderId: { in: orderIds.map((o) => o.id) },
        shippingCompanyLiable: true,
        status: 'RESOLVED',
        resolvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        compensationAmount: true,
      },
    });

    const totalDeductions = disputes.reduce((sum, d) => sum + (d.compensationAmount || 0), 0);

    const netAmount = totalRevenue - totalDeductions;

    // 정산 상태 결정
    const currentDate = new Date();
    const settlementDate = new Date(year, month, 15); // 익월 15일 지급
    let status: 'PENDING' | 'CONFIRMED' | 'PAID' = 'PENDING';

    if (currentDate >= settlementDate) {
      status = 'PAID';
    } else if (currentDate >= endDate) {
      status = 'CONFIRMED';
    }

    return NextResponse.json({
      success: true,
      data: {
        settlement: {
          year,
          month,
          totalRevenue,
          totalDeductions,
          netAmount,
          status,
        },
        companyInfo,
      },
    });
  } catch (error) {
    console.error('Shipping settlement detail GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
