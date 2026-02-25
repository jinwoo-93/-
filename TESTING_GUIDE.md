# 직구역구 프로젝트 종합 테스트 가이드

## 📋 개요

이 문서는 직구역구 (JIKGUYEOKGU) 프로젝트의 모든 기능을 테스트하는 가이드입니다.

### 프로젝트 구조

- **Phase 1**: 기본 기능 (인증, 사용자, 게시글)
- **Phase 2**: 거래 기능 (주문, 결제, 분쟁)
- **Phase 3**: 고급 기능 (배송, 광고, 라이브)
- **Phase 4**: 확장 기능 (알림, 쿠폰, 등급, 리뷰)

---

## 🔧 테스트 환경 설정

### 1. 환경 변수 확인

```bash
# .env.local 파일 확인
cat .env.local
```

필수 환경 변수:
- `DATABASE_URL`: PostgreSQL 연결 URL
- `NEXTAUTH_SECRET`: NextAuth 비밀키
- `NEXTAUTH_URL`: 애플리케이션 URL

### 2. 데이터베이스 확인

```bash
# Prisma Client 재생성
npx prisma generate

# 데이터베이스 연결 테스트
npx prisma db push --preview-feature
```

### 3. 빌드 테스트

```bash
# TypeScript 컴파일 확인
npm run build

# 예상 결과:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Generating static pages (69/69)
# Route (app): 220+ routes
```

---

## 🧪 기능별 테스트

### Phase 1: 기본 기능

#### 1.1 인증 시스템

**테스트 항목:**
- [x] 회원가입 (이메일/비밀번호)
- [x] 로그인/로그아웃
- [x] OAuth 로그인 (Kakao, Naver, WeChat)
- [x] SMS 인증
- [x] 비밀번호 재설정

**수동 테스트:**
```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 접속
# http://localhost:3000/register
# http://localhost:3000/login
```

**API 테스트:**
```bash
# 회원가입
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "name": "테스트 사용자",
    "userType": "BUYER"
  }'

# SMS 코드 전송
curl -X POST http://localhost:3000/api/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "01012345678",
    "country": "KR"
  }'
```

#### 1.2 사용자 관리

**테스트 항목:**
- [x] 프로필 조회/수정
- [x] 사용자 타입 (구매자/판매자/배송업체)
- [x] 본인인증 (신분증, 사업자등록증)
- [x] 우수 뱃지

**API 테스트:**
```bash
# 내 정보 조회
curl http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 프로필 수정
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "수정된 이름",
    "nickname": "새로운닉네임"
  }'
```

#### 1.3 게시글 시스템

**테스트 항목:**
- [x] 게시글 생성/조회/수정/삭제
- [x] 카테고리별 필터링
- [x] 검색 (제목, 설명)
- [x] 정렬 (최신순, 인기순, 가격순)
- [x] 찜하기/팔로우

**API 테스트:**
```bash
# 게시글 목록 조회
curl "http://localhost:3000/api/posts?page=1&limit=20"

# 게시글 생성
curl -X POST http://localhost:3000/api/posts \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postType": "SELL",
    "tradeDirection": "KR_TO_CN",
    "title": "테스트 상품",
    "description": "테스트 설명",
    "categoryId": "CATEGORY_ID",
    "priceKRW": 10000,
    "priceCNY": 50,
    "quantity": 10,
    "images": ["https://example.com/image.jpg"]
  }'

# 게시글 상세 조회
curl "http://localhost:3000/api/posts/POST_ID"

# 찜하기
curl -X POST http://localhost:3000/api/wishlist \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "POST_ID"}'
```

---

### Phase 2: 거래 기능

#### 2.1 주문 시스템

**테스트 항목:**
- [x] 주문 생성
- [x] 주문 상태 관리 (결제대기 → 결제완료 → 배송중 → 배송완료 → 구매확정)
- [x] 주문 조회 (구매자/판매자)
- [x] 주문 취소/환불

**API 테스트:**
```bash
# 주문 생성
curl -X POST http://localhost:3000/api/orders \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_ID",
    "quantity": 1,
    "shippingAddress": {
      "name": "홍길동",
      "phone": "010-1234-5678",
      "address": "서울시 강남구 테헤란로",
      "postalCode": "12345"
    }
  }'

# 주문 목록 조회
curl "http://localhost:3000/api/orders?page=1&limit=20" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 주문 상세 조회
curl "http://localhost:3000/api/orders/ORDER_ID" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 2.2 결제 시스템

**테스트 항목:**
- [x] 결제 수단 (Naver Pay, Kakao Pay, Alipay, WeChat Pay)
- [x] 에스크로 보관
- [x] 결제 확인
- [x] 환불 처리

**API 테스트:**
```bash
# 결제 정보 조회
curl "http://localhost:3000/api/payments/PAYMENT_ID" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 2.3 분쟁 시스템

**테스트 항목:**
- [x] 분쟁 생성
- [x] 분쟁 투표 (5명)
- [x] 자동 해결 (72시간 후)
- [x] 환불 비율 결정
- [x] 투표 보상 (50 포인트)

**API 테스트:**
```bash
# 분쟁 생성
curl -X POST http://localhost:3000/api/disputes \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "reason": "상품 불량",
    "description": "상품이 설명과 다릅니다",
    "evidence": ["https://example.com/evidence.jpg"]
  }'

# 분쟁 투표
curl -X POST "http://localhost:3000/api/disputes/DISPUTE_ID/vote" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "voteFor": "BUYER",
    "comment": "구매자가 맞는 것 같습니다"
  }'
```

---

### Phase 3: 고급 기능

#### 3.1 배송 시스템

**테스트 항목:**
- [x] 배송업체 등록
- [x] 배송비 계산
- [x] 추적 번호 업데이트
- [x] 배송 상태 추적
- [x] 배송 리뷰
- [x] 보증금 시스템

**API 테스트:**
```bash
# 배송업체 목록
curl "http://localhost:3000/api/shipping/companies"

# 배송비 계산
curl "http://localhost:3000/api/shipping/calculate?weight=2&from=KR&to=CN"

# 배송 추적
curl "http://localhost:3000/api/shipping/track?trackingNumber=TRACKING_NUMBER"
```

#### 3.2 광고 입찰 시스템

**테스트 항목:**
- [x] 광고 슬롯 (상품 3개, 배송업체 3개)
- [x] 주간 입찰
- [x] 낙찰/패찰 처리
- [x] 자동 환불

**API 테스트:**
```bash
# 광고 슬롯 조회
curl "http://localhost:3000/api/ads/slots?categoryId=CATEGORY_ID"

# 입찰
curl -X POST http://localhost:3000/api/ads/bids \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "SLOT_ID",
    "bidAmount": 50000,
    "weekStart": "2024-01-01",
    "weekEnd": "2024-01-07"
  }'

# 내 입찰 내역
curl "http://localhost:3000/api/ads/bids/my" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 3.3 라이브 커머스

**테스트 항목:**
- [x] 라이브 방송 생성
- [x] 상품 등록
- [x] 실시간 시청
- [x] 통계 (시청자 수, 클릭, 주문)

**API 테스트:**
```bash
# 라이브 목록
curl "http://localhost:3000/api/live"

# 라이브 생성
curl -X POST http://localhost:3000/api/live \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 라이브",
    "description": "테스트 라이브 설명",
    "scheduledAt": "2024-12-25T15:00:00Z"
  }'
```

---

### Phase 4: 확장 기능

#### 4.1 알림 시스템 고도화

**테스트 항목:**
- [x] 26개 알림 템플릿
- [x] 3개 언어 지원 (KO, ZH, EN)
- [x] 8개 카테고리
- [x] 알림 그룹화/필터링
- [x] FCM 푸시 알림

**API 테스트:**
```bash
# 알림 목록
curl "http://localhost:3000/api/notifications?page=1&limit=20" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 알림 읽음 처리
curl -X PATCH "http://localhost:3000/api/notifications/NOTIFICATION_ID/read" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 모두 읽음 처리
curl -X POST "http://localhost:3000/api/notifications/read-all" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 4.2 쿠폰 자동화

**테스트 항목:**
- [x] 11개 자동 발급 트리거
- [x] 생일 쿠폰
- [x] 장바구니 포기 쿠폰
- [x] 비활성 사용자 쿠폰
- [x] 만료 임박 알림

**API 테스트:**
```bash
# 내 쿠폰 목록
curl "http://localhost:3000/api/coupons" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 쿠폰 수동 발급 (관리자)
curl -X POST "http://localhost:3000/api/coupons/auto-issue" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "SIGNUP",
    "userId": "USER_ID",
    "couponCode": "WELCOME10"
  }'
```

#### 4.3 찜목록 고급 기능

**테스트 항목:**
- [x] 폴더 관리
- [x] 가격 변동 알림
- [x] 재고 알림
- [x] 메모 기능
- [x] 통계
- [x] 추천

**API 테스트:**
```bash
# 찜목록 통계
curl "http://localhost:3000/api/wishlist/stats" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 찜목록 추천
curl "http://localhost:3000/api/wishlist/recommendations" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 4.4 판매자 등급 시스템

**테스트 항목:**
- [x] 5단계 등급 (BRONZE ~ DIAMOND)
- [x] 종합 점수 계산
- [x] 등급별 혜택 (수수료 할인)
- [x] 주간 자동 갱신

**API 테스트:**
```bash
# 판매자 등급 조회
curl "http://localhost:3000/api/seller/grade" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

#### 4.5 리뷰 보상 시스템

**테스트 항목:**
- [x] 3단계 퀄리티 평가 (BASIC, DETAILED, PREMIUM)
- [x] 포인트 보상 (100P, 300P, 500P)
- [x] 베스트 리뷰 선정
- [x] 리뷰 작성 독려

**API 테스트:**
```bash
# 리뷰 작성 (자동 보상)
curl -X POST "http://localhost:3000/api/reviews" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "rating": 5,
    "comment": "정말 훌륭한 제품입니다. 배송이 매우 빠르고 포장도 꼼꼼했습니다. 품질이 기대 이상이며 가격 대비 매우 만족스럽습니다.",
    "images": [
      "https://example.com/review1.jpg",
      "https://example.com/review2.jpg",
      "https://example.com/review3.jpg"
    ]
  }'
```

#### 4.6 판매자 프로모션

**테스트 항목:**
- [x] 5가지 프로모션 타입
- [x] 할인 계산
- [x] 프로모션 통계

**기능 테스트:**
프로모션 기능은 현재 라이브러리로만 구현되어 있으며, API 엔드포인트는 추후 추가 예정입니다.

---

## 🤖 Cron Job 테스트

### Cron Job 목록

```json
{
  "crons": [
    {
      "path": "/api/exchange-rate/update",
      "schedule": "0 0 * * *",
      "description": "환율 업데이트 (매일 00:00)"
    },
    {
      "path": "/api/orders/auto-confirm",
      "schedule": "0 15 * * *",
      "description": "주문 자동 확정 (매일 15:00)"
    },
    {
      "path": "/api/ads/weekly-close",
      "schedule": "0 1 * * 1",
      "description": "광고 입찰 마감 (매주 월요일 01:00)"
    },
    {
      "path": "/api/disputes/process-expired",
      "schedule": "0 2 * * *",
      "description": "분쟁 만료 처리 (매일 02:00)"
    },
    {
      "path": "/api/cron/coupon-automation",
      "schedule": "0 9 * * *",
      "description": "쿠폰 자동화 (매일 09:00)"
    },
    {
      "path": "/api/cron/seller-grades",
      "schedule": "0 2 * * 0",
      "description": "판매자 등급 갱신 (매주 일요일 02:00)"
    },
    {
      "path": "/api/cron/review-reminders",
      "schedule": "0 10 * * *",
      "description": "리뷰 작성 독려 (매일 10:00)"
    },
    {
      "path": "/api/cron/price-alerts",
      "schedule": "0 */6 * * *",
      "description": "가격 변동 알림 (6시간마다)"
    },
    {
      "path": "/api/cron/best-reviews",
      "schedule": "0 0 1 * *",
      "description": "베스트 리뷰 선정 (매월 1일 00:00)"
    }
  ]
}
```

### Cron Job 수동 실행

```bash
# CRON_SECRET 환경 변수 설정 필요
export CRON_SECRET="your-cron-secret"

# 쿠폰 자동화
curl -X GET "http://localhost:3000/api/cron/coupon-automation" \
  -H "Authorization: Bearer $CRON_SECRET"

# 판매자 등급 갱신
curl -X GET "http://localhost:3000/api/cron/seller-grades" \
  -H "Authorization: Bearer $CRON_SECRET"

# 리뷰 작성 독려
curl -X GET "http://localhost:3000/api/cron/review-reminders" \
  -H "Authorization: Bearer $CRON_SECRET"

# 가격 변동 알림
curl -X GET "http://localhost:3000/api/cron/price-alerts" \
  -H "Authorization: Bearer $CRON_SECRET"

# 베스트 리뷰 선정
curl -X GET "http://localhost:3000/api/cron/best-reviews" \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## 📊 테스트 스크립트

### 1. 빌드 테스트

```bash
# 프로젝트 빌드
npm run build

# 예상 결과:
# ✓ Compiled successfully
# Route (app): 220+ routes
# TypeScript errors: 0
```

### 2. API 엔드포인트 테스트

```bash
# 실행 권한 부여
chmod +x scripts/test-api-endpoints.sh

# 실행
./scripts/test-api-endpoints.sh http://localhost:3000
```

### 3. 데이터베이스 연결 테스트

```bash
# Prisma Studio 실행
npx prisma studio

# 브라우저에서 http://localhost:5555 접속
```

---

## ✅ 테스트 체크리스트

### 기본 기능
- [ ] 회원가입/로그인
- [ ] 게시글 CRUD
- [ ] 카테고리 필터링
- [ ] 검색 기능
- [ ] 찜하기/팔로우

### 거래 기능
- [ ] 주문 생성
- [ ] 결제 처리
- [ ] 주문 상태 관리
- [ ] 분쟁 생성/투표
- [ ] 환불 처리

### 고급 기능
- [ ] 배송 추적
- [ ] 광고 입찰
- [ ] 라이브 커머스
- [ ] 배송업체 정산

### 확장 기능 (Phase 4)
- [ ] 알림 수신
- [ ] 쿠폰 발급/사용
- [ ] 찜목록 통계
- [ ] 판매자 등급 조회
- [ ] 리뷰 작성 및 보상
- [ ] Cron Job 실행

---

## 🐛 알려진 이슈

1. **Prisma 관계**: Wishlist-Post, ProductQA-Post 관계 미설정 (별도 쿼리로 해결)
2. **FCM 푸시 알림**: Firebase 설정 필요
3. **프로모션 API**: 라이브러리만 구현, API 엔드포인트 추후 추가 예정

---

## 📞 문제 발생 시

1. 로그 확인: `npm run dev` 콘솔 출력
2. 데이터베이스 확인: `npx prisma studio`
3. 빌드 확인: `npm run build`
4. 환경 변수 확인: `.env.local`

---

**작성일**: 2026-02-23
**버전**: Phase 4 (v1.4.0)
