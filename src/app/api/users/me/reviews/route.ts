import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 받은 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: session.user.id },
      include: {
        reviewer: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        order: {
          select: {
            id: true,
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 평균 평점 계산
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
