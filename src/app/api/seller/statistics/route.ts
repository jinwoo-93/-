import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 판매자 통계 조회
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    // 기간 계산
    const now = new Date();
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = daysMap[period as keyof typeof daysMap] || 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // 해당 기간의 확정된 주문 조회
    const orders = await prisma.order.findMany({
      where: {
        sellerId: session.user.id,
        status: {
          in: ['CONFIRMED', 'DELIVERED'],
        },
        confirmedAt: {
          gte: startDate,
        },
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            images: true,
            viewCount: true,
          },
        },
      },
    });

    // 기본 통계
    const totalOrders = orders.length;
    const totalRevenueKRW = orders.reduce((sum, order) => sum + order.totalKRW, 0);
    const totalRevenueCNY = orders.reduce((sum, order) => sum + order.totalCNY, 0);
    const totalSales = orders.reduce((sum, order) => sum + order.quantity, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenueKRW / totalOrders : 0;

    // 상품별 판매 집계
    const productStats = new Map<string, {
      id: string;
      title: string;
      titleZh: string | null;
      images: string[];
      salesCount: number;
      revenue: number;
      viewCount: number;
    }>();

    orders.forEach((order) => {
      const postId = order.post.id;
      if (!productStats.has(postId)) {
        productStats.set(postId, {
          id: postId,
          title: order.post.title,
          titleZh: order.post.titleZh,
          images: order.post.images,
          salesCount: 0,
          revenue: 0,
          viewCount: order.post.viewCount,
        });
      }
      const stats = productStats.get(postId)!;
      stats.salesCount += order.quantity;
      stats.revenue += order.totalKRW;
    });

    // 베스트 상품 Top 5
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 일별 매출 집계
    const dailyStatsMap = new Map<string, { sales: number; revenue: number; orders: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStatsMap.set(dateStr, { sales: 0, revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      const dateStr = new Date(order.confirmedAt!).toISOString().split('T')[0];
      if (dailyStatsMap.has(dateStr)) {
        const stats = dailyStatsMap.get(dateStr)!;
        stats.sales += order.quantity;
        stats.revenue += order.totalKRW;
        stats.orders += 1;
      }
    });

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 전환율 계산 (조회수 대비 구매)
    const totalViews = topProducts.reduce((sum, p) => sum + p.viewCount, 0);
    const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

    const statistics = {
      period,
      totalSales,
      totalRevenueKRW,
      totalRevenueCNY,
      totalOrders,
      avgOrderValue,
      totalViews,
      conversionRate,
      topProducts,
      dailyStats,
    };

    return NextResponse.json({ success: true, data: statistics });
  } catch (error) {
    console.error('Seller statistics GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
