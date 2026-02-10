import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 사용자의 판매 상품 목록 조회
 * GET /api/users/[id]/posts?page=1&limit=8
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');

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

    // 총 개수 (활성 상품만)
    const total = await prisma.post.count({
      where: {
        userId: params.id,
        status: { in: ['ACTIVE', 'SOLD_OUT'] },
      },
    });

    // 상품 목록
    const posts = await prisma.post.findMany({
      where: {
        userId: params.id,
        status: { in: ['ACTIVE', 'SOLD_OUT'] },
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE가 먼저
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
        status: true,
        viewCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('User posts fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상품 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
