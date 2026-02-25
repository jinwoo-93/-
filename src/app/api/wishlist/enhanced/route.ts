import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

/**
 * GET /api/wishlist/enhanced
 * 고급 기능이 포함된 찜목록 조회
 */
export async function GET(request: NextRequest) {
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

    const wishlists = await prisma.wishlist.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            nameZh: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Post 정보 조회
    const postIds = wishlists.map((w) => w.postId);
    const posts = await prisma.post.findMany({
      where: {
        id: { in: postIds },
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            averageRating: true,
          },
        },
      },
    });

    const postsMap = new Map(posts.map((p) => [p.id, p]));

    const data = wishlists
      .map((wishlist) => {
        const post = postsMap.get(wishlist.postId);
        if (!post) return null;

        return {
          id: post.id,
          wishlistId: wishlist.id,
          title: post.title,
          titleZh: post.titleZh,
          priceKRW: post.priceKRW,
          priceCNY: post.priceCNY,
          images: post.images,
          status: post.status,
          addedAt: wishlist.createdAt.toISOString(),
          seller: {
            id: post.user.id,
            nickname: post.user.nickname || '',
            averageRating: post.user.averageRating,
          },
          folder: wishlist.folder,
          priceAlertEnabled: wishlist.priceAlertEnabled,
          targetPrice: wishlist.targetPrice,
          lastKnownPrice: wishlist.lastKnownPrice,
          note: wishlist.note,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/wishlist/enhanced error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
