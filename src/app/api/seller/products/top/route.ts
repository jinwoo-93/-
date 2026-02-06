import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 판매자의 인기 상품 조회
 * GET /api/seller/products/top?limit=5
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
    const limit = parseInt(searchParams.get('limit') || '5');

    const products = await prisma.post.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'SOLD_OUT'] },
      },
      orderBy: [
        { salesCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        titleZh: true,
        images: true,
        priceKRW: true,
        priceCNY: true,
        salesCount: true,
        viewCount: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Seller top products error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상품 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
