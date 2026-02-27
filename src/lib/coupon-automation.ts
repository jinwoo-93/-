/**
 * 쿠폰 자동 발급 시스템
 * 조건별 자동 쿠폰 발급 및 관리
 */

import { prisma } from './db';
import { notifyCouponIssued } from './notification-service';

export type CouponTrigger =
  | 'SIGNUP' // 회원가입
  | 'FIRST_ORDER' // 첫 주문
  | 'ORDER_AMOUNT' // 주문 금액 달성
  | 'ORDER_COUNT' // 주문 횟수 달성
  | 'BIRTHDAY' // 생일
  | 'REVIEW_WRITTEN' // 리뷰 작성
  | 'SELLER_UPGRADE' // 판매자 등급 상승
  | 'REFERRAL' // 친구 추천
  | 'INACTIVE_USER' // 휴면 사용자 복귀
  | 'CART_ABANDON' // 장바구니 포기
  | 'SEASONAL'; // 시즌/이벤트

export interface AutoIssueCouponOptions {
  trigger: CouponTrigger;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * 조건에 따른 자동 쿠폰 발급
 */
export async function autoIssueCoupon(
  options: AutoIssueCouponOptions
): Promise<{
  success: boolean;
  couponsIssued: number;
  couponIds: string[];
  error?: string;
}> {
  try {
    const { trigger, userId, metadata } = options;

    // 발급 가능한 쿠폰 찾기
    const eligibleCoupons = await findEligibleCoupons(trigger, userId, metadata);

    if (eligibleCoupons.length === 0) {
      return {
        success: true,
        couponsIssued: 0,
        couponIds: [],
      };
    }

    // 쿠폰 발급
    const issuedCouponIds: string[] = [];

    for (const coupon of eligibleCoupons) {
      // 이미 발급받았는지 확인
      const existing = await prisma.userCoupon.findUnique({
        where: {
          userId_couponId: {
            userId,
            couponId: coupon.id,
          },
        },
      });

      if (existing) {
        console.log(`[CouponAutomation] User ${userId} already has coupon ${coupon.id}`);
        continue;
      }

      // 수량 확인
      if (coupon.usedQuantity >= coupon.totalQuantity) {
        console.log(`[CouponAutomation] Coupon ${coupon.id} is out of stock`);
        continue;
      }

      // 쿠폰 발급
      await prisma.userCoupon.create({
        data: {
          userId,
          couponId: coupon.id,
          status: 'AVAILABLE',
        },
      });

      // 발급 수량 증가
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          usedQuantity: {
            increment: 1,
          },
        },
      });

      issuedCouponIds.push(coupon.id);

      // 알림 전송
      const expiryDate = coupon.validUntil.toLocaleDateString('ko-KR');
      await notifyCouponIssued(userId, coupon.name, expiryDate, '/mypage/coupons');

      console.log(`[CouponAutomation] Issued coupon ${coupon.id} to user ${userId}`);
    }

    return {
      success: true,
      couponsIssued: issuedCouponIds.length,
      couponIds: issuedCouponIds,
    };
  } catch (error) {
    console.error('[CouponAutomation] Error auto issuing coupon:', error);
    return {
      success: false,
      couponsIssued: 0,
      couponIds: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 발급 가능한 쿠폰 찾기
 */
async function findEligibleCoupons(
  trigger: CouponTrigger,
  userId: string,
  metadata?: Record<string, any>
): Promise<any[]> {
  const now = new Date();

  // 기본 조건: 활성화되어 있고, 유효기간 내
  const baseWhere = {
    isActive: true,
    validFrom: {
      lte: now,
    },
    validUntil: {
      gte: now,
    },
  };

  // 트리거별 쿠폰 조회 (간단한 예시 - 실제로는 별도 AutoCouponRule 테이블 필요)
  // 현재는 쿠폰 code 네이밍 컨벤션으로 구분
  const triggerPrefix = getTriggerPrefix(trigger);

  const coupons = await prisma.coupon.findMany({
    where: {
      ...baseWhere,
      code: {
        startsWith: triggerPrefix,
      },
    },
  });

  return coupons;
}

/**
 * 트리거별 쿠폰 코드 접두사
 */
function getTriggerPrefix(trigger: CouponTrigger): string {
  const prefixMap: Record<CouponTrigger, string> = {
    SIGNUP: 'WELCOME',
    FIRST_ORDER: 'FIRST',
    ORDER_AMOUNT: 'MILESTONE',
    ORDER_COUNT: 'LOYAL',
    BIRTHDAY: 'BDAY',
    REVIEW_WRITTEN: 'REVIEW',
    SELLER_UPGRADE: 'SELLER',
    REFERRAL: 'REFER',
    INACTIVE_USER: 'COMEBACK',
    CART_ABANDON: 'CART',
    SEASONAL: 'EVENT',
  };

  return prefixMap[trigger] || 'AUTO';
}

// ==================== 트리거별 편의 함수 ====================

/**
 * 회원가입 시 쿠폰 자동 발급
 */
export async function issueSignupCoupon(userId: string) {
  return autoIssueCoupon({
    trigger: 'SIGNUP',
    userId,
  });
}

/**
 * 첫 주문 완료 시 쿠폰 자동 발급
 */
export async function issueFirstOrderCoupon(userId: string, orderAmount: number) {
  // 첫 주문인지 확인
  const orderCount = await prisma.order.count({
    where: {
      buyerId: userId,
      status: 'CONFIRMED',
    },
  });

  if (orderCount === 1) {
    return autoIssueCoupon({
      trigger: 'FIRST_ORDER',
      userId,
      metadata: { orderAmount },
    });
  }

  return {
    success: true,
    couponsIssued: 0,
    couponIds: [],
  };
}

/**
 * 주문 금액 달성 시 쿠폰 자동 발급
 */
export async function issueOrderAmountCoupon(userId: string, totalAmount: number) {
  // 누적 주문 금액 확인
  const orders = await prisma.order.aggregate({
    where: {
      buyerId: userId,
      status: 'CONFIRMED',
    },
    _sum: {
      totalKRW: true,
    },
  });

  const cumulativeAmount = orders._sum.totalKRW || 0;

  // 100만원, 500만원, 1000만원 달성 시 쿠폰 발급
  if (
    cumulativeAmount >= 1000000 ||
    cumulativeAmount >= 5000000 ||
    cumulativeAmount >= 10000000
  ) {
    return autoIssueCoupon({
      trigger: 'ORDER_AMOUNT',
      userId,
      metadata: { cumulativeAmount },
    });
  }

  return {
    success: true,
    couponsIssued: 0,
    couponIds: [],
  };
}

/**
 * 리뷰 작성 시 쿠폰 자동 발급
 */
export async function issueReviewCoupon(userId: string, reviewId: string) {
  return autoIssueCoupon({
    trigger: 'REVIEW_WRITTEN',
    userId,
    metadata: { reviewId },
  });
}

/**
 * 생일 쿠폰 자동 발급 (Cron Job으로 실행)
 */
export async function issueBirthdayCoupons() {
  try {
    // 오늘이 생일인 사용자 찾기
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    // birthDate에서 월/일이 오늘과 같은 사용자 찾기
    const allUsers = await prisma.user.findMany({
      where: {
        birthDate: {
          not: null,
        },
      },
      select: {
        id: true,
        birthDate: true,
      },
    });

    const users = allUsers.filter((user) => {
      if (!user.birthDate) return false;
      const birthDate = new Date(user.birthDate);
      return birthDate.getMonth() + 1 === month && birthDate.getDate() === day;
    });

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      const result = await autoIssueCoupon({
        trigger: 'BIRTHDAY',
        userId: user.id,
      });

      if (result.success && result.couponsIssued > 0) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(
      `[CouponAutomation] Birthday coupons issued: ${successCount} success, ${failureCount} failed`
    );

    return {
      success: true,
      successCount,
      failureCount,
    };
  } catch (error) {
    console.error('[CouponAutomation] Error issuing birthday coupons:', error);
    return {
      success: false,
      successCount: 0,
      failureCount: 0,
    };
  }
}

/**
 * 장바구니 포기 쿠폰 발급 (Cron Job으로 실행)
 * 장바구니에 상품을 담고 24시간 이상 구매하지 않은 사용자
 */
export async function issueCartAbandonCoupons() {
  try {
    // TODO: Cart 모델 구현 필요
    // 24시간 이상 장바구니에 상품이 있는 사용자 찾기
    /*
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const carts = await prisma.cart.findMany({
      where: {
        createdAt: {
          lte: oneDayAgo,
        },
        items: {
          some: {},
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    let successCount = 0;

    for (const cart of carts) {
      const result = await autoIssueCoupon({
        trigger: 'CART_ABANDON',
        userId: cart.userId,
      });

      if (result.success && result.couponsIssued > 0) {
        successCount++;
      }
    }

    console.log(`[CouponAutomation] Cart abandon coupons issued to ${successCount} users`);

    return {
      success: true,
      successCount,
    };
    */

    console.log('[CouponAutomation] Cart abandon coupon issuance skipped (Cart model not implemented)');

    return {
      success: true,
      successCount: 0,
    };
  } catch (error) {
    console.error('[CouponAutomation] Error issuing cart abandon coupons:', error);
    return {
      success: false,
      successCount: 0,
    };
  }
}

/**
 * 휴면 사용자 복귀 쿠폰 발급 (Cron Job으로 실행)
 * 30일 이상 로그인하지 않은 사용자
 */
export async function issueInactiveUserCoupons() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          lte: thirtyDaysAgo,
        },
      },
      select: { id: true },
    });

    let successCount = 0;

    for (const user of users) {
      const result = await autoIssueCoupon({
        trigger: 'INACTIVE_USER',
        userId: user.id,
      });

      if (result.success && result.couponsIssued > 0) {
        successCount++;
      }
    }

    console.log(`[CouponAutomation] Inactive user coupons issued to ${successCount} users`);

    return {
      success: true,
      successCount,
    };
  } catch (error) {
    console.error('[CouponAutomation] Error issuing inactive user coupons:', error);
    return {
      success: false,
      successCount: 0,
    };
  }
}

/**
 * 만료 임박 쿠폰 알림 (Cron Job으로 실행)
 * 3일 이내 만료 예정인 미사용 쿠폰 알림
 */
export async function notifyExpiringCoupons() {
  try {
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const expiringCoupons = await prisma.userCoupon.findMany({
      where: {
        status: 'AVAILABLE',
        coupon: {
          validUntil: {
            gte: now,
            lte: threeDaysLater,
          },
        },
      },
      include: {
        coupon: {
          select: {
            name: true,
            nameZh: true,
            validUntil: true,
          },
        },
      },
    });

    let notificationCount = 0;

    for (const userCoupon of expiringCoupons) {
      const daysLeft = Math.ceil(
        (userCoupon.coupon.validUntil.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      // 사용자 언어 확인
      const user = await prisma.user.findUnique({
        where: { id: userCoupon.userId },
        select: { language: true },
      });

      const couponName =
        user?.language === 'ZH' && userCoupon.coupon.nameZh
          ? userCoupon.coupon.nameZh
          : userCoupon.coupon.name;

      let title, message;
      if (user?.language === 'ZH') {
        title = '优惠券即将过期';
        message = `${couponName} 优惠券将在 ${daysLeft}天后过期。`;
      } else if (user?.language === 'EN') {
        title = 'Coupon Expiring Soon';
        message = `${couponName} coupon will expire in ${daysLeft} day(s).`;
      } else {
        title = '쿠폰 만료 임박';
        message = `${couponName} 쿠폰이 ${daysLeft}일 후 만료됩니다.`;
      }

      await prisma.notification.create({
        data: {
          userId: userCoupon.userId,
          type: 'COUPON',
          title,
          message,
          link: '/mypage/coupons',
        },
      });

      notificationCount++;
    }

    console.log(`[CouponAutomation] Sent ${notificationCount} expiring coupon notifications`);

    return {
      success: true,
      notificationCount,
    };
  } catch (error) {
    console.error('[CouponAutomation] Error notifying expiring coupons:', error);
    return {
      success: false,
      notificationCount: 0,
    };
  }
}
