# 직구역구 프로젝트 작업 일지

## 📅 2024년 작업 내역

### ✅ 완료된 작업 (우선순위별)

---

## 🔴 1주차 - 치명적 문제 해결 (완료)

### 1. 상품 수정 페이지 생성
**파일**: `/src/app/(main)/posts/[id]/edit/page.tsx` (새로 생성)

**구현 내용**:
- 상품 등록 페이지(`create/page.tsx`)를 기반으로 수정 페이지 생성
- 기존 상품 데이터 자동 로드 및 폼 채우기
- 본인 게시글 확인 로직 (userId 검증)
- 이미지 업로드, 카테고리, 가격, 수량, 배송 설정 모두 수정 가능
- API 연동: `PATCH /api/posts/[id]` (이미 구현되어 있었음)

**주요 코드**:
```typescript
// 게시글 로드
const post = data.data;
if (post.userId !== user?.id) {
  toast({ title: '수정 권한이 없습니다' });
  router.push(`/posts/${postId}`);
  return;
}

// 폼 자동 채우기
setValue('title', post.title);
setValue('description', post.description);
setImages(post.images || []);
setSelectedCompanyId(post.shippingCompanyId);
```

---

### 2. 사전 배송 사진 업로드 기능 정리
**파일**: `/src/app/(main)/orders/[id]/page.tsx` (수정)

**작업 내용**:
- `ShippingManager` 컴포넌트가 이미 완벽하게 구현되어 있었음
- 불필요한 `handleShip` 함수 제거 (88줄의 TODO 주석 포함)
- 사용하지 않는 state 제거: `trackingNumber`, `isShipping`
- 사용하지 않는 import 제거: `Input`, `Avatar`, `Camera`, `ChevronRight`

**ShippingManager 컴포넌트** (`/src/components/order/ShippingManager.tsx`):
- Cloudflare R2 업로드 (`purpose: 'preShipPhoto'`)
- 최대 5장 업로드 가능
- 분쟁 시 증거자료로 활용
- API: `PATCH /api/orders/[id]/ship` with `preShipPhotos` array

---

### 3. 위챗 로그인 버튼 제거
**파일들**:
- `/src/app/(auth)/login/page.tsx`
- `/src/app/(auth)/register/page.tsx`

**변경 내용**:
- 위챗 소셜 로그인 버튼 삭제 (112-117줄)
- 회원가입 페이지에서도 WeChat 버튼 삭제
- NextAuth providers에 WeChat 설정이 없어 작동하지 않던 버튼

**변경 전**:
```tsx
<button onClick={() => handleSocialLogin('wechat')}>微信登录</button>
```
**변경 후**: 버튼 완전 삭제

---

### 4. 배송업체 주문 관리 페이지 생성
**새로 생성한 파일들**:
- `/src/app/(shipping)/shipping/orders/page.tsx` (프론트엔드)
- `/src/app/api/shipping/orders/route.ts` (API)

**기능**:
- 배송업체에 배정된 주문만 조회 (`shippingCompanyId` 필터)
- 상태별 통계 카드 (전체/결제완료/배송중/배송완료)
- 검색 기능: 주문번호, 구매자, 상품명, 운송장번호
- 상태 필터: 전체, PAID, SHIPPING, DELIVERED, CONFIRMED
- 배송지 정보 표시 (이름, 전화번호, 주소)
- 주문 상세보기 링크

**API 로직**:
```typescript
// 배송업체 확인
const shippingCompany = await prisma.shippingCompany.findUnique({
  where: { userId: session.user.id },
});

// 해당 업체 주문만 조회
const orders = await prisma.order.findMany({
  where: {
    shippingCompanyId: shippingCompany.id,
    status: { in: ['PAID', 'SHIPPING', 'DELIVERED', 'CONFIRMED'] },
  },
});
```

---

### 5. 배송업체 정산 페이지 생성
**새로 생성한 파일들**:
- `/src/app/(shipping)/shipping/settlements/page.tsx` (프론트엔드)
- `/src/app/api/shipping/settlements/route.ts` (API)
- `/src/app/api/shipping/settlements/stats/route.ts` (통계 API)

**기능**:
- 연도별 월별 정산 내역 조회
- 통계 카드: 총 주문 건수, 총 수익, 공제액, 순 정산액
- 정산 상태: PENDING (정산 대기), CONFIRMED (승인 완료), PAID (지급 완료)
- 정산 일정: 매월 말일 기준 익월 15일 지급
- PDF 다운로드 버튼 (TODO: 구현 필요)

**정산 계산 로직**:
```typescript
// 해당 월의 배송 완료 주문 조회
const orders = await prisma.order.findMany({
  where: {
    shippingCompanyId: shippingCompany.id,
    status: { in: ['SHIPPING', 'DELIVERED', 'CONFIRMED'] },
    shippedAt: { gte: startDate, lte: endDate },
  },
});

// 총 수익 = 배송료 합계
const totalRevenue = orders.reduce((sum, order) => sum + order.shippingFeeKRW, 0);
```

---

### 6. 필터/정렬 기능 구현 (상품 목록)
**파일**: `/src/app/(main)/posts/page.tsx` (대규모 수정)

**추가된 기능**:
1. **정렬 옵션**:
   - 최신순 (recent → latest)
   - 낮은 가격순 (price-low → price_asc)
   - 높은 가격순 (price-high → price_desc)
   - 인기순 (popular → sales)

2. **가격 필터**:
   - 최소 가격 (priceMin → minPrice)
   - 최대 가격 (priceMax → maxPrice)

3. **UI 개선**:
   - 필터 모달 (모바일 하단 슬라이드, 데스크톱 중앙)
   - 적용된 필터 뱃지 표시 (X 버튼으로 개별 제거)
   - 필터 초기화 버튼

**API 파라미터 매핑**:
```typescript
const sortMapping: Record<string, string> = {
  'recent': 'latest',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  'popular': 'sales',
};
```

**기존 API 활용**:
- `/src/app/api/posts/route.ts`는 이미 `minPrice`, `maxPrice`, `sort` 파라미터 지원
- 프론트엔드에서 파라미터명만 맞춰서 전송

---

### 7. 판매자 정산 API 구현
**새로 생성한 파일**:
- `/src/app/api/seller/settlements/route.ts`

**수정한 파일**:
- `/src/app/(seller)/seller/settlements/page.tsx`

**API 기능**:
- `GET /api/seller/settlements?year=2024` → 연도별 월별 정산 요약
- `GET /api/seller/settlements?year=2024&month=12` → 특정 월 상세 내역

**정산 계산 로직**:
```typescript
// 구매 확정/배송 완료 주문만 정산 대상
const orders = await prisma.order.findMany({
  where: {
    sellerId: session.user.id,
    status: { in: ['CONFIRMED', 'DELIVERED'] },
    confirmedAt: { gte: startDate, lte: endDate },
  },
});

const totalRevenue = orders.reduce((sum, order) => sum + order.totalKRW, 0);
const platformFee = orders.reduce((sum, order) => sum + order.platformFeeKRW, 0); // 5%
const netAmount = totalRevenue - platformFee;
```

**정산 상태 자동 판정**:
- `익월 15일 이전`: PENDING (정산 대기)
- `익월 15일 이후`: PAID (지급 완료)

---

## 📋 전체 프로젝트 현황

### ✅ 완성된 주요 페이지

#### 구매자 (buyer)
- ✅ 상품 목록 (`/posts`) - **필터/정렬 완성**
- ✅ 상품 상세 (`/posts/[id]`)
- ✅ 장바구니 (`/cart`)
- ✅ 주문 내역 (`/orders`, `/orders/[id]`)
- ✅ Q&A, 리뷰, 분쟁

#### 판매자 (seller)
- ✅ 상품 등록 (`/posts/create`)
- ✅ **상품 수정 (`/posts/[id]/edit`)** ← 새로 완성
- ✅ 상품 관리 (`/seller/products`)
- ✅ 주문 관리 (`/seller/orders`)
- ✅ **정산 내역 (`/seller/settlements`)** ← API 완성
- ✅ 대시보드 (`/seller/dashboard`)
- ⚠️ 통계 (`/seller/statistics`) - 링크만 있고 페이지 없음
- ⚠️ 설정 (`/seller/settings`) - 링크만 있고 페이지 없음

#### 배송업체 (shipping)
- ✅ 업체 등록 (`/shipping/register`)
- ✅ 대시보드 (`/shipping/dashboard`)
- ✅ **주문 관리 (`/shipping/orders`)** ← 새로 완성
- ✅ **정산 내역 (`/shipping/settlements`)** ← 새로 완성

#### 관리자 (admin)
- ✅ 사용자 관리 (`/admin/users`)
- ✅ 분쟁 해결 (`/admin/disputes`)
- ✅ 쿠폰 관리 (`/admin/coupons`)
- ✅ 고객 지원 (`/admin/support`)
- ✅ 배송업체 승인 (`/admin/shipping`)
- ⚠️ 상품 관리 (`/admin/posts`) - 링크만 있고 페이지 없음

---

## 🔧 주요 API 엔드포인트

### 상품 (Posts)
- `GET /api/posts` - 목록 조회 (필터/정렬 지원)
- `GET /api/posts/[id]` - 상세 조회
- `POST /api/posts` - 상품 등록
- `PATCH /api/posts/[id]` - 상품 수정
- `DELETE /api/posts/[id]` - 상품 삭제

### 주문 (Orders)
- `GET /api/orders` - 주문 목록
- `GET /api/orders/[id]` - 주문 상세
- `PATCH /api/orders/[id]/ship` - 발송 처리 (preShipPhotos 포함)
- `PATCH /api/orders/[id]/confirm` - 구매 확정

### 정산 (Settlements)
- `GET /api/seller/settlements?year=2024` - 판매자 정산 (월별 요약)
- `GET /api/seller/settlements?year=2024&month=12` - 판매자 정산 (상세)
- `GET /api/shipping/settlements?year=2024` - 배송업체 정산
- `GET /api/shipping/settlements/stats?year=2024` - 배송업체 통계

### 배송업체 (Shipping)
- `GET /api/shipping/orders` - 배송업체 주문 조회
- `GET /api/shipping/companies` - 배송업체 목록

---

## 🐛 알려진 문제 & TODO

### 🔴 치명적 (배포 전 필수)
1. ❌ **알리페이 환경변수 미설정**
   - `.env`: `ALIPAY_APP_ID`, `ALIPAY_PRIVATE_KEY` 필요
   - 파일: `/src/lib/payment/alipay.ts`

2. ❌ **SMS 인증 미설정**
   - CoolSMS (한국): `COOLSMS_API_KEY`, `COOLSMS_API_SECRET`
   - Aliyun SMS (중국): `ALIYUN_ACCESS_KEY_ID`, `ALIYUN_ACCESS_KEY_SECRET`
   - 현재 개발 모드에서 "123456" 테스트 코드만 작동

3. ❌ **위챗페이 미구현**
   - 버튼만 있고 실제 결제 로직 없음
   - 필요시 `/src/lib/payment/wechatpay.ts` 생성 필요

### ⚠️ 중요 (운영 개선)
4. ⚠️ **사이드바 링크만 있는 페이지들**
   - `/seller/statistics` - 통계 페이지
   - `/seller/settings` - 설정 페이지
   - `/admin/posts` - 관리자 상품 관리

5. ⚠️ **정산 내역서 PDF 다운로드 미구현**
   - 판매자 정산 페이지: 259줄
   - 배송업체 정산 페이지: alert 메시지만 표시

6. ⚠️ **배송 추적 API 미연동**
   - SmartParcel, SF Express API TODO
   - 현재 더미 데이터 반환 (`/src/app/api/shipping/track/route.ts`)

### 🟡 선택 (Nice-to-Have)
7. 🟡 중국인 판매자 인증 지원 (현재 한국 양식만)
8. 🟡 중국 관세 정보 추가
9. 🟡 위챗 공유 기능
10. 🟡 실시간 환율 연동

---

## 📦 프로젝트 구조

```
jikguyeokgu/
├── src/
│   ├── app/
│   │   ├── (main)/              # 메인 사이트
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx          # 목록 (필터/정렬 완성)
│   │   │   │   ├── create/page.tsx   # 등록
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # 상세
│   │   │   │       └── edit/page.tsx # 수정 ✨ NEW
│   │   │   ├── cart/page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx     # 수정됨 (사진 업로드 정리)
│   │   │
│   │   ├── (seller)/            # 판매자 센터
│   │   │   └── seller/
│   │   │       ├── products/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── settlements/page.tsx  # 수정됨 (API 연동)
│   │   │       ├── statistics/          # ⚠️ TODO
│   │   │       └── settings/            # ⚠️ TODO
│   │   │
│   │   ├── (shipping)/          # 배송업체 센터
│   │   │   └── shipping/
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── register/page.tsx
│   │   │       ├── orders/page.tsx      # ✨ NEW
│   │   │       └── settlements/page.tsx # ✨ NEW
│   │   │
│   │   ├── (admin)/             # 관리자 센터
│   │   │   └── admin/
│   │   │       ├── users/page.tsx
│   │   │       ├── disputes/page.tsx
│   │   │       ├── coupons/page.tsx
│   │   │       ├── support/page.tsx
│   │   │       ├── shipping/page.tsx
│   │   │       └── posts/               # ⚠️ TODO
│   │   │
│   │   ├── (auth)/              # 인증
│   │   │   ├── login/page.tsx       # 수정됨 (위챗 제거)
│   │   │   └── register/page.tsx    # 수정됨 (위챗 제거)
│   │   │
│   │   └── api/                 # API 엔드포인트
│   │       ├── posts/
│   │       │   ├── route.ts         # GET (필터링 지원)
│   │       │   └── [id]/route.ts    # PATCH (수정 API)
│   │       ├── orders/
│   │       │   └── [id]/ship/route.ts  # PATCH (사진 업로드)
│   │       ├── seller/
│   │       │   └── settlements/route.ts  # ✨ NEW
│   │       └── shipping/
│   │           ├── orders/route.ts       # ✨ NEW
│   │           └── settlements/
│   │               ├── route.ts          # ✨ NEW
│   │               └── stats/route.ts    # ✨ NEW
│   │
│   └── components/
│       ├── common/
│       │   └── Header.tsx           # 수정됨 (위챗 제거)
│       ├── order/
│       │   └── ShippingManager.tsx  # 사진 업로드 완성
│       └── posts/
│           └── PostCard.tsx
```

---

## 🎯 다음 작업 추천 (선택)

### Option 1: 배포 준비
1. 환경변수 설정 (알리페이, SMS)
2. 실제 테스트 진행
3. 버그 수정

### Option 2: 관리자 기능 완성
1. `/admin/posts` 페이지 생성 (상품 관리)
2. 부적절 상품 숨김 처리
3. 상품 통계

### Option 3: 판매자 기능 완성
1. `/seller/statistics` 페이지 (상세 통계)
2. `/seller/settings` 페이지 (계좌 정보)
3. 정산 내역서 PDF 다운로드

---

## 💾 데이터베이스 스키마 (주요)

### Post (상품)
```prisma
model Post {
  id              String
  userId          String
  postType        PostType      // SELL, BUY
  tradeDirection  TradeDirection // KR_TO_CN, CN_TO_KR
  title           String
  titleZh         String?
  description     String
  descriptionZh   String?
  categoryId      String
  priceKRW        Int
  priceCNY        Float
  quantity        Int
  images          String[]
  status          PostStatus    // ACTIVE, SOLD_OUT, DELETED
  shippingCompanyId       String?
  shippingFeeType         ShippingFeeType?  // BUYER_PAYS, FREE, CONDITIONAL_FREE
  shippingFeeAmount       Int?
  freeShippingThreshold   Int?
}
```

### Order (주문)
```prisma
model Order {
  id                String
  orderNumber       String   @unique
  buyerId           String
  sellerId          String
  postId            String
  status            OrderStatus  // PENDING_PAYMENT, PAID, SHIPPING, DELIVERED, CONFIRMED
  quantity          Int
  totalKRW          Int
  totalCNY          Float
  platformFeeKRW    Int      // 5%
  shippingFeeKRW    Int
  shippingCompanyId String?
  trackingNumber    String?
  preShipPhotos     String[] // ✨ 사전 배송 사진
  paidAt            DateTime?
  shippedAt         DateTime?
  deliveredAt       DateTime?
  confirmedAt       DateTime?
}
```

---

## 🔑 주요 환경변수

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OAuth (소셜 로그인)
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NAVER_CLIENT_ID="..."
NAVER_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Payment (결제)
TOSS_CLIENT_KEY="..."
TOSS_SECRET_KEY="..."
ALIPAY_APP_ID="..."           # ❌ TODO
ALIPAY_PRIVATE_KEY="..."      # ❌ TODO

# SMS (인증)
COOLSMS_API_KEY="..."         # ❌ TODO (한국)
COOLSMS_API_SECRET="..."      # ❌ TODO
ALIYUN_ACCESS_KEY_ID="..."    # ❌ TODO (중국)
ALIYUN_ACCESS_KEY_SECRET="..." # ❌ TODO

# Storage (Cloudflare R2)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="..."

# Translation
GOOGLE_TRANSLATE_API_KEY="..."
```

---

## 📝 코딩 컨벤션

### 파일 명명 규칙
- 페이지: `page.tsx` (Next.js App Router)
- 컴포넌트: `PascalCase.tsx`
- API: `route.ts`
- 훅: `use*.ts`

### 코드 스타일
- TypeScript strict mode
- Tailwind CSS
- Prisma ORM
- Zustand (상태 관리)

### 다국어 지원
- 한국어 (`ko`)
- 중국어 간체 (`zh`)
- `useLanguage()` 훅 사용
- 모든 UI 텍스트 이중 언어

---

## 🧪 테스트 체크리스트

### 구매자 플로우
- [ ] 상품 검색 및 필터링 ✨ NEW
- [ ] 장바구니 담기
- [ ] 주문하기
- [ ] 결제 (토스, 알리페이)
- [ ] 배송 추적
- [ ] 구매 확정
- [ ] 리뷰 작성

### 판매자 플로우
- [ ] 상품 등록
- [ ] 상품 수정 ✨ NEW
- [ ] 주문 확인
- [ ] 배송 처리 (사진 업로드) ✨ NEW
- [ ] 정산 확인 ✨ NEW

### 배송업체 플로우
- [ ] 업체 등록
- [ ] 주문 조회 ✨ NEW
- [ ] 정산 확인 ✨ NEW

---

**마지막 업데이트**: 2024년 (작업 완료)
**작업자**: Claude Code
**다음 작업 시작 전 확인사항**: 위의 TODO 항목들 확인
