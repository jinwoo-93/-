import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 관리자 대시보드 통계
 * GET /api/admin/stats
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

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    // 오늘 날짜 범위
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 이번 주 시작 (월요일)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay() + 1);

    // 이번 달 시작
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 지난 달 시작/끝
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // 병렬 쿼리 실행
    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalPosts,
      activePosts,
      newPostsToday,
      totalOrders,
      ordersToday,
      ordersThisWeek,
      pendingOrders,
      pendingDisputes,
      activeDisputes,
      todayCompletedOrders,
      lastMonthCompletedOrders,
      recentDisputes,
      recentOrders,
    ] = await Promise.all([
      // 총 회원 수
      prisma.user.count(),
      // 오늘 가입
      prisma.user.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      // 이번 주 가입
      prisma.user.count({
        where: { createdAt: { gte: thisWeekStart } },
      }),
      // 이번 달 가입
      prisma.user.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      // 총 게시글
      prisma.post.count(),
      // 활성 게시글
      prisma.post.count({ where: { status: 'ACTIVE' } }),
      // 오늘 등록된 게시글
      prisma.post.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      // 총 주문
      prisma.order.count(),
      // 오늘 주문
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      // 이번 주 주문
      prisma.order.count({
        where: { createdAt: { gte: thisWeekStart } },
      }),
      // 처리 대기 주문 (결제 완료 후 발송 대기)
      prisma.order.count({
        where: { status: { in: ['PAID', 'SHIPPING'] as any } },
      }),
      // 처리 대기 분쟁
      prisma.dispute.count({
        where: { status: 'OPEN' as any },
      }),
      // 진행 중인 분쟁
      prisma.dispute.count({
        where: { status: { in: ['OPEN', 'VOTING'] as any } },
      }),
      // 오늘 완료된 주문 매출
      prisma.order.aggregate({
        where: {
          status: 'CONFIRMED' as any,
          confirmedAt: { gte: today, lt: tomorrow },
        },
        _sum: { totalKRW: true },
      }),
      // 지난달 완료된 주문 매출
      prisma.order.aggregate({
        where: {
          status: 'CONFIRMED' as any,
          confirmedAt: { gte: lastMonthStart, lte: lastMonthEnd },
        },
        _sum: { totalKRW: true },
      }),
      // 최근 분쟁 목록
      prisma.dispute.findMany({
        where: { status: { in: ['OPEN', 'VOTING'] as any } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: { orderNumber: true },
          },
          initiator: {
            select: { nickname: true },
          },
        },
      }),
      // 최근 주문 목록
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalKRW: true,
          createdAt: true,
          buyer: { select: { nickname: true } },
          seller: { select: { nickname: true } },
        },
      }),
    ]);

    // 수수료 계산 (3% 가정)
    const COMMISSION_RATE = 0.03;
    const todayRevenue = Math.round((todayCompletedOrders._sum.totalKRW || 0) * COMMISSION_RATE);
    const lastMonthRevenue = Math.round((lastMonthCompletedOrders._sum.totalKRW || 0) * COMMISSION_RATE);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          totalPosts,
          activePosts,
          newPostsToday,
          totalOrders,
          ordersToday,
          ordersThisWeek,
          pendingOrders,
        },
        disputes: {
          pending: pendingDisputes,
          active: activeDisputes,
          recent: recentDisputes.map((d) => ({
            id: d.id,
            orderNumber: d.order.orderNumber,
            reporter: d.initiator.nickname,
            reason: d.reason,
            createdAt: d.createdAt,
          })),
        },
        revenue: {
          todayRevenue,
          lastMonthRevenue,
          todayTransactions: ordersToday,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.totalKRW,
          buyer: o.buyer.nickname,
          seller: o.seller.nickname,
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '통계 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
