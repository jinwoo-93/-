# 직구역구 TODO 목록

> **작성일**: 2026년 2월 26일
> **최종 업데이트**: 2026년 2월 26일
> **코드베이스 스캔 결과**: 50+ TODO 항목 발견
> **우선순위**: 🔴 긴급 / 🟡 중요 / 🟢 낮음 / ✅ 완료

---

## 📋 목차
1. [완료된 작업](#1-완료된-작업)
2. [즉시 진행 가능한 작업](#2-즉시-진행-가능한-작업)
3. [사업자 등록 후 작업](#3-사업자-등록-후-작업)

---

## 1. 완료된 작업

### ✅ 1-1. 데이터베이스 스키마 확장
**완료일**: 2026-02-26

#### User 모델 확장 ✅
- ✅ `bankName`, `accountNumber`, `accountHolder` (정산용 은행 계좌)
- ✅ `birthDate` (생일 쿠폰용)
- ✅ `lastLoginAt` (비활성 사용자 감지)
- ✅ `sellerGrade`, `sellerScore` (이미 존재했음)

#### ShippingCompany 모델 확장 ✅
- ✅ `bankName`, `accountNumber`, `accountHolder` (배송사 정산용)

#### Review 모델 ✅
- ✅ `likesCount` (이미 존재했음)

**마이그레이션**: `npx prisma db push --accept-data-loss` 완료

---

### ✅ 1-2. Vercel Analytics 설치 및 통합
**완료일**: 2026-02-26

- ✅ `npm install @vercel/analytics`
- ✅ `src/app/layout.tsx`에 `<Analytics />` 추가
- ✅ 프로덕션 환경에서 자동 활성화

---

### ✅ 1-3. 완료된 TODO 주석 제거
**완료일**: 2026-02-26

**제거된 TODO**:
- ✅ `src/lib/review-reward-system.ts` - Review likesCount 필드 활성화
- ✅ `src/lib/seller-grade-system.ts` - sellerGrade 필드 활성화
- ✅ `src/lib/coupon-automation.ts` - birthDate, lastLoginAt 필드 활성화
- ✅ `src/app/api/seller/verification/route.ts` - 은행 계좌 필드 활성화
- ✅ `src/app/api/seller/settings/route.ts` - 은행 계좌 필드 활성화
- ✅ `src/app/api/seller/settlements/[yearMonth]/route.ts` - 은행 계좌 필드 활성화
- ✅ `src/app/api/admin/settlements/route.ts` - 은행 계좌 필드 활성화
- ✅ `src/app/api/shipping/settlements/[yearMonth]/route.ts` - 은행 계좌 필드 활성화

**활성화된 기능**:
- ✅ 베스트 리뷰 선정 시스템 (월별 자동 선정)
- ✅ 판매자 등급 자동 업데이트
- ✅ 생일 쿠폰 자동 발급
- ✅ 비활성 사용자 쿠폰 발급
- ✅ 정산 시스템 은행 계좌 정보 저장

---

### ✅ 1-4. 보안 및 인증 강화 (Steps 8-13)
**완료일**: 2026-02-23 ~ 2026-02-26

- ✅ Rate Limiting (Upstash Redis)
- ✅ HTTPS 보안 헤더 (HSTS, X-Frame-Options 등)
- ✅ Naver OAuth 통합
- ✅ 관리자 페이지 및 super admin 계정
- ✅ 이메일/비밀번호 로그인 (bcrypt)
- ✅ 환율 API 연동 (exchangerate-api.com)

---

## 2. 즉시 진행 가능한 작업

### 🟢 2-1. Post 모델에 재고 필드
```prisma
model Post {
  // 기존 필드...

  stock  Int  @default(0)  // 재고 수량
}
```

**관련 파일**: `src/app/api/payment/wechat/callback/route.ts`
**우선순위**: 🟢 낮음 (재고 관리 기능 추가 시)

---

### 🟢 2-2. Order 모델에 결제 수단 필드
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

### 🟢 2-3. Language enum 확장
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

### 🟢 2-4. Promotion 모델 추가 (판매자 프로모션)
**관련 파일**: `src/lib/seller-promotion-system.ts`
**우선순위**: 🟢 낮음 (판매자 프로모션 기능 추가 시)

---

### 🟢 2-5. Cart 모델 추가 (장바구니)
**관련 파일**: `src/lib/coupon-automation.ts`
**우선순위**: 🟢 낮음 (장바구니 기능 추가 시)

---

### 🟢 2-6. WishlistFolder 모델 구현
**관련 파일**: `src/lib/wishlist-service.ts`
**우선순위**: 🟢 낮음 (찜목록 폴더 기능 추가 시)

**현황**: WishlistFolder 모델은 이미 Prisma 스키마에 존재하지만, 서비스 로직에 TODO 주석이 있음

---

### 🟡 2-7. 판매자 등급 시스템 개선
**파일**: `src/lib/seller-grade-system.ts`

**남은 작업**:
```typescript
// TODO: 예상 배송일 vs 실제 배송일 비교 로직 추가
```

**필요 작업**:
1. Order 모델에 `estimatedDeliveryDate` 필드 추가
2. 실제 배송일과 비교하여 정시 배송률 계산
3. 자동 등급 업데이트 cron job 테스트

**우선순위**: 🟡 중요 (판매자 관리 강화)

---

### 🟡 2-8. 정산 시스템 개선
**파일**:
- `src/lib/cron/settlement.ts`
- `src/app/api/shipping/settlements/stats/route.ts`
- `src/app/api/shipping/settlements/[yearMonth]/route.ts`

**남은 작업**:
```typescript
// TODO: 실제 배상금 데이터를 Dispute 테이블에서 조회해야 함
// TODO: 실제 파손/분실 기록이 있다면 여기서 조회
```

**우선순위**: 🟡 중요 (정산 시작 시)

---

### 🟢 2-9. 관리자 알림
**파일**: `src/app/api/support/route.ts`

```typescript
// TODO: 관리자에게 알림 발송
```

**필요 작업**:
- 이메일 발송 (Resend, Nodemailer)
- 슬랙/텔레그램 웹훅

**우선순위**: 🟢 낮음 (고객 문의 대응 강화)

---

### 🟢 2-10. 카테고리 페이지 API
**파일**:
- `src/app/(main)/category/[slug]/page.tsx`
- `src/app/(main)/category/[slug]/[subSlug]/page.tsx`

```typescript
// TODO: 실제 API 호출
```

**우선순위**: 🟢 낮음 (상품 많아진 후)

---

### 🟢 2-11. 프로모션 통계
**파일**: `src/lib/seller-promotion-system.ts`

```typescript
// TODO: PromotionView, PromotionClick 이벤트 추적 필요
```

**우선순위**: 🟢 낮음

---

### 🟢 2-12. User 모델 추가 필드 (선택)
**파일**: `src/app/api/seller/settings/route.ts`

```typescript
// TODO: User 모델에 다음 필드 추가 필요:
// - introduction (판매자 소개)
// - notificationEmail, notificationOrder, notificationSettlement (알림 설정)
```

**우선순위**: 🟢 낮음 (판매자 프로필 기능 강화 시)

---

### 🟢 2-13. ShippingCompany 모델 추가 필드
**파일**: `src/app/api/shipping/settlements/[yearMonth]/route.ts`

```typescript
// TODO: ShippingCompany 모델에 businessNumber (사업자번호) 필드 추가 필요
```

**우선순위**: 🟢 낮음 (배송사 관리 강화 시)

---

### 🟢 2-14. Sentry 연동 (Phase 6)
**관련 파일**: 15개 파일에 TODO 있음
- `src/app/error.tsx`
- `src/app/global-error.tsx`
- `src/app/instrumentation.ts`
- `src/components/ErrorBoundary.tsx`
- `src/lib/api-error.ts`
- `src/lib/logger.ts`

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

## 3. 사업자 등록 후 작업

> **상세 내용**: `POST_BUSINESS_REGISTRATION_TODO.md` 참조

### 🔴 3-1. SMS 인증 실제 발송 구현
**파일**: `src/app/api/auth/send-code/route.ts`, `src/lib/sms.ts`
**현황**: 콘솔 로그로만 출력 중
**우선순위**: 🔴 필수 (회원가입 불가)

**필요 서비스**:
- 한국: 알리고 (월 5,500원~)
- 중국: 阿里云短信

---

### 🔴 3-2. Footer 사업자 정보 표시
**우선순위**: 🔴 필수 (전자상거래법 의무사항)

---

### 🔴 3-3. 통신판매업 신고
**우선순위**: 🔴 필수 (법적 의무)

---

### 🟡 3-4. 본인인증 API 연동
**파일**: `src/app/api/verify/identity/route.ts`
**현황**: Mock 데이터로 처리 중
**우선순위**: 🟡 중요 (판매자 인증)

---

### 🟡 3-5. 사업자 번호 검증 API
**파일**: `src/app/api/verify/business/route.ts`
**현황**: Mock 검증만 수행
**우선순위**: 🟡 중요 (판매자 등록)

---

### 🟡 3-6. 배송 추적 API 연동
**파일**: `src/lib/shipping-tracker.ts`
**우선순위**: 🟡 중요 (배송 시작 후)

---

## 📊 우선순위별 요약

### ✅ 완료 (2026-02-26)
1. ✅ User/ShippingCompany 모델 은행 계좌 필드
2. ✅ User 모델 birthDate, lastLoginAt 필드
3. ✅ Review likesCount 활성화
4. ✅ 판매자 등급 시스템 활성화
5. ✅ 쿠폰 자동 발급 활성화
6. ✅ Vercel Analytics 설치
7. ✅ 완료된 TODO 주석 제거

### 🔴 사업자 등록 후 즉시
1. ⬜ SMS 발송 구현 (알리고)
2. ⬜ Footer 사업자 정보 표시
3. ⬜ 통신판매업 신고

### 🟡 1~3개월 내
4. ⬜ 본인 인증 API (NICE)
5. ⬜ 사업자 번호 검증 (국세청)
6. ⬜ 배송 추적 API (SmartParcel)
7. ⬜ 판매자 등급 시스템 개선 (배송일 비교)
8. ⬜ 정산 시스템 개선 (배상금 로직)

### 🟢 6개월 이후
9. ⬜ Sentry 연동
10. ⬜ Promotion 모델 추가
11. ⬜ Cart 모델 추가
12. ⬜ 쿠폰 자동화 고도화
13. ⬜ 위챗페이 연동
14. ⬜ 영어 지원

---

## 🎯 다음 작업

### 즉시 진행 가능
- 판매자 등급 시스템 개선 (배송일 비교 로직)
- 정산 시스템 배상금 로직 구현
- 관리자 알림 시스템 (Resend)

### 사업자 등록 후
- SMS 발송 구현 (알리고 가입)
- Footer 사업자 정보 표시
- 통신판매업 신고

**상세 가이드**: `POST_BUSINESS_REGISTRATION_TODO.md` 참조

---

**작성**: Claude Sonnet 4.5
**스캔 파일 수**: 50+ 파일
**발견된 TODO**: 50+ 항목
**완료된 TODO**: 8개 주요 항목
**최종 업데이트**: 2026년 2월 26일
