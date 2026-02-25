import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 관리자 - 전체 정산 내역 조회
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 기간 계산
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // 판매자 정산 집계
    // 확정된 주문에서 플랫폼 수수료 계산
    const sellerOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'DELIVERED'],
        },
        confirmedAt: {
          gte: startDate,
        },
      },
      select: {
        sellerId: true,
        platformFeeKRW: true,
        totalKRW: true,
        confirmedAt: true,
      },
    });

    // 판매자별로 그룹화
    const sellerSettlements = new Map<string, {
      totalRevenue: number;
      platformFee: number;
      netAmount: number;
      orderCount: number;
      lastSettlementDate: Date;
    }>();

    sellerOrders.forEach((order) => {
      if (!sellerSettlements.has(order.sellerId)) {
        sellerSettlements.set(order.sellerId, {
          totalRevenue: 0,
          platformFee: 0,
          netAmount: 0,
          orderCount: 0,
          lastSettlementDate: order.confirmedAt!,
        });
      }

      const settlement = sellerSettlements.get(order.sellerId)!;
      settlement.totalRevenue += order.totalKRW;
      settlement.platformFee += order.platformFeeKRW;
      settlement.netAmount += (order.totalKRW - order.platformFeeKRW);
      settlement.orderCount += 1;
      if (order.confirmedAt! > settlement.lastSettlementDate) {
        settlement.lastSettlementDate = order.confirmedAt!;
      }
    });

    // 판매자 정보 조회
    const sellerIds = Array.from(sellerSettlements.keys());
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    const sellersMap = new Map(sellers.map((s) => [s.id, s]));

    // 정산 내역 생성
    const settlements = Array.from(sellerSettlements.entries()).map(([sellerId, data]) => {
      const seller = sellersMap.get(sellerId);
      return {
        id: `settlement-${sellerId}-${startDate.getTime()}`,
        userId: sellerId,
        userNickname: seller?.nickname || 'Unknown',
        userProfileImage: seller?.profileImage || null,
        bankName: null, // TODO: 추후 User 모델에 추가 필요
        accountNumber: null,
        accountHolder: null,
        totalRevenue: data.totalRevenue,
        platformFee: data.platformFee,
        netAmount: data.netAmount,
        orderCount: data.orderCount,
        status: 'PENDING', // 실제로는 Settlement 테이블에서 상태 관리
        createdAt: data.lastSettlementDate.toISOString(),
        settledAt: null,
      };
    });

    // 페이지네이션
    const skip = (page - 1) * limit;
    const paginatedSettlements = settlements.slice(skip, skip + limit);

    // 통계 계산
    const stats = {
      totalPending: settlements.reduce((sum, s) => sum + s.netAmount, 0),
      totalPlatformFee: settlements.reduce((sum, s) => sum + s.platformFee, 0),
      pendingCount: settlements.length,
      totalOrders: settlements.reduce((sum, s) => sum + s.orderCount, 0),
    };

    // 오늘 수수료 계산
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayOrders = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'DELIVERED'] },
        confirmedAt: { gte: todayStart },
      },
      select: { platformFeeKRW: true },
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.platformFeeKRW, 0);

    // 이번 달 수수료 계산
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOrders = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'DELIVERED'] },
        confirmedAt: { gte: monthStart },
      },
      select: { platformFeeKRW: true },
    });

    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.platformFeeKRW, 0);

    // 누적 정산 (모든 완료된 주문)
    const allOrders = await prisma.order.aggregate({
      where: {
        status: { in: ['CONFIRMED', 'DELIVERED'] },
      },
      _sum: {
        platformFeeKRW: true,
        totalKRW: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        settlements: paginatedSettlements,
        stats: {
          totalPending: stats.totalPending,
          totalSettled: (allOrders._sum.platformFeeKRW || 0) - stats.totalPlatformFee,
          pendingCount: stats.pendingCount,
          todayRevenue,
          monthRevenue,
          totalOrders: stats.totalOrders,
        },
        pagination: {
          page,
          limit,
          total: settlements.length,
          totalPages: Math.ceil(settlements.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Admin settlements GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
