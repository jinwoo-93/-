import { z } from 'zod';

// 사용자 관련 스키마
export const phoneVerifySchema = z.object({
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요'),
  phoneCountry: z.enum(['KR', 'CN']),
});

export const userProfileSchema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다').max(20, '닉네임은 20자 이하여야 합니다'),
  name: z.string().min(2, '이름을 입력해주세요').optional(),
  profileImage: z.string().url('올바른 URL을 입력해주세요').optional(),
});

export const businessVerifySchema = z.object({
  businessLicenseUrl: z.string().url('사업자등록증 이미지를 업로드해주세요'),
});

// 게시글 관련 스키마
export const postCreateSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상이어야 합니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다').max(5000, '설명은 5000자 이하여야 합니다'),
  categoryId: z.string().min(1, '카테고리를 선택해주세요'),
  priceKRW: z.number().min(1000, '가격은 1,000원 이상이어야 합니다').max(100000000, '가격은 1억원 이하여야 합니다'),
  quantity: z.number().min(1, '수량은 1개 이상이어야 합니다').max(9999, '수량은 9999개 이하여야 합니다'),
  images: z.array(z.string().url()).min(1, '최소 1개의 이미지가 필요합니다').max(10, '최대 10개의 이미지만 업로드 가능합니다'),
  postType: z.enum(['SELL', 'BUY']),
});

export const postUpdateSchema = postCreateSchema.partial();

// 주문 관련 스키마
export const shippingAddressSchema = z.object({
  name: z.string().min(2, '이름을 입력해주세요'),
  phone: z.string().min(10, '전화번호를 입력해주세요'),
  country: z.enum(['KR', 'CN']),
  postalCode: z.string().min(5, '우편번호를 입력해주세요'),
  address1: z.string().min(5, '주소를 입력해주세요'),
  address2: z.string().optional(),
  city: z.string().min(2, '도시를 입력해주세요'),
  province: z.string().optional(),
});

export const orderCreateSchema = z.object({
  postId: z.string().min(1, '상품을 선택해주세요'),
  quantity: z.number().min(1, '수량은 1개 이상이어야 합니다'),
  shippingAddress: shippingAddressSchema,
  shippingCompanyId: z.string().optional(),
});

export const orderShipSchema = z.object({
  trackingNumber: z.string().min(5, '운송장 번호를 입력해주세요'),
  shippingCompanyId: z.string().min(1, '배송업체를 선택해주세요'),
  preShipPhotos: z.array(z.string().url()).min(1, '발송 전 사진을 업로드해주세요'),
});

// 분쟁 관련 스키마
export const disputeCreateSchema = z.object({
  orderId: z.string().min(1, '주문을 선택해주세요'),
  reason: z.string().min(10, '분쟁 사유를 10자 이상 입력해주세요').max(100, '분쟁 사유는 100자 이하여야 합니다'),
  description: z.string().min(50, '상세 설명을 50자 이상 입력해주세요').max(2000, '상세 설명은 2000자 이하여야 합니다'),
  evidence: z.array(z.string().url()).min(1, '최소 1개의 증거 이미지가 필요합니다').max(10, '최대 10개의 이미지만 업로드 가능합니다'),
});

export const disputeVoteSchema = z.object({
  voteFor: z.enum(['BUYER', 'SELLER']),
  comment: z.string().max(500, '의견은 500자 이하여야 합니다').optional(),
});

// 리뷰 관련 스키마
export const reviewCreateSchema = z.object({
  orderId: z.string().min(1, '주문을 선택해주세요'),
  rating: z.number().min(1, '평점을 선택해주세요').max(5, '평점은 5점 이하여야 합니다'),
  comment: z.string().max(1000, '리뷰는 1000자 이하여야 합니다').optional(),
  images: z.array(z.string().url()).max(5, '최대 5개의 이미지만 업로드 가능합니다').optional(),
});

// 광고 입찰 관련 스키마
export const adBidSchema = z.object({
  slotId: z.string().min(1, '광고 슬롯을 선택해주세요'),
  postId: z.string().optional(),
  bidAmount: z.number().min(10000, '최소 입찰가는 10,000원입니다'),
});

// 메시지 관련 스키마
export const messageCreateSchema = z.object({
  receiverId: z.string().min(1, '수신자를 선택해주세요'),
  content: z.string().min(1, '메시지를 입력해주세요').max(1000, '메시지는 1000자 이하여야 합니다'),
  images: z.array(z.string().url()).max(5, '최대 5개의 이미지만 업로드 가능합니다').optional(),
});

// 배송업체 관련 스키마
export const shippingCompanySchema = z.object({
  name: z.string().min(2, '업체명을 입력해주세요'),
  nameZh: z.string().min(2, '중국어 업체명을 입력해주세요'),
  description: z.string().max(1000, '설명은 1000자 이하여야 합니다').optional(),
  businessLicenseUrl: z.string().url('사업자등록증을 업로드해주세요'),
  serviceRoutes: z.array(z.object({
    from: z.enum(['KR', 'CN']),
    to: z.enum(['KR', 'CN']),
  })).min(1, '서비스 지역을 선택해주세요'),
  pricePerKg: z.number().min(0).optional(),
  minimumFee: z.number().min(0).optional(),
});

export const shippingReviewSchema = z.object({
  companyId: z.string().min(1, '배송업체를 선택해주세요'),
  rating: z.number().min(1).max(5),
  deliverySpeed: z.number().min(1).max(5),
  packaging: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  isDamaged: z.boolean().default(false),
  isLost: z.boolean().default(false),
  isOnTime: z.boolean().default(true),
  comment: z.string().max(500).optional(),
});

// 검색/필터 스키마
export const postFilterSchema = z.object({
  category: z.string().optional(),
  direction: z.enum(['KR_TO_CN', 'CN_TO_KR']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sort: z.enum(['latest', 'sales', 'rating', 'price_asc', 'price_desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

// 타입 추출
export type PhoneVerifyInput = z.infer<typeof phoneVerifySchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderShipInput = z.infer<typeof orderShipSchema>;
export type DisputeCreateInput = z.infer<typeof disputeCreateSchema>;
export type DisputeVoteInput = z.infer<typeof disputeVoteSchema>;
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type AdBidInput = z.infer<typeof adBidSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type ShippingCompanyInput = z.infer<typeof shippingCompanySchema>;
export type ShippingReviewInput = z.infer<typeof shippingReviewSchema>;
export type PostFilterInput = z.infer<typeof postFilterSchema>;
