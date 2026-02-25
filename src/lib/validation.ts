/**
 * Data Validation System
 * 
 * Zod 기반 데이터 검증 시스템
 * - 타입 안전성
 * - 런타임 검증
 * - 명확한 에러 메시지
 * - 재사용 가능한 스키마
 */

import { z } from 'zod'

/**
 * 공통 검증 스키마
 */

// 한국 전화번호 (010-XXXX-XXXX)
export const phoneNumberSchema = z.string()
  .regex(/^01[0-9]-\d{4}-\d{4}$/, '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)')

// 이메일
export const emailSchema = z.string()
  .email('올바른 이메일 형식이 아닙니다')
  .min(5, '이메일은 최소 5자 이상이어야 합니다')
  .max(100, '이메일은 최대 100자까지 입력 가능합니다')

// 비밀번호 (최소 8자, 영문+숫자+특수문자)
export const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 최대 100자까지 입력 가능합니다')
  .regex(/[A-Za-z]/, '비밀번호에 영문자가 포함되어야 합니다')
  .regex(/\d/, '비밀번호에 숫자가 포함되어야 합니다')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '비밀번호에 특수문자가 포함되어야 합니다')

// URL
export const urlSchema = z.string()
  .url('올바른 URL 형식이 아닙니다')
  .max(2048, 'URL은 최대 2048자까지 입력 가능합니다')

// 가격 (양수)
export const priceSchema = z.number()
  .positive('가격은 0보다 커야 합니다')
  .max(1000000000, '가격은 최대 10억원까지 입력 가능합니다')

// 수량 (양의 정수)
export const quantitySchema = z.number()
  .int('수량은 정수여야 합니다')
  .positive('수량은 0보다 커야 합니다')
  .max(1000000, '수량은 최대 1,000,000까지 입력 가능합니다')

// 퍼센트 (0-100)
export const percentageSchema = z.number()
  .min(0, '퍼센트는 0 이상이어야 합니다')
  .max(100, '퍼센트는 100 이하여야 합니다')

// 날짜 문자열 (ISO 8601)
export const dateStringSchema = z.string()
  .datetime('올바른 날짜 형식이 아닙니다 (ISO 8601)')

// 날짜 (미래)
export const futureDateSchema = z.date()
  .refine((date) => date > new Date(), '날짜는 미래여야 합니다')

// 날짜 (과거)
export const pastDateSchema = z.date()
  .refine((date) => date < new Date(), '날짜는 과거여야 합니다')

/**
 * 사용자 검증 스키마
 */

// 사용자 이름
export const usernameSchema = z.string()
  .min(2, '사용자 이름은 최소 2자 이상이어야 합니다')
  .max(50, '사용자 이름은 최대 50자까지 입력 가능합니다')
  .regex(/^[a-zA-Z0-9가-힣_-]+$/, '사용자 이름은 영문, 한글, 숫자, -, _만 사용 가능합니다')

// 사용자 등록
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  phoneNumber: phoneNumberSchema.optional(),
  agreeToTerms: z.boolean()
    .refine((val) => val === true, '이용약관에 동의해야 합니다'),
  agreeToPrivacy: z.boolean()
    .refine((val) => val === true, '개인정보처리방침에 동의해야 합니다'),
})

// 사용자 로그인
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

// 사용자 프로필 업데이트
export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phoneNumber: phoneNumberSchema.optional(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 입력 가능합니다').optional(),
  avatar: urlSchema.optional(),
})

/**
 * 상품 검증 스키마
 */

export const productSchema = z.object({
  name: z.string()
    .min(2, '상품명은 최소 2자 이상이어야 합니다')
    .max(200, '상품명은 최대 200자까지 입력 가능합니다'),
  description: z.string()
    .min(10, '상품 설명은 최소 10자 이상이어야 합니다')
    .max(5000, '상품 설명은 최대 5000자까지 입력 가능합니다'),
  price: priceSchema,
  originalPrice: priceSchema.optional(),
  stock: quantitySchema,
  category: z.string()
    .min(1, '카테고리를 선택해주세요'),
  images: z.array(urlSchema)
    .min(1, '최소 1개의 이미지가 필요합니다')
    .max(10, '최대 10개의 이미지까지 등록 가능합니다'),
  weight: z.number()
    .positive('무게는 0보다 커야 합니다')
    .optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
})

/**
 * 주문 검증 스키마
 */

export const orderItemSchema = z.object({
  productId: z.string().uuid('올바른 상품 ID 형식이 아닙니다'),
  quantity: quantitySchema,
  price: priceSchema,
})

export const shippingAddressSchema = z.object({
  recipientName: z.string()
    .min(2, '수령인 이름은 최소 2자 이상이어야 합니다')
    .max(50, '수령인 이름은 최대 50자까지 입력 가능합니다'),
  phoneNumber: phoneNumberSchema,
  address: z.string()
    .min(5, '주소는 최소 5자 이상이어야 합니다')
    .max(200, '주소는 최대 200자까지 입력 가능합니다'),
  addressDetail: z.string()
    .max(100, '상세 주소는 최대 100자까지 입력 가능합니다')
    .optional(),
  postalCode: z.string()
    .regex(/^\d{5}$/, '올바른 우편번호 형식이 아닙니다 (5자리 숫자)'),
  city: z.string().min(1, '도시를 입력해주세요'),
  country: z.string().min(1, '국가를 입력해주세요'),
})

export const orderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, '최소 1개의 상품이 필요합니다')
    .max(100, '최대 100개의 상품까지 주문 가능합니다'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['card', 'bank_transfer', 'toss', 'kakao'], {
    errorMap: () => ({ message: '올바른 결제 방법을 선택해주세요' })
  }),
  couponCode: z.string().optional(),
})

/**
 * 리뷰 검증 스키마
 */

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number()
    .int('평점은 정수여야 합니다')
    .min(1, '평점은 최소 1점입니다')
    .max(5, '평점은 최대 5점입니다'),
  title: z.string()
    .min(2, '제목은 최소 2자 이상이어야 합니다')
    .max(100, '제목은 최대 100자까지 입력 가능합니다'),
  content: z.string()
    .min(10, '리뷰 내용은 최소 10자 이상이어야 합니다')
    .max(2000, '리뷰 내용은 최대 2000자까지 입력 가능합니다'),
  images: z.array(urlSchema)
    .max(5, '최대 5개의 이미지까지 등록 가능합니다')
    .optional(),
})

/**
 * 쿠폰 검증 스키마
 */

export const couponSchema = z.object({
  code: z.string()
    .min(4, '쿠폰 코드는 최소 4자 이상이어야 합니다')
    .max(50, '쿠폰 코드는 최대 50자까지 입력 가능합니다')
    .regex(/^[A-Z0-9-]+$/, '쿠폰 코드는 영문 대문자, 숫자, -만 사용 가능합니다'),
  discountType: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: '올바른 할인 타입을 선택해주세요' })
  }),
  discountValue: z.number()
    .positive('할인 값은 0보다 커야 합니다'),
  minPurchaseAmount: priceSchema.optional(),
  maxDiscountAmount: priceSchema.optional(),
  expiresAt: futureDateSchema,
  usageLimit: quantitySchema.optional(),
})

/**
 * 검색 검증 스키마
 */

export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, '검색어를 입력해주세요')
    .max(100, '검색어는 최대 100자까지 입력 가능합니다'),
  category: z.string().optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popular'])
    .optional(),
  page: z.number()
    .int()
    .positive()
    .default(1),
  limit: z.number()
    .int()
    .positive()
    .max(100, '페이지당 최대 100개까지 조회 가능합니다')
    .default(20),
})

/**
 * 페이지네이션 검증 스키마
 */

export const paginationSchema = z.object({
  page: z.number()
    .int('페이지는 정수여야 합니다')
    .positive('페이지는 1 이상이어야 합니다')
    .default(1),
  limit: z.number()
    .int('limit은 정수여야 합니다')
    .positive('limit은 1 이상이어야 합니다')
    .max(100, '페이지당 최대 100개까지 조회 가능합니다')
    .default(20),
})

/**
 * 검증 헬퍼 함수
 */

/**
 * 안전한 데이터 파싱
 */
export function safeParseData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * 검증 에러를 사용자 친화적 메시지로 변환
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {}
  
  error.errors.forEach((err) => {
    const path = err.path.join('.')
    formatted[path] = err.message
  })
  
  return formatted
}

/**
 * 단일 필드 검증
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  value: unknown
): { valid: true; value: T } | { valid: false; error: string } {
  const result = schema.safeParse(value)
  
  if (result.success) {
    return { valid: true, value: result.data }
  } else {
    return { valid: false, error: result.error.errors[0]?.message || 'Validation failed' }
  }
}

/**
 * 커스텀 검증 규칙
 */

// 두 필드가 일치하는지 확인 (비밀번호 확인)
export function createMatchFieldValidator(fieldName: string) {
  return z.object({
    [fieldName]: z.string(),
    [`${fieldName}Confirm`]: z.string(),
  }).refine(
    (data) => data[fieldName] === data[`${fieldName}Confirm`],
    {
      message: `${fieldName}이(가) 일치하지 않습니다`,
      path: [`${fieldName}Confirm`],
    }
  )
}

// 날짜 범위 검증
export function createDateRangeValidator() {
  return z.object({
    startDate: z.date(),
    endDate: z.date(),
  }).refine(
    (data) => data.endDate > data.startDate,
    {
      message: '종료일은 시작일보다 이후여야 합니다',
      path: ['endDate'],
    }
  )
}

// 조건부 필수 필드
export function conditionalRequired<T extends z.ZodTypeAny>(
  schema: T,
  condition: (data: any) => boolean
) {
  return z.preprocess((data) => {
    if (condition(data)) {
      return data
    }
    return schema.parse(data)
  }, schema)
}
