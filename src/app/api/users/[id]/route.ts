import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 사용자 공개 프로필 조회
 * GET /api/users/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        userType: true,
        country: true,
        averageRating: true,
        totalSales: true,
        isBusinessVerified: true,
        hasExcellentBadge: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { status: 'ACTIVE' } },
            receivedReviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '프로필 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
