import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getWishlistStats } from '@/lib/wishlist-service';

export const dynamic = 'force-dynamic';

/**
 * 즐겨찾기 통계 조회
 * GET /api/wishlist/stats
 */
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

    const stats = await getWishlistStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Wishlist stats GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
