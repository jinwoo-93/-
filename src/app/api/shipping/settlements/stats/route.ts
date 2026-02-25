import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 배송업체 정산 통계 조회
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

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // 해당 연도의 주문 조회
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

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.shippingFeeKRW, 0);
    const avgDeliveryFee = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // TODO: 실제 공제액은 Dispute 테이블에서 조회
    const totalDeductions = 0;
    const netRevenue = totalRevenue - totalDeductions;

    const stats = {
      totalOrders,
      totalRevenue,
      totalDeductions,
      netRevenue,
      avgDeliveryFee,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Shipping settlement stats GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
