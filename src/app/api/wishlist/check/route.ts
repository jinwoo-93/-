import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 위시리스트 상태 확인
 * GET /api/wishlist/check?postId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        data: { isWishlisted: false },
      });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'postId가 필요합니다.' } },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { isWishlisted: !!wishlistItem },
    });
  } catch (error) {
    console.error('Wishlist check error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상태 확인 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
