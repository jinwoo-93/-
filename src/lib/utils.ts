import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 가격 포맷팅
export function formatPrice(price: number, currency: 'KRW' | 'CNY' = 'KRW'): string {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price);
  }
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(price);
}

// 날짜 포맷팅
export function formatDate(date: Date | string, locale: 'ko' | 'zh' = 'ko'): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// 상대 시간 표시
export function formatRelativeTime(date: Date | string, locale: 'ko' | 'zh' = 'ko'): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'ko') {
    if (days > 7) return formatDate(date, locale);
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  } else {
    if (days > 7) return formatDate(date, locale);
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (minutes > 0) return `${minutes}分钟前`;
    return '刚刚';
  }
}

// 주문 번호 생성
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// 전화번호 포맷팅
export function formatPhoneNumber(phone: string, country: 'KR' | 'CN'): string {
  const cleaned = phone.replace(/\D/g, '');
  if (country === 'KR') {
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }
  // 중국 전화번호
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

// 파일 크기 포맷팅
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 이미지 URL 유효성 검사
export function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return validExtensions.some((ext) => parsed.pathname.toLowerCase().endsWith(ext));
  } catch {
    return false;
  }
}

// 슬러그 생성
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

// 평점 계산
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

// 수수료 계산
export function calculatePlatformFee(price: number, isBusinessVerified: boolean): number {
  const feeRate = isBusinessVerified ? 0.03 : 0.05;
  return Math.round(price * feeRate);
}

// 환율 적용
export function convertCurrency(
  amount: number,
  rate: number,
  from: 'KRW' | 'CNY',
  to: 'KRW' | 'CNY'
): number {
  if (from === to) return amount;
  if (from === 'KRW' && to === 'CNY') {
    return Math.round(amount * rate * 100) / 100;
  }
  return Math.round(amount / rate);
}

// 거래 방향 정보
export type TradeDirection = 'KR_TO_CN' | 'CN_TO_KR';

export interface TradeInfo {
  direction: TradeDirection;
  icon: string;
  label: { ko: string; zh: string };
  shortLabel: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverBgColor: string;
}

export function getTradeInfo(direction: TradeDirection): TradeInfo {
  if (direction === 'KR_TO_CN') {
    return {
      direction: 'KR_TO_CN',
      icon: '🇰🇷→🇨🇳',
      label: { ko: '한국 → 중국', zh: '韩国 → 中国' },
      shortLabel: 'KR→CN',
      bgColor: 'bg-korea-500',
      textColor: 'text-white',
      borderColor: 'border-korea-500',
      hoverBgColor: 'hover:bg-korea-600',
    };
  }
  return {
    direction: 'CN_TO_KR',
    icon: '🇨🇳→🇰🇷',
    label: { ko: '중국 → 한국', zh: '中国 → 韩国' },
    shortLabel: 'CN→KR',
    bgColor: 'bg-china-500',
    textColor: 'text-white',
    borderColor: 'border-china-500',
    hoverBgColor: 'hover:bg-china-600',
  };
}

// 사용자 뱃지 정보
export type UserBadgeType = 'excellent' | 'business' | 'top' | 'new' | 'verified';

export interface UserBadgeInfo {
  type: UserBadgeType;
  label: { ko: string; zh: string };
  bgColor: string;
  textColor: string;
  icon: string;
}

export function getUserBadge(type: UserBadgeType): UserBadgeInfo {
  const badges: Record<UserBadgeType, UserBadgeInfo> = {
    excellent: {
      type: 'excellent',
      label: { ko: '우수 판매자', zh: '优秀卖家' },
      bgColor: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      textColor: 'text-white',
      icon: '⭐',
    },
    business: {
      type: 'business',
      label: { ko: '사업자 인증', zh: '企业认证' },
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: '🏢',
    },
    top: {
      type: 'top',
      label: { ko: 'TOP 셀러', zh: 'TOP卖家' },
      bgColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white',
      icon: '👑',
    },
    new: {
      type: 'new',
      label: { ko: '신규', zh: '新店' },
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: '🆕',
    },
    verified: {
      type: 'verified',
      label: { ko: '본인인증', zh: '实名认证' },
      bgColor: 'bg-teal-500',
      textColor: 'text-white',
      icon: '✓',
    },
  };
  return badges[type];
}

// 주문 상태 정보
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface OrderStatusInfo {
  status: OrderStatus;
  label: { ko: string; zh: string };
  color: string;
  bgColor: string;
  icon: string;
}

export function getOrderStatusInfo(status: OrderStatus): OrderStatusInfo {
  const statuses: Record<OrderStatus, OrderStatusInfo> = {
    PENDING_PAYMENT: {
      status: 'PENDING_PAYMENT',
      label: { ko: '결제 대기', zh: '待付款' },
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: '⏳',
    },
    PAID: {
      status: 'PAID',
      label: { ko: '결제 완료', zh: '已付款' },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '💳',
    },
    SHIPPING: {
      status: 'SHIPPING',
      label: { ko: '배송 중', zh: '配送中' },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '🚚',
    },
    DELIVERED: {
      status: 'DELIVERED',
      label: { ko: '배송 완료', zh: '已送达' },
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: '📦',
    },
    CONFIRMED: {
      status: 'CONFIRMED',
      label: { ko: '구매 확정', zh: '确认收货' },
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅',
    },
    DISPUTED: {
      status: 'DISPUTED',
      label: { ko: '분쟁 중', zh: '争议中' },
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '⚠️',
    },
    REFUNDED: {
      status: 'REFUNDED',
      label: { ko: '환불 완료', zh: '已退款' },
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '💰',
    },
    CANCELLED: {
      status: 'CANCELLED',
      label: { ko: '주문 취소', zh: '已取消' },
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      icon: '❌',
    },
  };
  return statuses[status];
}

// 공통 스타일 객체
export const styles = {
  // 카드 스타일
  card: {
    base: 'bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300',
    hover: 'hover:shadow-xl hover:border-gray-200 hover:scale-[1.01]',
    interactive: 'cursor-pointer',
  },
  // 버튼 스타일
  button: {
    primary: 'bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    secondary: 'bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:border-primary hover:text-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    korea: 'bg-korea-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-korea-600 hover:scale-[1.02] transition-all duration-200',
    china: 'bg-china-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-china-600 hover:scale-[1.02] transition-all duration-200',
    escrow: 'bg-escrow-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-escrow-600 hover:scale-[1.02] transition-all duration-200',
  },
  // 뱃지 스타일
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
    korea: 'bg-korea-500 text-white',
    china: 'bg-china-500 text-white',
    escrow: 'bg-escrow-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    outline: 'bg-white border border-gray-200 text-gray-700',
  },
  // 입력 필드 스타일
  input: {
    base: 'w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200',
    error: 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
  },
  // 섹션 스타일
  section: {
    container: 'container-app py-8',
    header: 'flex items-center justify-between mb-6',
    title: 'text-xl md:text-2xl font-bold text-gray-900',
    subtitle: 'text-sm text-gray-500 mt-1',
  },
  // 그리드 스타일
  grid: {
    products: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4',
    categories: 'grid grid-cols-4 md:grid-cols-8 gap-3',
    features: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  },
  // 가격 스타일
  price: {
    current: 'text-lg font-bold text-brand-orange',
    original: 'text-sm text-gray-400 line-through',
    discount: 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white bg-red-500',
    secondary: 'text-sm text-gray-500',
  },
  // 아이콘 버튼 스타일
  iconButton: {
    base: 'p-2 rounded-full transition-all duration-200',
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
    primary: 'bg-primary/10 text-primary hover:bg-primary/20',
  },
} as const;
