# 🔍 직구역구 기능별 점검 체크리스트

## ✅ 1. 인증 시스템 (완료)

### 회원 로그인 (/login)
- ✅ 소셜 로그인 (카카오, 네이버, 구글)
- ✅ 로딩 상태 표시
- ✅ 에러 처리
- ✅ 리다이렉트 처리
- ❌ 전화번호 로그인 (제거됨 - SMS API 미구현)

### 관리자 로그인 (/admin-login)
- ✅ 소셜 로그인 (구글, 네이버, 카카오)
- ✅ 로딩 상태 표시
- ✅ 관리자 권한 확인
- ❌ 이메일/비밀번호 로그인 (제거됨)

### 회원가입 (/register)
- 📝 확인 필요

---

## 📋 2. 주요 기능 점검

### 2.1 사용자 기능

#### 게시글 (Posts)
- 📁 `/posts` - 게시글 목록
- 📁 `/posts/[id]` - 게시글 상세
- 📁 `/posts/create` - 게시글 작성
- 📁 `/posts/[id]/edit` - 게시글 수정
- 🔌 API: `GET /api/posts`, `POST /api/posts`, `PATCH /api/posts/[id]`

#### 구매 요청 (Purchase Requests)
- 📁 `/purchase-requests` - 구매 요청 목록
- 📁 `/purchase-requests/[id]` - 구매 요청 상세
- 📁 `/purchase-requests/create` - 구매 요청 작성
- 🔌 API: `/api/purchase-requests/*`

#### 주문 (Orders)
- 📁 `/orders` - 주문 목록
- 📁 `/orders/[id]` - 주문 상세
- 📁 `/checkout` - 주문 결제
- 🔌 API: `/api/orders/*`

#### 결제 (Payments)
- 📁 `/payment/success` - 결제 성공
- 📁 `/payment/fail` - 결제 실패
- 🔌 API: `/api/payments/toss/*`, `/api/payments/alipay/*`
- 💳 토스페이먼츠 연동
- 💳 Alipay 연동

#### 메시지 (Messages)
- 📁 `/messages` - 메시지 목록
- 📁 `/messages/[userId]` - 1:1 채팅
- 🔌 API: `/api/messages`, `/api/messages/[userId]`
- 📡 Pusher 실시간 연동

#### 장바구니 (Cart)
- 📁 `/cart` - 장바구니
- 🔌 API 확인 필요

#### 마이페이지 (MyPage)
- 📁 `/mypage` - 대시보드
- 📁 `/mypage/orders` - 주문 내역
- 📁 `/mypage/sales` - 판매 내역
- 📁 `/mypage/coupons` - 쿠폰함
- 📁 `/mypage/points` - 포인트
- 📁 `/mypage/wishlist` - 찜 목록
- 📁 `/mypage/following` - 팔로잉
- 📁 `/mypage/reviews` - 리뷰 관리
- 📁 `/mypage/settings` - 설정

### 2.2 판매자 기능

#### 판매자 대시보드
- 📁 `/seller/dashboard` - 판매 대시보드
- 📁 `/seller/products` - 상품 관리
- 📁 `/seller/orders` - 주문 관리
- 📁 `/seller/settlements` - 정산 관리
- 📁 `/seller/statistics` - 통계
- 📁 `/seller/promotions` - 프로모션
- 📁 `/seller/qa` - 상품 Q&A
- 📁 `/seller/verification` - 판매자 인증
- 🔌 API: `/api/seller/*` (10개 엔드포인트)

### 2.3 배송업체 기능

#### 배송업체 대시보드
- 📁 `/shipping/dashboard` - 배송 대시보드
- 📁 `/shipping/orders` - 배송 주문
- 📁 `/shipping/register` - 배송업체 등록
- 📁 `/shipping/settlements` - 배송 정산
- 🔌 API: `/api/shipping/*` (9개 엔드포인트)

### 2.4 관리자 기능

#### 관리자 대시보드
- 📁 `/admin` - 관리자 홈
- 📁 `/admin/users` - 회원 관리
- 📁 `/admin/orders` - 주문 관리
- 📁 `/admin/posts` - 게시글 관리
- 📁 `/admin/support` - 고객 문의 ✅
- 📁 `/admin/support/[id]` - 문의 상세 ✅
- 📁 `/admin/settlements` - 정산 관리
- 📁 `/admin/shipping-companies` - 배송업체 관리 ✅
- 📁 `/admin/settings` - 시스템 설정 ✅
- 📁 `/admin/coupons` - 쿠폰 관리
- 📁 `/admin/ads` - 광고 관리
- 📁 `/admin/disputes` - 분쟁 관리
- 🔌 API: `/api/admin/*` (27개 엔드포인트)

---

## 🚀 3. 추가 기능

### 3.1 라이브 스트리밍
- 📁 `/live` - 라이브 목록
- 📁 `/live/[id]` - 라이브 시청
- 📁 `/live/create` - 라이브 시작
- 🔌 API: `/api/live/*`

### 3.2 광고 시스템
- 📁 `/ads` - 광고 슬롯
- 📁 `/ads/bid/[slotId]` - 광고 입찰
- 📁 `/ads/my-bids` - 내 입찰
- 🔌 API: `/api/ads/*`

### 3.3 분쟁 해결
- 📁 `/disputes` - 분쟁 목록
- 📁 `/disputes/[id]` - 분쟁 상세
- 📁 `/disputes/create` - 분쟁 신청
- 🔌 API: `/api/disputes/*`

### 3.4 본인 인증
- 📁 `/verify/phone` - 휴대폰 인증
- 📁 `/verify/identity` - 본인 인증
- 📁 `/verify/business` - 사업자 인증
- 🔌 API: `/api/verify/*`

### 3.5 기타
- 📁 `/search` - 통합 검색
- 📁 `/categories` - 카테고리
- 📁 `/notifications` - 알림
- 📁 `/help` - 고객센터
- 📁 `/faq` - FAQ
- 📁 `/terms` - 이용약관
- 📁 `/privacy` - 개인정보처리방침

---

## 🔧 4. 기술 스택 확인

### 프론트엔드
- ✅ Next.js 14.2.35
- ✅ React
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui (22개 컴포넌트)

### 백엔드
- ✅ Next.js API Routes (154개)
- ✅ Prisma ORM (44개 모델)
- ✅ PostgreSQL (Supabase)
- ✅ NextAuth v5

### 외부 서비스
- ✅ Cloudflare R2 (파일 저장)
- ✅ 토스페이먼츠 (결제)
- ⚠️ Alipay (중국 결제)
- ✅ Pusher (실시간 메시지)
- ⚠️ DeepL (번역)
- ⚠️ 알리고/알리云 (SMS) - 미구현
- ✅ FCM (푸시 알림)

---

## ⚠️ 5. 미구현/부분 구현 기능

### 🔴 완전 미구현
1. **SMS 인증 시스템**
   - `/verify/phone` 페이지 있음
   - API 엔드포인트 있음
   - 실제 SMS 발송 미연동

2. **본인 인증 (NICE)**
   - `/verify/identity` 페이지 있음
   - NICE 본인인증 미연동

3. **사업자 인증**
   - `/verify/business` 페이지 있음
   - 실제 API 미연동

### 🟡 부분 구현
4. **Alipay 결제**
   - API 있음
   - 실제 테스트 필요

5. **라이브 스트리밍**
   - UI 있음
   - 실제 스트리밍 서버 연동 확인 필요

6. **DeepL 번역**
   - API 있음
   - 실제 사용 여부 확인 필요

