import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 관리자 대시보드 통계
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (adminUser?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 병렬로 모든 통계 조회
    const [
      // 오늘의 통계
      todayOrders,
      todayRevenue,
      todayUsers,

      // 이번 주 통계
      weekOrders,
      weekRevenue,
      weekUsers,

      // 이번 달 통계
      monthOrders,
      monthRevenue,
      monthUsers,

      // 전체 통계
      totalUsers,
      totalPosts,
      totalOrders,

      // 미처리 항목
      pendingVerifications,
      pendingDisputes,
      pendingSupport,

      // 활성 통계
      activePosts,
      activeOrders,

      // 국가별 통계
      koreaUsers,
      chinaUsers,
    ] = await Promise.all([
      // 오늘의 주문
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),
      // 오늘의 매출 (KRW 기준)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { in: ['SHIPPING', 'DELIVERED', 'CONFIRMED'] },
        },
        _sum: { totalKRW: true },
      }),
      // 오늘의 신규 회원
      prisma.user.count({
        where: { createdAt: { gte: today } },
      }),

      // 이번 주 주문
      prisma.order.count({
        where: { createdAt: { gte: thisWeekStart } },
      }),
      // 이번 주 매출 (KRW 기준)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisWeekStart },
          status: { in: ['SHIPPING', 'DELIVERED', 'CONFIRMED'] },
        },
        _sum: { totalKRW: true },
      }),
      // 이번 주 신규 회원
      prisma.user.count({
        where: { createdAt: { gte: thisWeekStart } },
      }),

      // 이번 달 주문
      prisma.order.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),
      // 이번 달 매출 (KRW 기준)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: thisMonthStart },
          status: { in: ['SHIPPING', 'DELIVERED', 'CONFIRMED'] },
        },
        _sum: { totalKRW: true },
      }),
      // 이번 달 신규 회원
      prisma.user.count({
        where: { createdAt: { gte: thisMonthStart } },
      }),

      // 전체 회원 수
      prisma.user.count(),
      // 전체 게시물 수
      prisma.post.count(),
      // 전체 주문 수
      prisma.order.count(),

      // 대기 중인 사업자 인증 (현재는 임시로 0)
      // TODO: 사업자 인증 신청 테이블 구현 후 실제 데이터 조회
      Promise.resolve(0),
      // 대기 중인 분쟁 (분쟁 테이블이 있다고 가정)
      0, // TODO: 분쟁 테이블 구현 후 추가
      // 미답변 문의 (지원 테이블이 있다고 가정)
      0, // TODO: 지원 테이블 구현 후 추가

      // 활성 게시물 (판매중)
      prisma.post.count({
        where: { status: 'ACTIVE' },
      }),
      // 활성 주문 (배송중)
      prisma.order.count({
        where: { status: { in: ['PENDING_PAYMENT', 'PAID', 'SHIPPING'] } },
      }),

      // 한국 회원
      prisma.user.count({
        where: { country: 'KR' },
      }),
      // 중국 회원
      prisma.user.count({
        where: { country: 'CN' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue._sum.totalKRW || 0,
          users: todayUsers,
        },
        week: {
          orders: weekOrders,
          revenue: weekRevenue._sum.totalKRW || 0,
          users: weekUsers,
        },
        month: {
          orders: monthOrders,
          revenue: monthRevenue._sum.totalKRW || 0,
          users: monthUsers,
        },
        total: {
          users: totalUsers,
          posts: totalPosts,
          orders: totalOrders,
        },
        pending: {
          verifications: pendingVerifications,
          disputes: pendingDisputes,
          support: pendingSupport,
        },
        active: {
          posts: activePosts,
          orders: activeOrders,
        },
        byCountry: {
          korea: koreaUsers,
          china: chinaUsers,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
