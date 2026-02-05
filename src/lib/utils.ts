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
