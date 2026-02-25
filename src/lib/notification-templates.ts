/**
 * 알림 템플릿 시스템
 * 다국어 지원 및 일관된 알림 메시지 관리
 */

export type NotificationTemplate =
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND_PROCESSED'
  | 'DISPUTE_CREATED'
  | 'DISPUTE_RESOLVED'
  | 'REVIEW_RECEIVED'
  | 'REVIEW_REPLY'
  | 'MESSAGE_NEW'
  | 'COUPON_ISSUED'
  | 'COUPON_EXPIRING'
  | 'POINT_EARNED'
  | 'POINT_EXPIRING'
  | 'SELLER_UPGRADE'
  | 'PROMOTION_START'
  | 'PROMOTION_END'
  | 'STOCK_LOW'
  | 'SETTLEMENT_READY';

export interface NotificationData {
  template: NotificationTemplate;
  language: 'ko' | 'zh' | 'en';
  variables: Record<string, string | number>;
  priority?: 'high' | 'normal' | 'low';
  category?: string;
  link?: string;
}

interface TemplateContent {
  ko: { title: string; body: string };
  zh: { title: string; body: string };
  en: { title: string; body: string };
  priority: 'high' | 'normal' | 'low';
  category: string;
}

/**
 * 알림 템플릿 정의
 */
const TEMPLATES: Record<NotificationTemplate, TemplateContent> = {
  // ==================== 주문 관련 ====================
  ORDER_CREATED: {
    ko: {
      title: '주문이 생성되었습니다',
      body: '주문번호 {{orderNumber}}이 생성되었습니다. 결제를 완료해주세요.',
    },
    zh: {
      title: '订单已创建',
      body: '订单号 {{orderNumber}} 已创建。请完成付款。',
    },
    en: {
      title: 'Order Created',
      body: 'Order {{orderNumber}} has been created. Please complete payment.',
    },
    priority: 'normal',
    category: 'ORDER',
  },

  ORDER_PAID: {
    ko: {
      title: '결제가 완료되었습니다',
      body: '{{productName}} 주문의 결제가 완료되었습니다. ({{amount}}원)',
    },
    zh: {
      title: '付款已完成',
      body: '{{productName}} 订单的付款已完成。({{amount}}元)',
    },
    en: {
      title: 'Payment Completed',
      body: 'Payment for {{productName}} has been completed. (₩{{amount}})',
    },
    priority: 'high',
    category: 'PAYMENT',
  },

  ORDER_SHIPPED: {
    ko: {
      title: '상품이 발송되었습니다',
      body: '{{productName}}이 발송되었습니다. 운송장: {{trackingNumber}}',
    },
    zh: {
      title: '商品已发货',
      body: '{{productName}} 已发货。运单号: {{trackingNumber}}',
    },
    en: {
      title: 'Item Shipped',
      body: '{{productName}} has been shipped. Tracking: {{trackingNumber}}',
    },
    priority: 'high',
    category: 'SHIPPING',
  },

  ORDER_DELIVERED: {
    ko: {
      title: '배송이 완료되었습니다',
      body: '{{productName}}의 배송이 완료되었습니다. 구매 확정을 부탁드립니다.',
    },
    zh: {
      title: '配送已完成',
      body: '{{productName}} 的配送已完成。请确认收货。',
    },
    en: {
      title: 'Delivery Completed',
      body: '{{productName}} has been delivered. Please confirm receipt.',
    },
    priority: 'high',
    category: 'SHIPPING',
  },

  ORDER_CONFIRMED: {
    ko: {
      title: '구매가 확정되었습니다',
      body: '{{productName}} 주문의 구매가 확정되었습니다. 리뷰를 남겨주세요!',
    },
    zh: {
      title: '购买已确认',
      body: '{{productName}} 订单的购买已确认。请留下评价！',
    },
    en: {
      title: 'Purchase Confirmed',
      body: 'Purchase of {{productName}} has been confirmed. Please leave a review!',
    },
    priority: 'normal',
    category: 'ORDER',
  },

  ORDER_CANCELLED: {
    ko: {
      title: '주문이 취소되었습니다',
      body: '주문번호 {{orderNumber}}이 취소되었습니다. 환불이 진행됩니다.',
    },
    zh: {
      title: '订单已取消',
      body: '订单号 {{orderNumber}} 已取消。将进行退款。',
    },
    en: {
      title: 'Order Cancelled',
      body: 'Order {{orderNumber}} has been cancelled. Refund will be processed.',
    },
    priority: 'high',
    category: 'ORDER',
  },

  // ==================== 결제 관련 ====================
  PAYMENT_SUCCESS: {
    ko: {
      title: '결제 성공',
      body: '{{amount}}원 결제가 완료되었습니다.',
    },
    zh: {
      title: '付款成功',
      body: '{{amount}}元 付款已完成。',
    },
    en: {
      title: 'Payment Successful',
      body: 'Payment of ₩{{amount}} has been completed.',
    },
    priority: 'high',
    category: 'PAYMENT',
  },

  PAYMENT_FAILED: {
    ko: {
      title: '결제 실패',
      body: '결제에 실패했습니다. 다시 시도해주세요.',
    },
    zh: {
      title: '付款失败',
      body: '付款失败。请重试。',
    },
    en: {
      title: 'Payment Failed',
      body: 'Payment failed. Please try again.',
    },
    priority: 'high',
    category: 'PAYMENT',
  },

  REFUND_PROCESSED: {
    ko: {
      title: '환불이 완료되었습니다',
      body: '{{amount}}원이 환불 처리되었습니다. 영업일 기준 3-5일 소요됩니다.',
    },
    zh: {
      title: '退款已完成',
      body: '{{amount}}元 已退款。需要3-5个工作日。',
    },
    en: {
      title: 'Refund Processed',
      body: '₩{{amount}} has been refunded. It may take 3-5 business days.',
    },
    priority: 'high',
    category: 'PAYMENT',
  },

  // ==================== 분쟁 관련 ====================
  DISPUTE_CREATED: {
    ko: {
      title: '분쟁이 신청되었습니다',
      body: '주문번호 {{orderNumber}}에 분쟁이 신청되었습니다. 사유: {{reason}}',
    },
    zh: {
      title: '争议已申请',
      body: '订单号 {{orderNumber}} 已申请争议。理由: {{reason}}',
    },
    en: {
      title: 'Dispute Created',
      body: 'Dispute created for order {{orderNumber}}. Reason: {{reason}}',
    },
    priority: 'high',
    category: 'DISPUTE',
  },

  DISPUTE_RESOLVED: {
    ko: {
      title: '분쟁이 해결되었습니다',
      body: '분쟁이 {{resolution}} 처리되었습니다.',
    },
    zh: {
      title: '争议已解决',
      body: '争议已 {{resolution}} 处理。',
    },
    en: {
      title: 'Dispute Resolved',
      body: 'Dispute has been resolved as {{resolution}}.',
    },
    priority: 'high',
    category: 'DISPUTE',
  },

  // ==================== 리뷰 관련 ====================
  REVIEW_RECEIVED: {
    ko: {
      title: '새 리뷰가 등록되었습니다',
      body: '{{reviewer}}님이 {{rating}}점 리뷰를 남겼습니다.',
    },
    zh: {
      title: '收到新评价',
      body: '{{reviewer}} 留下了 {{rating}}星评价。',
    },
    en: {
      title: 'New Review Received',
      body: '{{reviewer}} left a {{rating}}-star review.',
    },
    priority: 'normal',
    category: 'REVIEW',
  },

  REVIEW_REPLY: {
    ko: {
      title: '판매자가 답변했습니다',
      body: '{{productName}} 리뷰에 판매자가 답변했습니다.',
    },
    zh: {
      title: '卖家已回复',
      body: '卖家已回复 {{productName}} 的评价。',
    },
    en: {
      title: 'Seller Replied',
      body: 'Seller replied to your review for {{productName}}.',
    },
    priority: 'normal',
    category: 'REVIEW',
  },

  // ==================== 메시지 ====================
  MESSAGE_NEW: {
    ko: {
      title: '새 메시지',
      body: '{{sender}}님: {{preview}}',
    },
    zh: {
      title: '新消息',
      body: '{{sender}}: {{preview}}',
    },
    en: {
      title: 'New Message',
      body: '{{sender}}: {{preview}}',
    },
    priority: 'normal',
    category: 'MESSAGE',
  },

  // ==================== 쿠폰/포인트 ====================
  COUPON_ISSUED: {
    ko: {
      title: '새 쿠폰이 발급되었습니다',
      body: '{{couponName}} 쿠폰이 발급되었습니다. {{expiryDate}}까지 사용 가능합니다.',
    },
    zh: {
      title: '新优惠券已发放',
      body: '{{couponName}} 优惠券已发放。可使用至 {{expiryDate}}。',
    },
    en: {
      title: 'New Coupon Issued',
      body: '{{couponName}} coupon has been issued. Valid until {{expiryDate}}.',
    },
    priority: 'normal',
    category: 'COUPON',
  },

  COUPON_EXPIRING: {
    ko: {
      title: '쿠폰 만료 임박',
      body: '{{couponName}} 쿠폰이 {{daysLeft}}일 후 만료됩니다.',
    },
    zh: {
      title: '优惠券即将过期',
      body: '{{couponName}} 优惠券将在 {{daysLeft}}天后过期。',
    },
    en: {
      title: 'Coupon Expiring Soon',
      body: '{{couponName}} coupon will expire in {{daysLeft}} days.',
    },
    priority: 'low',
    category: 'COUPON',
  },

  POINT_EARNED: {
    ko: {
      title: '포인트가 적립되었습니다',
      body: '{{points}}P가 적립되었습니다. 총 {{totalPoints}}P',
    },
    zh: {
      title: '积分已累积',
      body: '已累积 {{points}}积分。共 {{totalPoints}}积分',
    },
    en: {
      title: 'Points Earned',
      body: '{{points}} points earned. Total: {{totalPoints}} points',
    },
    priority: 'low',
    category: 'POINT',
  },

  POINT_EXPIRING: {
    ko: {
      title: '포인트 만료 임박',
      body: '{{points}}P가 {{expiryDate}}에 만료됩니다.',
    },
    zh: {
      title: '积分即将过期',
      body: '{{points}}积分将于 {{expiryDate}} 过期。',
    },
    en: {
      title: 'Points Expiring Soon',
      body: '{{points}} points will expire on {{expiryDate}}.',
    },
    priority: 'low',
    category: 'POINT',
  },

  // ==================== 판매자 전용 ====================
  SELLER_UPGRADE: {
    ko: {
      title: '판매자 등급 상승',
      body: '축하합니다! {{grade}} 등급으로 승급하셨습니다.',
    },
    zh: {
      title: '卖家等级提升',
      body: '恭喜！已升级至 {{grade}} 等级。',
    },
    en: {
      title: 'Seller Grade Upgraded',
      body: 'Congratulations! Upgraded to {{grade}} grade.',
    },
    priority: 'normal',
    category: 'SELLER',
  },

  PROMOTION_START: {
    ko: {
      title: '프로모션이 시작되었습니다',
      body: '{{promotionName}} 프로모션이 시작되었습니다.',
    },
    zh: {
      title: '促销活动已开始',
      body: '{{promotionName}} 促销活动已开始。',
    },
    en: {
      title: 'Promotion Started',
      body: '{{promotionName}} promotion has started.',
    },
    priority: 'normal',
    category: 'PROMOTION',
  },

  PROMOTION_END: {
    ko: {
      title: '프로모션이 종료되었습니다',
      body: '{{promotionName}} 프로모션이 종료되었습니다.',
    },
    zh: {
      title: '促销活动已结束',
      body: '{{promotionName}} 促销活动已结束。',
    },
    en: {
      title: 'Promotion Ended',
      body: '{{promotionName}} promotion has ended.',
    },
    priority: 'normal',
    category: 'PROMOTION',
  },

  STOCK_LOW: {
    ko: {
      title: '재고 부족 알림',
      body: '{{productName}}의 재고가 {{stock}}개 남았습니다.',
    },
    zh: {
      title: '库存不足提醒',
      body: '{{productName}} 库存剩余 {{stock}}件。',
    },
    en: {
      title: 'Low Stock Alert',
      body: '{{productName}} has {{stock}} items left in stock.',
    },
    priority: 'normal',
    category: 'SELLER',
  },

  SETTLEMENT_READY: {
    ko: {
      title: '정산 준비 완료',
      body: '{{month}}월 정산금 {{amount}}원이 준비되었습니다.',
    },
    zh: {
      title: '结算已准备',
      body: '{{month}}月结算金额 {{amount}}元 已准备。',
    },
    en: {
      title: 'Settlement Ready',
      body: 'Settlement for {{month}} (₩{{amount}}) is ready.',
    },
    priority: 'high',
    category: 'SELLER',
  },
};

/**
 * 템플릿으로부터 알림 메시지 생성
 */
export function generateNotification(data: NotificationData): {
  title: string;
  body: string;
  priority: 'high' | 'normal' | 'low';
  category: string;
} {
  const template = TEMPLATES[data.template];

  if (!template) {
    throw new Error(`Unknown notification template: ${data.template}`);
  }

  const lang = data.language || 'ko';
  const content = template[lang];

  // 변수 치환
  let title = content.title;
  let body = content.body;

  Object.entries(data.variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    title = title.replace(new RegExp(placeholder, 'g'), String(value));
    body = body.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return {
    title,
    body,
    priority: data.priority || template.priority,
    category: data.category || template.category,
  };
}

/**
 * 알림 우선순위에 따른 배지 카운트 증가량
 */
export function getBadgeIncrement(priority: 'high' | 'normal' | 'low'): number {
  switch (priority) {
    case 'high':
      return 1; // 중요 알림은 배지 +1
    case 'normal':
      return 1; // 일반 알림도 배지 +1
    case 'low':
      return 0; // 낮은 우선순위는 배지 없음
    default:
      return 1;
  }
}

/**
 * 알림 그룹화 키 생성
 * 같은 카테고리의 알림을 그룹화
 */
export function getGroupKey(category: string, userId: string): string {
  return `${userId}:${category}`;
}
