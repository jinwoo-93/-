/**
 * 즐겨찾기 고급 기능 서비스
 * 폴더, 태그, 알림 등
 */

import { prisma } from './db';
import { sendTemplatedNotification } from './notification-service';

export interface WishlistFolder {
  id: string;
  userId: string;
  name: string;
  nameZh?: string;
  description?: string;
  itemCount: number;
  createdAt: Date;
}

export interface WishlistTag {
  id: string;
  name: string;
  color?: string;
}

/**
 * 즐겨찾기 폴더 생성
 * TODO: WishlistFolder 모델을 Prisma 스키마에 추가 필요
 */
export async function createWishlistFolder(
  userId: string,
  name: string,
  nameZh?: string,
  description?: string
): Promise<{
  success: boolean;
  folder?: any;
  error?: string;
}> {
  try {
    // TODO: Prisma 모델 추가 후 구현
    /*
    const folder = await prisma.wishlistFolder.create({
      data: {
        userId,
        name,
        nameZh,
        description,
      },
    });

    return {
      success: true,
      folder,
    };
    */

    console.log('[WishlistService] Folder creation skipped (model not implemented)');

    return {
      success: false,
      error: 'Wishlist folder feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error creating folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 즐겨찾기 항목에 폴더 지정
 */
export async function assignWishlistToFolder(
  wishlistId: string,
  folderId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Wishlist 모델에 folderId 필드 추가 필요
    /*
    await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { folderId },
    });

    return { success: true };
    */

    console.log('[WishlistService] Folder assignment skipped (field not implemented)');

    return {
      success: false,
      error: 'Wishlist folder feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error assigning folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 즐겨찾기 항목에 메모 추가
 */
export async function addWishlistNote(
  wishlistId: string,
  note: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Wishlist 모델에 note 필드 추가 필요
    /*
    await prisma.wishlist.update({
      where: { id: wishlistId },
      data: { note },
    });

    return { success: true };
    */

    console.log('[WishlistService] Note addition skipped (field not implemented)');

    return {
      success: false,
      error: 'Wishlist note feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error adding note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 가격 변동 알림 설정
 */
export async function enablePriceAlert(
  userId: string,
  postId: string,
  targetPrice?: number // 목표 가격 (옵션)
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Wishlist 모델에 priceAlertEnabled, targetPrice 필드 추가 필요
    /*
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!wishlist) {
      return {
        success: false,
        error: 'Wishlist item not found',
      };
    }

    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        priceAlertEnabled: true,
        targetPrice,
      },
    });

    return { success: true };
    */

    console.log('[WishlistService] Price alert setup skipped (fields not implemented)');

    return {
      success: false,
      error: 'Price alert feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error enabling price alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 가격 변동 확인 및 알림 (Cron Job)
 */
export async function checkPriceChanges(): Promise<{
  success: boolean;
  notifiedCount: number;
}> {
  try {
    // TODO: Wishlist 모델에 priceAlertEnabled, lastKnownPrice 필드 추가 필요
    /*
    const wishlistsWithAlert = await prisma.wishlist.findMany({
      where: {
        priceAlertEnabled: true,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            priceKRW: true,
            priceCNY: true,
          },
        },
      },
    });

    let notifiedCount = 0;

    for (const wishlist of wishlistsWithAlert) {
      const currentPrice = wishlist.post.priceKRW;
      const lastKnownPrice = wishlist.lastKnownPrice;

      // 가격이 변동되었거나 목표 가격 이하로 떨어진 경우
      const priceDropped = lastKnownPrice && currentPrice < lastKnownPrice;
      const reachedTarget = wishlist.targetPrice && currentPrice <= wishlist.targetPrice;

      if (priceDropped || reachedTarget) {
        // 알림 전송
        const user = await prisma.user.findUnique({
          where: { id: wishlist.userId },
          select: { language: true },
        });

        const language = user?.language === 'ZH' ? 'zh' : user?.language === 'EN' ? 'en' : 'ko';

        let title, message;
        if (language === 'zh') {
          title = '价格变动提醒';
          message = `${wishlist.post.title} 的价格已降至 ₩${currentPrice.toLocaleString()}`;
        } else if (language === 'en') {
          title = 'Price Drop Alert';
          message = `${wishlist.post.title} is now ₩${currentPrice.toLocaleString()}`;
        } else {
          title = '가격 변동 알림';
          message = `${wishlist.post.title}의 가격이 ${currentPrice.toLocaleString()}원으로 변경되었습니다`;
        }

        await prisma.notification.create({
          data: {
            userId: wishlist.userId,
            type: 'SYSTEM',
            title,
            message,
            link: `/posts/${wishlist.post.id}`,
          },
        });

        // 마지막 알려진 가격 업데이트
        await prisma.wishlist.update({
          where: { id: wishlist.id },
          data: {
            lastKnownPrice: currentPrice,
          },
        });

        notifiedCount++;
      }
    }

    console.log(`[WishlistService] Price change notifications sent: ${notifiedCount}`);

    return {
      success: true,
      notifiedCount,
    };
    */

    console.log('[WishlistService] Price change check skipped (fields not implemented)');

    return {
      success: true,
      notifiedCount: 0,
    };
  } catch (error) {
    console.error('[WishlistService] Error checking price changes:', error);
    return {
      success: false,
      notifiedCount: 0,
    };
  }
}

/**
 * 재고 알림 설정
 */
export async function enableStockAlert(
  userId: string,
  postId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // TODO: Wishlist 모델에 stockAlertEnabled 필드 추가 필요
    /*
    const wishlist = await prisma.wishlist.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!wishlist) {
      return {
        success: false,
        error: 'Wishlist item not found',
      };
    }

    await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: {
        stockAlertEnabled: true,
      },
    });

    return { success: true };
    */

    console.log('[WishlistService] Stock alert setup skipped (field not implemented)');

    return {
      success: false,
      error: 'Stock alert feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error enabling stock alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 즐겨찾기 통계
 */
export async function getWishlistStats(userId: string): Promise<{
  totalItems: number;
  byCategory: Record<string, number>;
  totalValue: number;
  recentlyAdded: number; // 최근 7일
}> {
  try {
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      select: {
        postId: true,
        createdAt: true,
      },
    });

    // 별도로 상품 정보 조회
    const postIds = wishlists.map((w) => w.postId);
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        priceKRW: true,
        categoryId: true,
      },
    });

    const postsMap = new Map(posts.map((p) => [p.id, p]));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      totalItems: wishlists.length,
      byCategory: {} as Record<string, number>,
      totalValue: 0,
      recentlyAdded: 0,
    };

    wishlists.forEach((wishlist) => {
      const post = postsMap.get(wishlist.postId);

      if (post) {
        // 카테고리별 집계
        const categoryId = post.categoryId || 'uncategorized';
        stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1;

        // 총 가치
        if (post.priceKRW) {
          stats.totalValue += post.priceKRW;
        }
      }

      // 최근 7일 추가
      if (wishlist.createdAt >= sevenDaysAgo) {
        stats.recentlyAdded++;
      }
    });

    return stats;
  } catch (error) {
    console.error('[WishlistService] Error getting wishlist stats:', error);
    return {
      totalItems: 0,
      byCategory: {},
      totalValue: 0,
      recentlyAdded: 0,
    };
  }
}

/**
 * 즐겨찾기 공유 URL 생성
 */
export async function createWishlistShareLink(
  userId: string,
  wishlistIds?: string[] // 특정 항목들만 공유 (옵션)
): Promise<{
  success: boolean;
  shareLink?: string;
  error?: string;
}> {
  try {
    // TODO: SharedWishlist 모델 추가 필요
    /*
    const shareToken = crypto.randomBytes(16).toString('hex');

    await prisma.sharedWishlist.create({
      data: {
        userId,
        shareToken,
        wishlistIds: wishlistIds || [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후 만료
      },
    });

    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/wishlist/shared/${shareToken}`;

    return {
      success: true,
      shareLink,
    };
    */

    console.log('[WishlistService] Share link creation skipped (model not implemented)');

    return {
      success: false,
      error: 'Wishlist sharing feature not implemented',
    };
  } catch (error) {
    console.error('[WishlistService] Error creating share link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 즐겨찾기 추천 (유사 상품)
 */
export async function getWishlistRecommendations(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    // 사용자의 즐겨찾기 카테고리 분석
    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      select: {
        postId: true,
      },
    });

    // 별도로 상품 정보 조회
    const postIds = wishlists.map((w) => w.postId);
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        categoryId: true,
      },
    });

    const categoryIds = Array.from(
      new Set(posts.map((p) => p.categoryId).filter(Boolean))
    ) as string[];

    if (categoryIds.length === 0) {
      return [];
    }

    // 같은 카테고리의 인기 상품 추천
    const recommendations = await prisma.post.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
        status: 'ACTIVE',
        id: {
          notIn: wishlists.map((w) => w.postId), // 이미 찜한 상품 제외
        },
      },
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
        viewCount: true,
        user: {
          select: {
            id: true,
            nickname: true,
            averageRating: true,
          },
        },
      },
    });

    return recommendations;
  } catch (error) {
    console.error('[WishlistService] Error getting recommendations:', error);
    return [];
  }
}
