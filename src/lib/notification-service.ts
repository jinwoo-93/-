/**
 * 고도화된 알림 서비스
 * 템플릿 기반 알림, 그룹화, 우선순위 관리
 */

import { prisma } from './db';
import { sendNotification } from './fcm';
import {
  generateNotification,
  getBadgeIncrement,
  type NotificationData,
  type NotificationTemplate,
} from './notification-templates';

export interface SendNotificationOptions {
  template: NotificationTemplate;
  userId: string;
  variables: Record<string, string | number>;
  link?: string;
  sendPush?: boolean; // FCM 푸시 전송 여부 (기본: true)
  saveToDb?: boolean; // DB에 저장 여부 (기본: true)
}

/**
 * 템플릿 기반 알림 전송
 */
export async function sendTemplatedNotification(
  options: SendNotificationOptions
): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> {
  try {
    const { template, userId, variables, link, sendPush = true, saveToDb = true } = options;

    // 1. 사용자 언어 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language: true, fcmToken: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // 2. 언어에 맞는 알림 생성
    const language = user.language === 'KO' ? 'ko' : user.language === 'ZH' ? 'zh' : 'en';

    const notification = generateNotification({
      template,
      language,
      variables,
      link,
    });

    // 3. 알림 설정 확인
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    const categoryKey = notification.category.toLowerCase() as
      | 'order'
      | 'payment'
      | 'shipping'
      | 'review'
      | 'dispute';

    // 푸시 알림이 활성화되어 있는지 확인
    const pushSettingKey = `push${notification.category.charAt(0).toUpperCase() + notification.category.slice(1).toLowerCase()}` as keyof typeof settings;

    const canSendPush =
      sendPush &&
      user.fcmToken &&
      settings?.pushEnabled !== false &&
      (settings?.[pushSettingKey] !== false || settings?.[pushSettingKey] === undefined);

    // 4. DB에 알림 저장
    let notificationId: string | undefined;

    if (saveToDb) {
      const dbNotification = await prisma.notification.create({
        data: {
          userId,
          type: notification.category as any,
          title: notification.title,
          message: notification.body,
          link: link || null,
          isRead: false,
        },
      });

      notificationId = dbNotification.id;
    }

    // 5. FCM 푸시 전송
    if (canSendPush) {
      await sendNotification(userId, notification.title, notification.body, {
        category: notification.category,
        priority: notification.priority,
        ...(link && { link }),
        ...(notificationId && { notificationId }),
      });
    }

    return {
      success: true,
      notificationId,
    };
  } catch (error) {
    console.error('[NotificationService] Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 여러 사용자에게 동일한 알림 전송 (대량 발송)
 */
export async function sendBulkTemplatedNotification(
  userIds: string[],
  template: NotificationTemplate,
  variables: Record<string, string | number>,
  link?: string
): Promise<{
  success: boolean;
  successCount: number;
  failureCount: number;
}> {
  const results = await Promise.allSettled(
    userIds.map((userId) =>
      sendTemplatedNotification({
        template,
        userId,
        variables,
        link,
      })
    )
  );

  const successCount = results.filter(
    (r) => r.status === 'fulfilled' && r.value.success
  ).length;
  const failureCount = results.length - successCount;

  console.log(
    `[NotificationService] Bulk send complete: ${successCount} success, ${failureCount} failed`
  );

  return {
    success: true,
    successCount,
    failureCount,
  };
}

/**
 * 알림 읽음 상태 일괄 업데이트
 */
export async function markAllAsRead(userId: string): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error('[NotificationService] Error marking all as read:', error);
    return {
      success: false,
      count: 0,
    };
  }
}

/**
 * 특정 카테고리의 알림만 읽음 처리
 */
export async function markCategoryAsRead(
  userId: string,
  category: string
): Promise<{
  success: boolean;
  count: number;
}> {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        type: category as any,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error('[NotificationService] Error marking category as read:', error);
    return {
      success: false,
      count: 0,
    };
  }
}

/**
 * 오래된 알림 자동 삭제 (90일 이상)
 */
export async function cleanupOldNotifications(): Promise<{
  success: boolean;
  deletedCount: number;
}> {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo,
        },
        isRead: true, // 읽은 알림만 삭제
      },
    });

    console.log(`[NotificationService] Cleaned up ${result.count} old notifications`);

    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error('[NotificationService] Error cleaning up notifications:', error);
    return {
      success: false,
      deletedCount: 0,
    };
  }
}

/**
 * 카테고리별 알림 개수 조회
 */
export async function getNotificationCountsByCategory(userId: string): Promise<{
  total: number;
  unread: number;
  byCategory: Record<string, { total: number; unread: number }>;
}> {
  try {
    const [total, unread, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where: { userId },
        select: { type: true, isRead: true },
      }),
    ]);

    const byCategory: Record<string, { total: number; unread: number }> = {};

    notifications.forEach((notification) => {
      const category = notification.type;

      if (!byCategory[category]) {
        byCategory[category] = { total: 0, unread: 0 };
      }

      byCategory[category].total++;
      if (!notification.isRead) {
        byCategory[category].unread++;
      }
    });

    return {
      total,
      unread,
      byCategory,
    };
  } catch (error) {
    console.error('[NotificationService] Error getting notification counts:', error);
    return {
      total: 0,
      unread: 0,
      byCategory: {},
    };
  }
}

/**
 * 알림 우선순위별 그룹화 조회
 */
export async function getGroupedNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }
): Promise<{
  high: any[];
  normal: any[];
  low: any[];
  total: number;
}> {
  const { limit = 50, offset = 0, unreadOnly = false } = options || {};

  try {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await prisma.notification.count({ where });

    // 우선순위별로 분류 (간단한 분류)
    const high = notifications.filter((n) =>
      ['PAYMENT', 'DISPUTE', 'ORDER'].includes(n.type)
    );
    const normal = notifications.filter((n) =>
      ['SHIPPING', 'REVIEW', 'SUPPORT'].includes(n.type)
    );
    const low = notifications.filter((n) => n.type === 'SYSTEM');

    return {
      high,
      normal,
      low,
      total,
    };
  } catch (error) {
    console.error('[NotificationService] Error getting grouped notifications:', error);
    return {
      high: [],
      normal: [],
      low: [],
      total: 0,
    };
  }
}

// ==================== 편의 함수들 ====================

/**
 * 주문 완료 알림
 */
export async function notifyOrderPaid(
  buyerId: string,
  productName: string,
  orderNumber: string,
  amount: number,
  link?: string
) {
  return sendTemplatedNotification({
    template: 'ORDER_PAID',
    userId: buyerId,
    variables: { productName, orderNumber, amount },
    link,
  });
}

/**
 * 상품 발송 알림
 */
export async function notifyOrderShipped(
  buyerId: string,
  productName: string,
  trackingNumber: string,
  link?: string
) {
  return sendTemplatedNotification({
    template: 'ORDER_SHIPPED',
    userId: buyerId,
    variables: { productName, trackingNumber },
    link,
  });
}

/**
 * 쿠폰 발급 알림
 */
export async function notifyCouponIssued(
  userId: string,
  couponName: string,
  expiryDate: string,
  link?: string
) {
  return sendTemplatedNotification({
    template: 'COUPON_ISSUED',
    userId,
    variables: { couponName, expiryDate },
    link,
  });
}

/**
 * 포인트 적립 알림
 */
export async function notifyPointEarned(
  userId: string,
  points: number,
  totalPoints: number,
  link?: string
) {
  return sendTemplatedNotification({
    template: 'POINT_EARNED',
    userId,
    variables: { points, totalPoints },
    link,
  });
}

/**
 * 리뷰 등록 알림
 */
export async function notifyReviewReceived(
  sellerId: string,
  reviewer: string,
  rating: number,
  link?: string
) {
  return sendTemplatedNotification({
    template: 'REVIEW_RECEIVED',
    userId: sellerId,
    variables: { reviewer, rating },
    link,
  });
}
