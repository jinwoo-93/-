import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getWishlistRecommendations } from '@/lib/wishlist-service';

export const dynamic = 'force-dynamic';

/**
 * 즐겨찾기 기반 추천 상품
 * GET /api/wishlist/recommendations?limit=10
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const recommendations = await getWishlistRecommendations(session.user.id, limit);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
      },
    });
  } catch (error) {
    console.error('Wishlist recommendations GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
