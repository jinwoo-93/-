// 타입 정의

export type Language = 'ko' | 'zh';
export type Currency = 'KRW' | 'CNY';
export type Country = 'KR' | 'CN';

// 사용자 타입
export type UserType = 'BUYER' | 'SELLER' | 'BOTH' | 'SHIPPING' | 'ADMIN';

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  phoneCountry?: string | null;
  name?: string | null;
  nickname?: string | null;
  profileImage?: string | null;
  userType: UserType;
  country: Country;
  language: Language;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isBusinessVerified: boolean;
  hasExcellentBadge: boolean;
  totalSales: number;
  totalPurchases: number;
  averageRating: number;
  disputeRate: number;
  createdAt: string;
}

// 게시글 타입
export type PostType = 'SELL' | 'BUY';
export type TradeDirection = 'KR_TO_CN' | 'CN_TO_KR';
export type PostStatus = 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'HIDDEN' | 'DELETED';

export interface Post {
  id: string;
  userId: string;
  user?: User;
  postType: PostType;
  tradeDirection: TradeDirection;
  title: string;
  titleZh?: string | null;
  description: string;
  descriptionZh?: string | null;
  categoryId: string;
  category?: Category;
  priceKRW: number;
  priceCNY: number;
  originalPriceKRW?: number | null;
  originalPriceCNY?: number | null;
  quantity: number;
  images: string[];
  status: PostStatus;
  viewCount: number;
  salesCount: number;
  commentCount?: number;
  wishCount?: number;
  reorderRate: number;
  isBest?: boolean;
  isNew?: boolean;
  hasEscrow?: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

// 카테고리 타입
export interface Category {
  id: string;
  nameKo: string;
  nameZh: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  children?: Category[];
}

// 주문 타입
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'DISPUTED'
  | 'REFUNDED'
  | 'CANCELLED';

export interface ShippingAddress {
  name: string;
  phone: string;
  country: Country;
  postalCode: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  postId: string;
  post?: Post;
  buyerId: string;
  buyer?: User;
  sellerId: string;
  seller?: User;
  quantity: number;
  itemPriceKRW: number;
  itemPriceCNY: number;
  shippingFeeKRW: number;
  shippingFeeCNY: number;
  platformFeeKRW: number;
  platformFeeCNY: number;
  totalKRW: number;
  totalCNY: number;
  feeRate: number;
  shippingCompanyId?: string | null;
  shippingCompany?: ShippingCompany;
  trackingNumber?: string | null;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  preShipPhotos: string[];
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  confirmedAt?: string | null;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

// 결제 타입
export type PaymentMethod =
  | 'NAVER_PAY'
  | 'KAKAO_PAY'
  | 'ALIPAY'
  | 'WECHAT_PAY'
  | 'PAYPAL'
  | 'CREDIT_CARD';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'ESCROW_HELD'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED';

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentGateway: string;
  transactionId?: string | null;
  amountKRW: number;
  amountCNY: number;
  currency: Currency;
  status: PaymentStatus;
  escrowReleasedAt?: string | null;
  createdAt: string;
}

// 분쟁 타입
export type DisputeStatus = 'OPEN' | 'VOTING' | 'RESOLVED' | 'APPEALED';
export type VoteFor = 'BUYER' | 'SELLER';

export interface Dispute {
  id: string;
  orderId: string;
  order?: Order;
  initiatorId: string;
  initiator?: User;
  reason: string;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  votesForBuyer: number;
  votesForSeller: number;
  buyerRefundRate?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface DisputeVote {
  id: string;
  disputeId: string;
  voterId: string;
  voter?: User;
  voteFor: VoteFor;
  comment?: string | null;
  createdAt: string;
}

// 리뷰 타입
export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  reviewee?: User;
  rating: number;
  comment?: string | null;
  images: string[];
  createdAt: string;
}

// 배송업체 타입
export interface ShippingCompany {
  id: string;
  code?: string | null;
  name: string;
  nameZh: string;
  logo?: string | null;
  description?: string | null;
  businessLicenseUrl: string;
  isVerified: boolean;
  serviceRoutes: { from: Country; to: Country }[];
  pricePerKg?: number | null;
  minimumFee?: number | null;
  totalShipments: number;
  damageRate: number;
  lossRate: number;
  onTimeRate: number;
  averageRating: number;
  hasExcellentBadge: boolean;
  createdAt: string;
}

// 광고 입찰 타입
export type SlotType = 'PRODUCT' | 'SHIPPING';
export type BidStatus = 'PENDING' | 'WON' | 'LOST' | 'REFUNDED';

export interface AdSlot {
  id: string;
  categoryId: string;
  category?: Category;
  slotType: SlotType;
  position: number;
}

export interface AdBid {
  id: string;
  slotId: string;
  slot?: AdSlot;
  userId: string;
  user?: User;
  postId?: string | null;
  bidAmount: number;
  weekStart: string;
  weekEnd: string;
  status: BidStatus;
  isWinner: boolean;
  winPosition?: number | null;
  createdAt: string;
}

// 메시지 타입
export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  content: string;
  images: string[];
  isRead: boolean;
  createdAt: string;
}

// 알림 타입
export type NotificationType =
  | 'ORDER'
  | 'PAYMENT'
  | 'SHIPPING'
  | 'DISPUTE'
  | 'REVIEW'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

// 환율 타입
export interface ExchangeRate {
  fromCurrency: Currency;
  toCurrency: Currency;
  rate: number;
  updatedAt: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 폼 타입
export interface PostCreateInput {
  title: string;
  description: string;
  categoryId: string;
  priceKRW: number;
  quantity: number;
  images: string[];
  postType: PostType;
}

export interface OrderCreateInput {
  postId: string;
  quantity: number;
  shippingAddress: ShippingAddress;
  shippingCompanyId?: string;
}

export interface DisputeCreateInput {
  orderId: string;
  reason: string;
  description: string;
  evidence: string[];
}

export interface ReviewCreateInput {
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
}
