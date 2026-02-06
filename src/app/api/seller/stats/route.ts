import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 판매자 통계 조회
 * GET /api/seller/stats?range=30d
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // 날짜 범위 계산
    const now = new Date();
    let startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const sellerId = session.user.id;

    // 병렬로 통계 조회
    const [
      totalSalesData,
      periodSalesData,
      userStats,
      totalViews,
      orderCounts,
    ] = await Promise.all([
      // 전체 판매 통계
      prisma.order.aggregate({
        where: {
          sellerId,
          status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPING'] },
        },
        _sum: {
          totalKRW: true,
          totalCNY: true,
        },
        _count: true,
      }),

      // 기간 내 판매 통계
      prisma.order.aggregate({
        where: {
          sellerId,
          status: { in: ['CONFIRMED', 'DELIVERED', 'SHIPPING'] },
          createdAt: { gte: startDate },
        },
        _sum: {
          totalKRW: true,
          totalCNY: true,
        },
        _count: true,
      }),

      // 사용자 통계 (평점, 리뷰 수)
      prisma.user.findUnique({
        where: { id: sellerId },
        select: {
          averageRating: true,
          disputeRate: true,
          _count: {
            select: {
              receivedReviews: true,
            },
          },
        },
      }),

      // 상품 총 조회수
      prisma.post.aggregate({
        where: { userId: sellerId },
        _sum: { viewCount: true },
      }),

      // 주문 상태별 개수
      prisma.order.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: true,
      }),
    ]);

    // 주문 상태별 개수 정리
    const orderCountsByStatus: Record<string, number> = {};
    orderCounts.forEach((item) => {
      orderCountsByStatus[item.status] = item._count;
    });

    const stats = {
      // 전체 통계
      totalSales: totalSalesData._count,
      totalRevenueKRW: totalSalesData._sum.totalKRW || 0,
      totalRevenueCNY: totalSalesData._sum.totalCNY || 0,

      // 기간 내 통계
      thisMonthSales: periodSalesData._count,
      thisMonthRevenueKRW: periodSalesData._sum.totalKRW || 0,
      thisMonthRevenueCNY: periodSalesData._sum.totalCNY || 0,

      // 평점 및 리뷰
      averageRating: userStats?.averageRating || 0,
      totalReviews: userStats?._count.receivedReviews || 0,
      disputeRate: userStats?.disputeRate || 0,

      // 조회수
      totalViews: totalViews._sum.viewCount || 0,

      // 주문 현황
      pendingOrders: orderCountsByStatus['PAID'] || 0,
      shippingOrders: orderCountsByStatus['SHIPPING'] || 0,
      completedOrders:
        (orderCountsByStatus['DELIVERED'] || 0) +
        (orderCountsByStatus['CONFIRMED'] || 0),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Seller stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '통계 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
