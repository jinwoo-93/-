# 직구역구 TODO 목록

> **작성일**: 2026년 2월 26일
> **코드베이스 스캔 결과**: 50+ TODO 항목 발견
> **우선순위**: 🔴 긴급 / 🟡 중요 / 🟢 낮음

---

## 📋 목차
1. [핵심 기능 TODO](#1-핵심-기능-todo)
2. [데이터베이스 스키마 추가](#2-데이터베이스-스키마-추가)
3. [외부 API 연동](#3-외부-api-연동)
4. [모니터링 및 로깅 (Phase 6)](#4-모니터링-및-로깅-phase-6)
5. [비즈니스 로직 개선](#5-비즈니스-로직-개선)

---

## 1. 핵심 기능 TODO

### 🔴 1-1. SMS 인증 실제 발송 구현
**파일**: `src/app/api/auth/send-code/route.ts`
**현황**: 콘솔 로그로만 출력 중
**필요 작업**:
```typescript
// TODO: 실제 SMS 발송 로직 구현
// await sendSMS(phone, `[직구역구] 인증번호: ${code}`);
```

**해결 방법**:
- `POST_BUSINESS_REGISTRATION_CHECKLIST.md` 2-1 참조
- 알리고 또는 阿里云 연동

---

### 🔴 1-2. 본인인증 API 연동
**파일**: `src/app/api/verify/identity/route.ts`
```typescript
// TODO: 실제 본인인증 API 연동 (NICE, 패스 등)
```

**필요 서비스**:
- **NICE 평가정보** (한국 표준)
- **패스(PASS)** 인증
- 비용: 건당 300~500원

**구현 우선순위**: 🟡 중요 (판매자 인증 시 필요)

---

### 🔴 1-3. 사업자 번호 검증 API
**파일**: `src/app/api/verify/business/route.ts`
```typescript
// TODO: 실제 국세청 API 연동
```

**필요 API**:
- 국세청 사업자등록번호 조회 API
- 무료 제공

**구현 우선순위**: 🟡 중요 (판매자 등록 시 필수)

---

### 🟡 1-4. 배송 추적 API 연동
**파일**: `src/lib/shipping-tracker.ts`
```typescript
// TODO: SmartParcel API 연동
// TODO: SF Express API 연동
```

**필요 작업**:
- SmartParcel (한국 택배 통합 API)
- SF Express (중국 배송)

**우선순위**: 🟡 중요 (배송 시작 후)

---

## 2. 데이터베이스 스키마 추가

### 🟡 2-1. User 모델에 필드 추가

**필요한 필드들**:

#### 은행 계좌 (판매자 정산용)
```prisma
model User {
  // 기존 필드...

  // TODO: 은행 계좌 정보
  bankName       String?
  accountNumber  String?
  accountHolder  String?

  // TODO: 판매자 등급 시스템
  sellerGrade    SellerGrade  @default(BRONZE)

  // TODO: 기타 필드
  birthDate      DateTime?     // 생일 쿠폰용
  lastLoginAt    DateTime?     // 비활성 사용자 감지
}

enum SellerGrade {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}
```

**관련 파일**:
- `src/app/api/seller/settings/route.ts`
- `src/app/api/seller/verification/route.ts`
- `src/app/api/seller/settlements/[yearMonth]/route.ts`
- `src/app/api/admin/settlements/route.ts`

**구현 단계**:
1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev --name add_user_fields`
3. `npx prisma generate`
4. 관련 API 수정

**우선순위**: 🟡 중요 (정산 시작 시 필수)

---

### 🟡 2-2. Post 모델에 재고 필드
```prisma
model Post {
  // 기존 필드...

  stock  Int  @default(0)  // 재고 수량
}
```

**관련 파일**: `src/app/api/payment/wechat/callback/route.ts`

**우선순위**: 🟢 낮음 (재고 관리 기능 추가 시)

---

### 🟡 2-3. Order 모델에 결제 수단 필드
```prisma
model Order {
  // 기존 필드...

  paymentMethod  PaymentMethod  @default(TOSS)
}

enum PaymentMethod {
  TOSS
  WECHAT
  ALIPAY
  CARD
}
```

**관련 파일**: `src/app/api/payment/wechat/create/route.ts`

**우선순위**: 🟢 낮음 (위챗페이 추가 시)

---

### 🟡 2-4. ShippingCompany 모델 확장
```prisma
model ShippingCompany {
  // 기존 필드...

  // TODO: 정산 관련 필드
  bankName       String?
  accountNumber  String?
  accountHolder  String?
}
```

**관련 파일**: `src/app/api/shipping/settlements/[yearMonth]/route.ts`

**우선순위**: 🟡 중요 (배송사 정산 시)

---

### 🟢 2-5. Language enum 확장
```prisma
enum Language {
  KO
  ZH
  EN  // TODO: 영어 지원 추가 시
}
```

**관련 파일**: `src/app/api/users/me/language/route.ts`

**우선순위**: 🟢 낮음 (글로벌 확장 시)

---

### 🟡 2-6. Promotion 모델 추가 (판매자 프로모션)
```prisma
model Promotion {
  id          String    @id @default(cuid())
  sellerId    String
  seller      User      @relation(fields: [sellerId], references: [id])

  name        String
  description String?
  type        PromotionType

  discountType    DiscountType
  discountValue   Decimal

  minPurchase     Decimal?
  maxDiscount     Decimal?

  startDate   DateTime
  endDate     DateTime

  targetPosts Post[]    // 적용 대상 상품

  usageLimit  Int?      // 총 사용 가능 횟수
  usageCount  Int       @default(0)

  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PromotionType {
  FIXED_AMOUNT    // 정액 할인
  PERCENTAGE      // 퍼센트 할인
  BUY_X_GET_Y    // N+1 이벤트
  FREE_SHIPPING   // 무료 배송
}
```

**관련 파일**: `src/lib/seller-promotion-system.ts`

**우선순위**: 🟢 낮음 (판매자 프로모션 기능 추가 시)

---

### 🟡 2-7. Review 모델에 좋아요 수
```prisma
model Review {
  // 기존 필드...

  likesCount  Int  @default(0)  // 좋아요 수
}
```

**관련 파일**: `src/lib/review-reward-system.ts`

**우선순위**: 🟡 중요 (리뷰 리워드 시스템 구현 시)

---

### 🟢 2-8. Cart 모델 추가 (장바구니)
```prisma
model Cart {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  items     CartItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId])
}

model CartItem {
  id       String  @id @default(cuid())
  cartId   String
  cart     Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)

  postId   String
  post     Post    @relation(fields: [postId], references: [id])

  quantity Int     @default(1)

  createdAt DateTime @default(now())
}
```

**관련 파일**: `src/lib/coupon-automation.ts`

**우선순위**: 🟢 낮음 (장바구니 기능 추가 시)

---

## 3. 외부 API 연동

### 🔴 3-1. SMS 발송 서비스
**파일**: `src/lib/sms.ts`
```typescript
// TODO: 실제 SMS 서비스 연동 필요 (예: NHN Cloud, Aligo 등)
// TODO: 실제 SMS API 연동
```

**필요 서비스**:
- 한국: 알리고, NHN Cloud
- 중국: 阿里云短信

**상세 가이드**: `POST_BUSINESS_REGISTRATION_CHECKLIST.md` 2-1

**우선순위**: 🔴 긴급

---

### 🟡 3-2. 본인 인증 (NICE, PASS)
**위치**: `src/app/api/verify/identity/route.ts`

**필요 작업**:
- NICE 평가정보 가입
- API 연동
- 테스트

**우선순위**: 🟡 중요 (판매자 인증)

---

### 🟡 3-3. 사업자 번호 검증 (국세청)
**위치**: `src/app/api/verify/business/route.ts`

**API**: 국세청 사업자등록번호 조회 API (무료)

**우선순위**: 🟡 중요

---

### 🟢 3-4. 배송 추적 (SmartParcel, SF Express)
**위치**: `src/lib/shipping-tracker.ts`

**우선순위**: 🟢 낮음 (배송 시작 후)

---

## 4. 모니터링 및 로깅 (Phase 6)

### 🟢 4-1. Sentry 연동
**관련 파일**:
- `src/app/error.tsx`
- `src/app/global-error.tsx`
- `src/app/instrumentation.ts`
- `src/components/ErrorBoundary.tsx`
- `src/lib/api-error.ts`
- `src/lib/logger.ts`

**TODO 내용**:
```typescript
// TODO: Phase 6 - Sentry Server SDK 초기화
// TODO: Phase 6에서 Sentry로 전송
```

**필요 작업**:
1. Sentry 가입 (무료 플랜)
2. `@sentry/nextjs` 설치
3. `sentry.client.config.ts`, `sentry.server.config.ts` 작성
4. 모든 TODO 항목에 `Sentry.captureException()` 추가

**우선순위**: 🟢 낮음 (프로덕션 모니터링 강화 시)

---

### 🟢 4-2. Vercel Analytics
**파일**: `src/lib/performance.ts`
```typescript
// TODO: Phase 6에서 Vercel Analytics
```

**필요 작업**:
```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**우선순위**: 🟢 낮음

---

## 5. 비즈니스 로직 개선

### 🟡 5-1. 판매자 등급 시스템 개선
**파일**: `src/lib/seller-grade-system.ts`
```typescript
// TODO: 예상 배송일 vs 실제 배송일 비교 로직 추가
// TODO: User 모델에 sellerGrade 필드 추가 필요
```

**필요 작업**:
1. User 모델에 `sellerGrade` 추가
2. 배송일 비교 로직 구현
3. 자동 등급 업데이트 cron job

**우선순위**: 🟡 중요 (판매자 관리)

---

### 🟢 5-2. 쿠폰 자동 발급
**파일**: `src/lib/coupon-automation.ts`
```typescript
// TODO: User 모델에 birthDate 필드 추가 필요
// TODO: Cart 모델 구현 필요
// TODO: User 모델에 lastLoginAt 필드 추가 필요
```

**우선순위**: 🟢 낮음 (자동화 고도화 시)

---

### 🟢 5-3. 리뷰 리워드 시스템
**파일**: `src/lib/review-reward-system.ts`
```typescript
// TODO: Review 모델에 likesCount 필드 추가 필요
```

**우선순위**: 🟢 낮음

---

### 🟢 5-4. 정산 시스템 개선
**파일**:
- `src/lib/cron/settlement.ts`
- `src/app/api/shipping/settlements/[yearMonth]/route.ts`

```typescript
// TODO: 실제 배상금 데이터를 Dispute 테이블에서 조회해야 함
// TODO: 실제 파손/분실 기록이 있다면 여기서 조회
```

**우선순위**: 🟡 중요 (정산 시작 시)

---

### 🟢 5-5. 프로모션 통계
**파일**: `src/lib/seller-promotion-system.ts`
```typescript
// TODO: PromotionView, PromotionClick 이벤트 추적 필요
```

**우선순위**: 🟢 낮음

---

### 🟡 5-6. 관리자 알림
**파일**: `src/app/api/support/route.ts`
```typescript
// TODO: 관리자에게 알림 발송
```

**필요 작업**:
- 이메일 발송 (Resend, Nodemailer)
- 슬랙/텔레그램 웹훅

**우선순위**: 🟡 중요 (고객 문의 대응)

---

### 🟢 5-7. 카테고리 페이지 API
**파일**:
- `src/app/(main)/category/[slug]/page.tsx`
- `src/app/(main)/category/[slug]/[subSlug]/page.tsx`

```typescript
// TODO: 실제 API 호출
```

**우선순위**: 🟢 낮음 (상품 많아진 후)

---

## 📊 우선순위별 요약

### 🔴 긴급 (사업자 등록 후 즉시)
1. SMS 인증 실제 구현 (`send-code`, `sms.ts`)

### 🟡 중요 (1~3개월 내)
2. 본인 인증 API 연동 (`verify/identity`)
3. 사업자 번호 검증 (`verify/business`)
4. User 모델 은행 계좌 필드 추가 (정산용)
5. Review 모델 likesCount 추가
6. 판매자 등급 시스템 개선
7. 정산 시스템 배상금 로직
8. 관리자 알림 발송
9. 배송 추적 API

### 🟢 낮음 (6개월 이후)
10. Sentry 연동
11. Vercel Analytics
12. Promotion 모델 추가
13. Cart 모델 추가
14. 쿠폰 자동 발급 고도화
15. 위챗페이 연동
16. 영어 지원

---

## 🎯 실행 계획

### 1단계: 사업자 등록 직후
- [ ] SMS 발송 구현 (알리고)
- [ ] Footer 사업자 정보 표시

### 2단계: 1개월 후
- [ ] User 모델 필드 추가 (은행 계좌, lastLoginAt)
- [ ] 본인 인증 API 연동
- [ ] 사업자 번호 검증 API

### 3단계: 3개월 후
- [ ] 판매자 등급 시스템 완성
- [ ] Review likesCount 추가
- [ ] 정산 시스템 개선
- [ ] 배송 추적 API

### 4단계: 6개월 후 (Phase 6)
- [ ] Sentry 연동
- [ ] Vercel Analytics
- [ ] Promotion 시스템
- [ ] Cart 시스템

---

**작성**: Claude Sonnet 4.5
**스캔 파일 수**: 50+ 파일
**발견된 TODO**: 50+ 항목
**분류 완료**: ✅
