import admin from 'firebase-admin';
import { prisma } from './db';

// Firebase Admin 초기화
let firebaseApp: admin.app.App | null = null;

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    console.warn('[FCM] Firebase credentials not configured');
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });

    console.log('[FCM] Firebase Admin initialized');
    return firebaseApp;
  } catch (error) {
    console.error('[FCM] Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * FCM 토큰 저장
 */
export async function saveFcmToken(userId: string, fcmToken: string): Promise<boolean> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        fcmToken,
        fcmTokenUpdatedAt: new Date(),
      },
    });

    console.log(`[FCM] Token saved for user ${userId}`);
    return true;
  } catch (error) {
    console.error('[FCM] Failed to save token:', error);
    return false;
  }
}

/**
 * 단일 사용자에게 푸시 알림 전송
 */
export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const app = initializeFirebase();

  if (!app) {
    console.warn('[FCM] Firebase not initialized, skipping notification');
    return false;
  }

  try {
    // 사용자의 FCM 토큰 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) {
      console.log(`[FCM] No FCM token for user ${userId}`);
      return false;
    }

    const message: admin.messaging.Message = {
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
      data,
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    await admin.messaging().send(message);

    console.log(`[FCM] Notification sent to user ${userId}: ${title}`);
    return true;
  } catch (error) {
    console.error(`[FCM] Failed to send notification to user ${userId}:`, error);
    return false;
  }
}

/**
 * 여러 사용자에게 푸시 알림 전송
 */
export async function sendMulticastNotification(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  const app = initializeFirebase();

  if (!app) {
    console.warn('[FCM] Firebase not initialized, skipping notifications');
    return { successCount: 0, failureCount: userIds.length };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const userId of userIds) {
    const success = await sendNotification(userId, title, body, data);
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  return { successCount, failureCount };
}

// ==================== 알림 트리거 함수들 ====================

/**
 * 결제 완료 알림 (판매자에게)
 */
export async function notifyPaymentCompleted(
  sellerId: string,
  orderNumber: string,
  amount: number
): Promise<void> {
  await sendNotification(
    sellerId,
    '새 주문이 결제되었습니다',
    `주문번호 ${orderNumber}의 결제가 완료되었습니다. (₩${amount.toLocaleString()})`,
    { type: 'PAYMENT', orderNumber }
  );

  // DB 알림도 생성
  await prisma.notification.create({
    data: {
      userId: sellerId,
      type: 'PAYMENT',
      title: '새 주문이 결제되었습니다',
      message: `주문번호 ${orderNumber}의 결제가 완료되었습니다. 상품을 발송해주세요.`,
      link: `/orders`,
    },
  });
}

/**
 * 발송 시작 알림 (구매자에게)
 */
export async function notifyShipmentStarted(
  buyerId: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<void> {
  await sendNotification(
    buyerId,
    '상품이 발송되었습니다',
    trackingNumber
      ? `주문번호 ${orderNumber}이 발송되었습니다. 운송장: ${trackingNumber}`
      : `주문번호 ${orderNumber}이 발송되었습니다.`,
    { type: 'SHIPPING', orderNumber }
  );

  await prisma.notification.create({
    data: {
      userId: buyerId,
      type: 'SHIPPING',
      title: '상품이 발송되었습니다',
      message: trackingNumber
        ? `주문번호 ${orderNumber}이 발송되었습니다. 운송장: ${trackingNumber}`
        : `주문번호 ${orderNumber}이 발송되었습니다.`,
      link: `/orders`,
    },
  });
}

/**
 * 분쟁 발생 알림 (양측에게)
 */
export async function notifyDisputeCreated(
  buyerId: string,
  sellerId: string,
  orderNumber: string,
  reason: string
): Promise<void> {
  const title = '분쟁이 신청되었습니다';
  const body = `주문번호 ${orderNumber}에 분쟁이 신청되었습니다. 사유: ${reason}`;

  // 구매자와 판매자 모두에게 알림
  await Promise.all([
    sendNotification(buyerId, title, body, { type: 'DISPUTE', orderNumber }),
    sendNotification(sellerId, title, body, { type: 'DISPUTE', orderNumber }),
  ]);

  await prisma.notification.createMany({
    data: [
      {
        userId: buyerId,
        type: 'DISPUTE',
        title,
        message: body,
        link: `/disputes`,
      },
      {
        userId: sellerId,
        type: 'DISPUTE',
        title,
        message: body,
        link: `/disputes`,
      },
    ],
  });
}

/**
 * 광고 낙찰 알림
 */
export async function notifyAdWon(
  userId: string,
  categoryName: string,
  position: number,
  amount: number
): Promise<void> {
  await sendNotification(
    userId,
    '광고 낙찰 축하합니다!',
    `${categoryName} 카테고리 ${position}위 광고에 낙찰되었습니다. (₩${amount.toLocaleString()})`,
    { type: 'AD' }
  );
}

/**
 * 새 메시지 알림
 */
export async function notifyNewMessage(
  receiverId: string,
  senderNickname: string,
  messagePreview: string
): Promise<void> {
  await sendNotification(
    receiverId,
    `${senderNickname}님의 새 메시지`,
    messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    { type: 'MESSAGE' }
  );
}

/**
 * 리뷰 작성 알림
 */
export async function notifyNewReview(
  sellerId: string,
  rating: number,
  comment?: string
): Promise<void> {
  await sendNotification(
    sellerId,
    '새 리뷰가 등록되었습니다',
    `${rating}점 리뷰가 등록되었습니다.${comment ? ` "${comment.substring(0, 30)}..."` : ''}`,
    { type: 'REVIEW' }
  );
}
