// 앱 상수 정의

export const APP_NAME = '직구역구';
export const APP_NAME_ZH = '直购易购';
export const APP_DESCRIPTION = '한중 크로스보더 C2C 마켓플레이스';

// 수수료율
export const FEE_RATES = {
  REGULAR: 0.05, // 일반 회원 5%
  BUSINESS: 0.03, // 사업자 회원 3%
} as const;

// 최소 입찰가
export const MIN_BID_AMOUNT = 10000; // 10,000원

// 우수 뱃지 조건
export const EXCELLENT_BADGE_CRITERIA = {
  SELLER: {
    minTransactions: 50,
    minRating: 4.8,
    maxDisputeRate: 0.05,
  },
  SHIPPING: {
    minShipments: 100,
    maxDamageRate: 0.01,
    maxLossRate: 0.005,
    minOnTimeRate: 0.95,
  },
} as const;

// 주문 상태 레이블
export const ORDER_STATUS_LABELS = {
  ko: {
    PENDING_PAYMENT: '결제 대기',
    PAID: '결제 완료',
    SHIPPING: '배송 중',
    DELIVERED: '배송 완료',
    CONFIRMED: '구매 확정',
    DISPUTED: '분쟁 중',
    REFUNDED: '환불 완료',
    CANCELLED: '취소됨',
  },
  zh: {
    PENDING_PAYMENT: '待付款',
    PAID: '已付款',
    SHIPPING: '配送中',
    DELIVERED: '已送达',
    CONFIRMED: '已确认',
    DISPUTED: '争议中',
    REFUNDED: '已退款',
    CANCELLED: '已取消',
  },
} as const;

// 게시글 상태 레이블
export const POST_STATUS_LABELS = {
  ko: {
    ACTIVE: '판매중',
    SOLD_OUT: '품절',
    EXPIRED: '만료됨',
    HIDDEN: '숨김',
    DELETED: '삭제됨',
  },
  zh: {
    ACTIVE: '销售中',
    SOLD_OUT: '售罄',
    EXPIRED: '已过期',
    HIDDEN: '已隐藏',
    DELETED: '已删除',
  },
} as const;

// 사용자 유형 레이블
export const USER_TYPE_LABELS = {
  ko: {
    BUYER: '구매자',
    SELLER: '판매자',
    BOTH: '판매자/구매자',
    SHIPPING: '배송업체',
    ADMIN: '관리자',
  },
  zh: {
    BUYER: '买家',
    SELLER: '卖家',
    BOTH: '买卖家',
    SHIPPING: '物流公司',
    ADMIN: '管理员',
  },
} as const;

// 거래 방향 레이블
export const TRADE_DIRECTION_LABELS = {
  ko: {
    KR_TO_CN: '한국 → 중국',
    CN_TO_KR: '중국 → 한국',
  },
  zh: {
    KR_TO_CN: '韩国 → 中国',
    CN_TO_KR: '中国 → 韩国',
  },
} as const;

// 결제 방법 레이블
export const PAYMENT_METHOD_LABELS = {
  ko: {
    NAVER_PAY: '네이버페이',
    KAKAO_PAY: '카카오페이',
    ALIPAY: '알리페이',
    WECHAT_PAY: '위챗페이',
    PAYPAL: '페이팔',
    CREDIT_CARD: '신용카드',
  },
  zh: {
    NAVER_PAY: 'Naver Pay',
    KAKAO_PAY: 'Kakao Pay',
    ALIPAY: '支付宝',
    WECHAT_PAY: '微信支付',
    PAYPAL: 'PayPal',
    CREDIT_CARD: '信用卡',
  },
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// 파일 업로드
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 10,
} as const;

// 자동 구매 확정 일수
export const AUTO_CONFIRM_DAYS = 14;

// 분쟁 투표 기간 (일)
export const DISPUTE_VOTING_DAYS = 7;

// 광고 입찰 마감 시간 (월요일 10:00)
export const AD_BID_DEADLINE = {
  dayOfWeek: 1, // 월요일
  hour: 10,
  minute: 0,
} as const;

// API 경로
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY_PHONE: '/api/auth/verify-phone',
  },
  USERS: {
    ME: '/api/users/me',
    PROFILE: (id: string) => `/api/users/${id}`,
  },
  POSTS: {
    LIST: '/api/posts',
    DETAIL: (id: string) => `/api/posts/${id}`,
  },
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    SHIP: (id: string) => `/api/orders/${id}/ship`,
    CONFIRM: (id: string) => `/api/orders/${id}/confirm`,
  },
  PAYMENTS: {
    CREATE: '/api/payments/create',
    WEBHOOK: '/api/payments/webhook',
  },
  DISPUTES: {
    DETAIL: (id: string) => `/api/disputes/${id}`,
    VOTE: (id: string) => `/api/disputes/${id}/vote`,
  },
  SHIPPING: {
    COMPANIES: '/api/shipping/companies',
    DETAIL: (id: string) => `/api/shipping/companies/${id}`,
  },
  COMMON: {
    CATEGORIES: '/api/common/categories',
    EXCHANGE_RATE: '/api/common/exchange-rate',
    UPLOAD: '/api/common/upload',
  },
} as const;
