/**
 * 국제화(i18n) 유틸리티
 * 한국어(KO), 중국어(ZH), 영어(EN) 지원
 */

export type SupportedLanguage = 'ko' | 'zh' | 'en';

export interface TranslationKey {
  ko: string;
  zh: string;
  en: string;
}

/**
 * 공통 번역 사전
 */
export const translations = {
  // ==================== 일반 ====================
  common: {
    yes: { ko: '예', zh: '是', en: 'Yes' },
    no: { ko: '아니오', zh: '否', en: 'No' },
    confirm: { ko: '확인', zh: '确认', en: 'Confirm' },
    cancel: { ko: '취소', zh: '取消', en: 'Cancel' },
    save: { ko: '저장', zh: '保存', en: 'Save' },
    delete: { ko: '삭제', zh: '删除', en: 'Delete' },
    edit: { ko: '수정', zh: '编辑', en: 'Edit' },
    search: { ko: '검색', zh: '搜索', en: 'Search' },
    loading: { ko: '로딩 중...', zh: '加载中...', en: 'Loading...' },
    error: { ko: '오류', zh: '错误', en: 'Error' },
    success: { ko: '성공', zh: '成功', en: 'Success' },
  },

  // ==================== 네비게이션 ====================
  nav: {
    home: { ko: '홈', zh: '首页', en: 'Home' },
    products: { ko: '상품', zh: '商品', en: 'Products' },
    categories: { ko: '카테고리', zh: '分类', en: 'Categories' },
    mypage: { ko: '마이페이지', zh: '我的主页', en: 'My Page' },
    cart: { ko: '장바구니', zh: '购物车', en: 'Cart' },
    orders: { ko: '주문내역', zh: '订单历史', en: 'Orders' },
    wishlist: { ko: '찜목록', zh: '收藏夹', en: 'Wishlist' },
    notifications: { ko: '알림', zh: '通知', en: 'Notifications' },
  },

  // ==================== 사용자 ====================
  user: {
    login: { ko: '로그인', zh: '登录', en: 'Login' },
    logout: { ko: '로그아웃', zh: '登出', en: 'Logout' },
    signup: { ko: '회원가입', zh: '注册', en: 'Sign Up' },
    profile: { ko: '프로필', zh: '个人资料', en: 'Profile' },
    settings: { ko: '설정', zh: '设置', en: 'Settings' },
    password: { ko: '비밀번호', zh: '密码', en: 'Password' },
    email: { ko: '이메일', zh: '电子邮件', en: 'Email' },
    phone: { ko: '전화번호', zh: '电话号码', en: 'Phone' },
  },

  // ==================== 상품 ====================
  product: {
    title: { ko: '상품명', zh: '商品名称', en: 'Product Name' },
    price: { ko: '가격', zh: '价格', en: 'Price' },
    description: { ko: '상품설명', zh: '商品描述', en: 'Description' },
    seller: { ko: '판매자', zh: '卖家', en: 'Seller' },
    category: { ko: '카테고리', zh: '分类', en: 'Category' },
    stock: { ko: '재고', zh: '库存', en: 'Stock' },
    inStock: { ko: '재고 있음', zh: '有货', en: 'In Stock' },
    outOfStock: { ko: '품절', zh: '售罄', en: 'Out of Stock' },
    addToCart: { ko: '장바구니 담기', zh: '加入购物车', en: 'Add to Cart' },
    buyNow: { ko: '바로 구매', zh: '立即购买', en: 'Buy Now' },
    addToWishlist: { ko: '찜하기', zh: '收藏', en: 'Add to Wishlist' },
  },

  // ==================== 주문 ====================
  order: {
    orderNumber: { ko: '주문번호', zh: '订单号', en: 'Order Number' },
    orderDate: { ko: '주문일시', zh: '订单日期', en: 'Order Date' },
    orderStatus: { ko: '주문상태', zh: '订单状态', en: 'Order Status' },
    totalAmount: { ko: '총 금액', zh: '总金额', en: 'Total Amount' },
    shipping: { ko: '배송', zh: '配送', en: 'Shipping' },
    shippingAddress: { ko: '배송지', zh: '配送地址', en: 'Shipping Address' },
    trackingNumber: { ko: '운송장번호', zh: '运单号', en: 'Tracking Number' },
    deliveryDate: { ko: '배송일', zh: '配送日期', en: 'Delivery Date' },
  },

  // ==================== 결제 ====================
  payment: {
    payment: { ko: '결제', zh: '付款', en: 'Payment' },
    paymentMethod: { ko: '결제수단', zh: '付款方式', en: 'Payment Method' },
    creditCard: { ko: '신용카드', zh: '信用卡', en: 'Credit Card' },
    bankTransfer: { ko: '계좌이체', zh: '银行转账', en: 'Bank Transfer' },
    alipay: { ko: '알리페이', zh: '支付宝', en: 'Alipay' },
    wechatPay: { ko: '위챗페이', zh: '微信支付', en: 'WeChat Pay' },
    tossPay: { ko: '토스페이', zh: 'Toss Pay', en: 'Toss Pay' },
  },

  // ==================== 리뷰 ====================
  review: {
    review: { ko: '리뷰', zh: '评价', en: 'Review' },
    writeReview: { ko: '리뷰 작성', zh: '撰写评价', en: 'Write Review' },
    rating: { ko: '평점', zh: '评分', en: 'Rating' },
    comment: { ko: '후기', zh: '评论', en: 'Comment' },
    helpful: { ko: '도움이 돼요', zh: '有用', en: 'Helpful' },
    verified: { ko: '인증된 구매', zh: '已验证购买', en: 'Verified Purchase' },
  },

  // ==================== 판매자 ====================
  seller: {
    seller: { ko: '판매자', zh: '卖家', en: 'Seller' },
    sellerInfo: { ko: '판매자 정보', zh: '卖家信息', en: 'Seller Info' },
    sellerGrade: { ko: '판매자 등급', zh: '卖家等级', en: 'Seller Grade' },
    totalSales: { ko: '총 판매', zh: '总销售额', en: 'Total Sales' },
    rating: { ko: '평점', zh: '评分', en: 'Rating' },
    responseRate: { ko: '응답률', zh: '回复率', en: 'Response Rate' },
    follow: { ko: '팔로우', zh: '关注', en: 'Follow' },
    following: { ko: '팔로잉', zh: '已关注', en: 'Following' },
  },

  // ==================== 쿠폰/포인트 ====================
  reward: {
    coupon: { ko: '쿠폰', zh: '优惠券', en: 'Coupon' },
    point: { ko: '포인트', zh: '积分', en: 'Point' },
    useCoupon: { ko: '쿠폰 사용', zh: '使用优惠券', en: 'Use Coupon' },
    usePoints: { ko: '포인트 사용', zh: '使用积分', en: 'Use Points' },
    earnedPoints: { ko: '적립 포인트', zh: '已获得积分', en: 'Earned Points' },
    availablePoints: { ko: '사용 가능 포인트', zh: '可用积分', en: 'Available Points' },
  },

  // ==================== 분쟁 ====================
  dispute: {
    dispute: { ko: '분쟁', zh: '争议', en: 'Dispute' },
    createDispute: { ko: '분쟁 신청', zh: '申请争议', en: 'Create Dispute' },
    reason: { ko: '사유', zh: '理由', en: 'Reason' },
    resolution: { ko: '해결', zh: '解决方案', en: 'Resolution' },
    refund: { ko: '환불', zh: '退款', en: 'Refund' },
    replacement: { ko: '교환', zh: '更换', en: 'Replacement' },
  },

  // ==================== 알림 ====================
  notification: {
    notification: { ko: '알림', zh: '通知', en: 'Notification' },
    newOrder: { ko: '새 주문', zh: '新订单', en: 'New Order' },
    orderShipped: { ko: '배송 시작', zh: '已发货', en: 'Order Shipped' },
    orderDelivered: { ko: '배송 완료', zh: '配送完成', en: 'Order Delivered' },
    newReview: { ko: '새 리뷰', zh: '新评价', en: 'New Review' },
    newMessage: { ko: '새 메시지', zh: '新消息', en: 'New Message' },
  },

  // ==================== 에러 메시지 ====================
  error: {
    required: { ko: '필수 항목입니다', zh: '必填项', en: 'Required field' },
    invalid: { ko: '유효하지 않은 입력입니다', zh: '输入无效', en: 'Invalid input' },
    serverError: { ko: '서버 오류가 발생했습니다', zh: '服务器错误', en: 'Server error occurred' },
    notFound: { ko: '찾을 수 없습니다', zh: '未找到', en: 'Not found' },
    unauthorized: { ko: '권한이 없습니다', zh: '未授权', en: 'Unauthorized' },
    networkError: { ko: '네트워크 오류', zh: '网络错误', en: 'Network error' },
  },
};

/**
 * 번역 헬퍼 함수
 */
export function t(
  key: TranslationKey,
  lang: SupportedLanguage = 'ko'
): string {
  return key[lang] || key.ko;
}

/**
 * 중첩된 번역 객체에서 값 가져오기
 */
export function translate(
  category: keyof typeof translations,
  key: string,
  lang: SupportedLanguage = 'ko'
): string {
  const categoryObj = translations[category] as any;
  const translationObj = categoryObj?.[key];
  if (!translationObj) {
    console.warn(`Translation not found: ${String(category)}.${key}`);
    return key;
  }
  return translationObj[lang] || translationObj.ko;
}

/**
 * 브라우저 언어 감지
 */
export function detectLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'ko';
  }

  const browserLang = navigator.language.toLowerCase();

  if (browserLang.startsWith('zh')) {
    return 'zh';
  } else if (browserLang.startsWith('en')) {
    return 'en';
  } else if (browserLang.startsWith('ko')) {
    return 'ko';
  }

  return 'ko'; // 기본값
}

/**
 * 언어 변경
 */
export function setLanguage(lang: SupportedLanguage): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
    // 페이지 새로고침 또는 상태 업데이트
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  }
}

/**
 * 저장된 언어 불러오기
 */
export function getSavedLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'ko';
  }

  const saved = localStorage.getItem('language') as SupportedLanguage;
  return saved || detectLanguage();
}

/**
 * Prisma Language enum 값을 SupportedLanguage로 변환
 */
export function prismaLangToSupported(prismaLang: 'KO' | 'ZH' | 'EN'): SupportedLanguage {
  const map: Record<'KO' | 'ZH' | 'EN', SupportedLanguage> = {
    KO: 'ko',
    ZH: 'zh',
    EN: 'en',
  };
  return map[prismaLang] || 'ko';
}

/**
 * SupportedLanguage를 Prisma Language enum 값으로 변환
 */
export function supportedToPrismaLang(lang: SupportedLanguage): 'KO' | 'ZH' | 'EN' {
  const map: Record<SupportedLanguage, 'KO' | 'ZH' | 'EN'> = {
    ko: 'KO',
    zh: 'ZH',
    en: 'EN',
  };
  return map[lang];
}

/**
 * 다국어 컨텐츠 선택
 */
export function selectContent(
  content: {
    ko?: string;
    zh?: string;
    en?: string;
  },
  lang: SupportedLanguage
): string {
  return content[lang] || content.ko || content.en || '';
}

/**
 * 숫자 포맷팅 (각 언어권에 맞게)
 */
export function formatNumber(
  num: number,
  lang: SupportedLanguage = 'ko'
): string {
  const localeMap: Record<SupportedLanguage, string> = {
    ko: 'ko-KR',
    zh: 'zh-CN',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[lang]).format(num);
}

/**
 * 날짜 포맷팅 (각 언어권에 맞게)
 */
export function formatDate(
  date: Date | string,
  lang: SupportedLanguage = 'ko',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<SupportedLanguage, string> = {
    ko: 'ko-KR',
    zh: 'zh-CN',
    en: 'en-US',
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(localeMap[lang], options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(
  amount: number,
  currency: 'KRW' | 'CNY' | 'USD',
  lang: SupportedLanguage = 'ko'
): string {
  const localeMap: Record<SupportedLanguage, string> = {
    ko: 'ko-KR',
    zh: 'zh-CN',
    en: 'en-US',
  };

  return new Intl.NumberFormat(localeMap[lang], {
    style: 'currency',
    currency,
  }).format(amount);
}
