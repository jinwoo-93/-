import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

/**
 * PATCH /api/wishlist/[id]/price-alert
 * 찜 항목 가격 알림 설정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, apiLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
        },
        { status: 401 }
      );
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '찜 항목을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (wishlist.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '권한이 없습니다' },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updatedWishlist = await prisma.wishlist.update({
      where: {
        id: params.id,
      },
      data: {
        priceAlertEnabled: body.priceAlertEnabled,
        targetPrice: body.targetPrice,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWishlist,
    });
  } catch (error) {
    console.error('PATCH /api/wishlist/[id]/price-alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
