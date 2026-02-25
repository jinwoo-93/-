import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 판매자 정산 내역 조회
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

    // 쿼리 파라미터에서 연도/월 추출
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;

    if (month) {
      // 특정 월의 정산 내역 조회
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const orders = await prisma.order.findMany({
        where: {
          sellerId: session.user.id,
          status: {
            in: ['CONFIRMED', 'DELIVERED'],
          },
          confirmedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          orderNumber: true,
          totalKRW: true,
          platformFeeKRW: true,
          confirmedAt: true,
          post: {
            select: {
              title: true,
            },
          },
        },
      });

      const totalRevenue = orders.reduce((sum, order) => sum + order.totalKRW, 0);
      const platformFee = orders.reduce((sum, order) => sum + order.platformFeeKRW, 0);
      const netAmount = totalRevenue - platformFee;

      return NextResponse.json({
        success: true,
        data: {
          year,
          month,
          totalRevenue,
          platformFee,
          netAmount,
          orders,
        },
      });
    } else {
      // 연도별 월별 정산 요약 조회
      const settlements = [];

      for (let m = 1; m <= 12; m++) {
        const startDate = new Date(year, m - 1, 1);
        const endDate = new Date(year, m, 0, 23, 59, 59);

        const orders = await prisma.order.findMany({
          where: {
            sellerId: session.user.id,
            status: {
              in: ['CONFIRMED', 'DELIVERED'],
            },
            confirmedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            totalKRW: true,
            platformFeeKRW: true,
          },
        });

        if (orders.length === 0) continue;

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalKRW, 0);
        const platformFee = orders.reduce((sum, order) => sum + order.platformFeeKRW, 0);
        const netAmount = totalRevenue - platformFee;

        // 정산 상태 결정
        const currentDate = new Date();
        const settlementDate = new Date(year, m, 15); // 익월 15일 지급
        let status: 'PENDING' | 'CONFIRMED' | 'PAID' = 'PENDING';
        let paidAt = null;

        if (currentDate >= settlementDate) {
          status = 'PAID';
          paidAt = settlementDate.toISOString();
        } else if (currentDate >= endDate) {
          status = 'CONFIRMED';
        }

        settlements.push({
          id: `${year}-${m}`,
          year,
          month: m,
          totalRevenue,
          platformFee,
          netAmount,
          status,
          paidAt,
        });
      }

      return NextResponse.json({ success: true, data: settlements });
    }
  } catch (error) {
    console.error('Seller settlements GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
