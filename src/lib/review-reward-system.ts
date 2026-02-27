/**
 * 리뷰 보상 시스템
 * 리뷰 작성 시 포인트 지급 및 쿠폰 발급
 */

import { prisma } from './db';
import { issueReviewCoupon } from './coupon-automation';
import { notifyPointEarned } from './notification-service';

export type ReviewQuality = 'BASIC' | 'DETAILED' | 'PREMIUM';

export interface ReviewReward {
  points: number;
  coupons: string[];
  badges: string[];
}

/**
 * 리뷰 퀄리티 평가
 */
export function evaluateReviewQuality(review: {
  rating: number;
  comment?: string | null;
  images?: string[] | null;
}): ReviewQuality {
  const { comment, images } = review;

  const hasComment = comment && comment.length > 0;
  const commentLength = comment?.length || 0;
  const hasImages = images && images.length > 0;
  const imageCount = images?.length || 0;

  // PREMIUM: 200자 이상 + 이미지 3장 이상
  if (commentLength >= 200 && imageCount >= 3) {
    return 'PREMIUM';
  }

  // DETAILED: 100자 이상 또는 이미지 1장 이상
  if (commentLength >= 100 || imageCount >= 1) {
    return 'DETAILED';
  }

  // BASIC: 그 외
  return 'BASIC';
}

/**
 * 리뷰 퀄리티별 포인트 보상
 */
const REVIEW_POINTS: Record<ReviewQuality, number> = {
  BASIC: 100, // 기본 리뷰
  DETAILED: 300, // 상세 리뷰
  PREMIUM: 500, // 프리미엄 리뷰
};

/**
 * 리뷰 작성 보상 지급
 */
export async function rewardReview(
  userId: string,
  reviewId: string,
  review: {
    rating: number;
    comment?: string;
    images?: string[];
  }
): Promise<{
  success: boolean;
  reward: ReviewReward;
  error?: string;
}> {
  try {
    // 1. 리뷰 퀄리티 평가
    const quality = evaluateReviewQuality(review);
    const points = REVIEW_POINTS[quality];

    // 2. 포인트 지급
    const userPoint = await prisma.userPoint.upsert({
      where: { userId },
      create: {
        userId,
        balance: points,
        totalEarned: points,
      },
      update: {
        balance: {
          increment: points,
        },
        totalEarned: {
          increment: points,
        },
      },
    });

    // 3. 포인트 히스토리 기록
    await prisma.pointHistory.create({
      data: {
        userPointId: userPoint.id,
        type: 'REVIEW_REWARD',
        amount: points,
        balance: userPoint.balance + points,
        description: '리뷰 작성 포인트',
        descriptionZh: '评价积分',
      },
    });

    // 4. 추가 보상
    const coupons: string[] = [];
    const badges: string[] = [];

    // 프리미엄 리뷰인 경우 쿠폰 발급
    if (quality === 'PREMIUM') {
      const couponResult = await issueReviewCoupon(userId, reviewId);
      if (couponResult.success && couponResult.couponIds) {
        coupons.push(...couponResult.couponIds);
      }
    }

    // 누적 리뷰 수 확인 (뱃지 부여)
    const reviewCount = await prisma.review.count({
      where: { reviewerId: userId },
    });

    if (reviewCount === 10) {
      badges.push('리뷰어 브론즈');
    } else if (reviewCount === 50) {
      badges.push('리뷰어 실버');
    } else if (reviewCount === 100) {
      badges.push('리뷰어 골드');
    }

    // 5. 알림 전송
    await notifyPointEarned(userId, points, userPoint.balance + points, '/mypage/points');

    console.log(
      `[ReviewRewardSystem] Rewarded user ${userId} with ${points} points for ${quality} review`
    );

    return {
      success: true,
      reward: {
        points,
        coupons,
        badges,
      },
    };
  } catch (error) {
    console.error('[ReviewRewardSystem] Error rewarding review:', error);
    return {
      success: false,
      reward: {
        points: 0,
        coupons: [],
        badges: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 이달의 베스트 리뷰 선정 (Cron Job)
 */
export async function selectMonthlyBestReviews(): Promise<{
  success: boolean;
  selectedCount: number;
}> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 이번 달 리뷰 중 좋아요가 많은 상위 10개
    const bestReviews = await prisma.review.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: 10,
      select: {
        id: true,
        reviewerId: true,
      },
    });

    let selectedCount = 0;

    for (const review of bestReviews) {
      // 베스트 리뷰 마크
      await prisma.review.update({
        where: { id: review.id },
        data: {
          isBest: true,
          bestSelectedAt: new Date(),
        },
      });

      // 추가 보상 지급 (1000 포인트)
      const userPoint = await prisma.userPoint.upsert({
        where: { userId: review.reviewerId },
        create: {
          userId: review.reviewerId,
          balance: 1000,
          totalEarned: 1000,
        },
        update: {
          balance: {
            increment: 1000,
          },
          totalEarned: {
            increment: 1000,
          },
        },
      });

      await prisma.pointHistory.create({
        data: {
          userPointId: userPoint.id,
          type: 'REVIEW_REWARD',
          amount: 1000,
          balance: userPoint.balance + 1000,
          description: '베스트 리뷰 선정 보너스',
          descriptionZh: '最佳评价奖励',
        },
      });

      // 알림 전송
      await prisma.notification.create({
        data: {
          userId: review.reviewerId,
          type: 'SYSTEM',
          title: '베스트 리뷰 선정',
          message: '축하합니다! 이달의 베스트 리뷰로 선정되었습니다. 1000 포인트가 지급되었습니다.',
          link: '/mypage/reviews',
        },
      });

      selectedCount++;
    }

    console.log(`[ReviewRewardSystem] Selected ${selectedCount} best reviews for the month`);

    return {
      success: true,
      selectedCount,
    };
  } catch (error) {
    console.error('[ReviewRewardSystem] Error selecting best reviews:', error);
    return {
      success: false,
      selectedCount: 0,
    };
  }
}

/**
 * 리뷰 보상 통계
 */
export async function getReviewRewardStats(userId: string): Promise<{
  totalReviews: number;
  totalPointsEarned: number;
  qualityBreakdown: Record<ReviewQuality, number>;
  badges: string[];
}> {
  try {
    // 리뷰 개수
    const totalReviews = await prisma.review.count({
      where: { reviewerId: userId },
    });

    // 리뷰로 받은 포인트
    const pointHistory = await prisma.pointHistory.aggregate({
      where: {
        userPoint: {
          userId,
        },
        type: 'REVIEW_REWARD',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPointsEarned = pointHistory._sum.amount || 0;

    // 퀄리티별 분류 (간단한 추정)
    const qualityBreakdown: Record<ReviewQuality, number> = {
      BASIC: 0,
      DETAILED: 0,
      PREMIUM: 0,
    };

    const reviews = await prisma.review.findMany({
      where: { reviewerId: userId },
      select: {
        rating: true,
        comment: true,
        images: true,
      },
    });

    reviews.forEach((review) => {
      const quality = evaluateReviewQuality(review);
      qualityBreakdown[quality]++;
    });

    // 뱃지
    const badges: string[] = [];
    if (totalReviews >= 10) badges.push('리뷰어 브론즈');
    if (totalReviews >= 50) badges.push('리뷰어 실버');
    if (totalReviews >= 100) badges.push('리뷰어 골드');

    return {
      totalReviews,
      totalPointsEarned,
      qualityBreakdown,
      badges,
    };
  } catch (error) {
    console.error('[ReviewRewardSystem] Error getting review reward stats:', error);
    return {
      totalReviews: 0,
      totalPointsEarned: 0,
      qualityBreakdown: {
        BASIC: 0,
        DETAILED: 0,
        PREMIUM: 0,
      },
      badges: [],
    };
  }
}

/**
 * 리뷰 작성 독려 알림 (Cron Job)
 * 구매 확정 후 7일 이내 리뷰를 작성하지 않은 사용자에게 알림
 */
export async function sendReviewReminders(): Promise<{
  success: boolean;
  remindersSent: number;
}> {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    // 7~14일 전에 구매 확정했지만 리뷰를 작성하지 않은 주문
    const ordersWithoutReview = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        confirmedAt: {
          gte: fourteenDaysAgo,
          lte: sevenDaysAgo,
        },
        reviews: {
          none: {},
        },
      },
      select: {
        id: true,
        buyerId: true,
        post: {
          select: {
            title: true,
          },
        },
      },
      take: 100, // 한 번에 100개까지만
    });

    let remindersSent = 0;

    for (const order of ordersWithoutReview) {
      const user = await prisma.user.findUnique({
        where: { id: order.buyerId },
        select: { language: true },
      });

      let title, message;
      if (user?.language === 'ZH') {
        title = '留下评价获得积分';
        message = `您购买的 ${order.post.title} 还没有评价。写评价最多可获得500积分！`;
      } else if (user?.language === 'EN') {
        title = 'Write a Review and Earn Points';
        message = `Please review your purchase of ${order.post.title}. You can earn up to 500 points!`;
      } else {
        title = '리뷰 작성하고 포인트 받기';
        message = `구매하신 ${order.post.title}에 대한 리뷰를 작성해주세요. 최대 500 포인트를 받을 수 있습니다!`;
      }

      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'SYSTEM',
          title,
          message,
          link: `/reviews/create?orderId=${order.id}`,
        },
      });

      remindersSent++;
    }

    console.log(`[ReviewRewardSystem] Sent ${remindersSent} review reminders`);

    return {
      success: true,
      remindersSent,
    };
  } catch (error) {
    console.error('[ReviewRewardSystem] Error sending review reminders:', error);
    return {
      success: false,
      remindersSent: 0,
    };
  }
}
