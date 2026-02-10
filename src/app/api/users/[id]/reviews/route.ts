import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 사용자가 받은 리뷰 목록 조회
 * GET /api/users/[id]/reviews?page=1&limit=10
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 총 개수
    const total = await prisma.review.count({
      where: { revieweeId: params.id },
    });

    // 리뷰 목록
    const reviews = await prisma.review.findMany({
      where: { revieweeId: params.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        comment: true,
        images: true,
        createdAt: true,
        reviewer: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        order: {
          select: {
            post: {
              select: {
                title: true,
                titleZh: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('User reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
