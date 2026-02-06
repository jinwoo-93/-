/**
 * AI 상품 추천 시스템
 *
 * 협업 필터링 및 콘텐츠 기반 추천
 */

import { prisma } from './db';
import { TradeDirection } from '@prisma/client';

interface RecommendationInput {
  userId?: string;
  postId?: string;
  categoryId?: string;
  tradeDirection?: 'KR_TO_CN' | 'CN_TO_KR';
  limit?: number;
}

interface RecommendedPost {
  id: string;
  title: string;
  titleZh?: string | null;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  tradeDirection: string;
  salesCount: number;
  viewCount: number;
  user: {
    id: string;
    nickname: string | null;
    profileImage: string | null;
    averageRating: number;
  };
  score: number;
  reason: string;
  reasonZh: string;
}

/**
 * 사용자 맞춤 추천
 * - 구매 이력 기반
 * - 조회 이력 기반
 * - 위시리스트 기반
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit = 10
): Promise<RecommendedPost[]> {
  try {
    // 사용자의 구매 이력에서 카테고리 추출
    const purchasedOrders = await prisma.order.findMany({
      where: { buyerId: userId, status: 'CONFIRMED' },
      include: { post: { select: { categoryId: true, tradeDirection: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 위시리스트 카테고리
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId },
      take: 20,
    });

    const wishlistPostIds = wishlistItems.map((w) => w.postId);
    const wishlistPosts = await prisma.post.findMany({
      where: { id: { in: wishlistPostIds } },
      select: { categoryId: true, tradeDirection: true },
    });

    // 카테고리 빈도 계산
    const categoryScores = new Map<string, number>();
    const directionScores = new Map<string, number>();

    for (const order of purchasedOrders) {
      if (order.post.categoryId) {
        categoryScores.set(
          order.post.categoryId,
          (categoryScores.get(order.post.categoryId) || 0) + 3
        );
      }
      directionScores.set(
        order.post.tradeDirection,
        (directionScores.get(order.post.tradeDirection) || 0) + 3
      );
    }

    for (const post of wishlistPosts) {
      if (post.categoryId) {
        categoryScores.set(
          post.categoryId,
          (categoryScores.get(post.categoryId) || 0) + 2
        );
      }
      directionScores.set(
        post.tradeDirection,
        (directionScores.get(post.tradeDirection) || 0) + 2
      );
    }

    // 선호 카테고리/방향 정렬
    const preferredCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const preferredDirection = Array.from(directionScores.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    // 추천 상품 조회
    const posts = await prisma.post.findMany({
      where: {
        status: 'ACTIVE',
        userId: { not: userId }, // 본인 상품 제외
        OR: [
          { categoryId: { in: preferredCategories } },
          preferredDirection ? { tradeDirection: preferredDirection as TradeDirection } : {},
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
      orderBy: [
        { salesCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: limit * 2,
    });

    // 스코어링
    const scoredPosts = posts.map((post) => {
      let score = 0;
      let reason = '';
      let reasonZh = '';

      // 카테고리 매칭
      if (post.categoryId && preferredCategories.includes(post.categoryId)) {
        const catRank = preferredCategories.indexOf(post.categoryId);
        score += (5 - catRank) * 10;
        reason = '관심 카테고리';
        reasonZh = '感兴趣的类目';
      }

      // 방향 매칭
      if (preferredDirection && post.tradeDirection === preferredDirection) {
        score += 20;
        if (!reason) {
          reason = '자주 이용하는 거래 방향';
          reasonZh = '常用的交易方向';
        }
      }

      // 판매량 보너스
      score += Math.min(post.salesCount * 2, 30);

      // 판매자 평점 보너스
      score += post.user.averageRating * 5;

      if (!reason) {
        reason = '인기 상품';
        reasonZh = '热门商品';
      }

      return {
        id: post.id,
        title: post.title,
        titleZh: post.titleZh,
        priceKRW: post.priceKRW,
        priceCNY: post.priceCNY,
        images: post.images,
        tradeDirection: post.tradeDirection,
        salesCount: post.salesCount,
        viewCount: post.viewCount,
        user: post.user,
        score,
        reason,
        reasonZh,
      };
    });

    // 스코어 기준 정렬 후 limit 적용
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    return [];
  }
}

/**
 * 유사 상품 추천
 * - 같은 카테고리
 * - 비슷한 가격대
 * - 같은 거래 방향
 */
export async function getSimilarProducts(
  postId: string,
  limit = 6
): Promise<RecommendedPost[]> {
  try {
    const targetPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        categoryId: true,
        priceKRW: true,
        tradeDirection: true,
        userId: true,
      },
    });

    if (!targetPost) return [];

    // 가격 범위 (±30%)
    const minPrice = Math.floor(targetPost.priceKRW * 0.7);
    const maxPrice = Math.ceil(targetPost.priceKRW * 1.3);

    const posts = await prisma.post.findMany({
      where: {
        id: { not: postId },
        status: 'ACTIVE',
        OR: [
          { categoryId: targetPost.categoryId },
          {
            priceKRW: { gte: minPrice, lte: maxPrice },
            tradeDirection: targetPost.tradeDirection,
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
      orderBy: { salesCount: 'desc' },
      take: limit * 2,
    });

    const scoredPosts = posts.map((post) => {
      let score = 0;
      let reason = '';
      let reasonZh = '';

      // 같은 카테고리
      if (post.categoryId === targetPost.categoryId) {
        score += 50;
        reason = '같은 카테고리';
        reasonZh = '同类商品';
      }

      // 같은 거래 방향
      if (post.tradeDirection === targetPost.tradeDirection) {
        score += 20;
      }

      // 가격 유사도
      const priceDiff = Math.abs(post.priceKRW - targetPost.priceKRW) / targetPost.priceKRW;
      if (priceDiff < 0.1) {
        score += 30;
        if (!reason) {
          reason = '비슷한 가격대';
          reasonZh = '相似价位';
        }
      } else if (priceDiff < 0.2) {
        score += 20;
      } else if (priceDiff < 0.3) {
        score += 10;
      }

      // 판매량 보너스
      score += Math.min(post.salesCount, 20);

      if (!reason) {
        reason = '추천 상품';
        reasonZh = '推荐商品';
      }

      return {
        id: post.id,
        title: post.title,
        titleZh: post.titleZh,
        priceKRW: post.priceKRW,
        priceCNY: post.priceCNY,
        images: post.images,
        tradeDirection: post.tradeDirection,
        salesCount: post.salesCount,
        viewCount: post.viewCount,
        user: post.user,
        score,
        reason,
        reasonZh,
      };
    });

    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Similar products error:', error);
    return [];
  }
}

/**
 * 인기 상품 추천
 */
export async function getPopularProducts(
  options: {
    tradeDirection?: 'KR_TO_CN' | 'CN_TO_KR';
    categoryId?: string;
    limit?: number;
  } = {}
): Promise<RecommendedPost[]> {
  const { tradeDirection, categoryId, limit = 10 } = options;

  try {
    const where: any = { status: 'ACTIVE' };
    if (tradeDirection) where.tradeDirection = tradeDirection;
    if (categoryId) where.categoryId = categoryId;

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
      orderBy: [
        { salesCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return posts.map((post, index) => ({
      id: post.id,
      title: post.title,
      titleZh: post.titleZh,
      priceKRW: post.priceKRW,
      priceCNY: post.priceCNY,
      images: post.images,
      tradeDirection: post.tradeDirection,
      salesCount: post.salesCount,
      viewCount: post.viewCount,
      user: post.user,
      score: 100 - index,
      reason: index < 3 ? 'TOP 인기' : '인기 상품',
      reasonZh: index < 3 ? 'TOP热门' : '热门商品',
    }));
  } catch (error) {
    console.error('Popular products error:', error);
    return [];
  }
}
