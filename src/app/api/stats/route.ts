import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats - 플랫폼 통계 조회
export async function GET() {
  try {
    // 실시간 통계 조회
    const [userCount, orderCount, averageRating] = await Promise.all([
      // 총 회원 수
      prisma.user.count(),

      // 완료된 거래 건수
      prisma.order.count({
        where: {
          status: 'CONFIRMED',
        },
      }),

      // 평균 평점 (5점 만점 기준)
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }),
    ]);

    // 만족도 계산 (평점 / 5 * 100)
    const satisfaction = averageRating._avg.rating
      ? Math.round((averageRating._avg.rating / 5) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        userCount,
        orderCount,
        satisfaction,
      },
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch statistics',
        },
      },
      { status: 500 }
    );
  }
}
