import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPersonalizedRecommendations,
  getSimilarProducts,
  getPopularProducts,
} from '@/lib/recommendations';

/**
 * 상품 추천 조회
 * GET /api/recommendations?type=personalized|similar|popular
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type') || 'popular';
    const postId = searchParams.get('postId');
    const categoryId = searchParams.get('categoryId');
    const tradeDirection = searchParams.get('tradeDirection') as 'KR_TO_CN' | 'CN_TO_KR' | null;
    const limit = parseInt(searchParams.get('limit') || '10');

    let recommendations;

    switch (type) {
      case 'personalized':
        if (!session?.user?.id) {
          // 비로그인 사용자는 인기 상품으로 대체
          recommendations = await getPopularProducts({ limit, tradeDirection: tradeDirection || undefined });
        } else {
          recommendations = await getPersonalizedRecommendations(session.user.id, limit);
        }
        break;

      case 'similar':
        if (!postId) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'postId가 필요합니다.' } },
            { status: 400 }
          );
        }
        recommendations = await getSimilarProducts(postId, limit);
        break;

      case 'popular':
      default:
        recommendations = await getPopularProducts({
          tradeDirection: tradeDirection || undefined,
          categoryId: categoryId || undefined,
          limit,
        });
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        type,
        recommendations,
      },
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '추천 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
