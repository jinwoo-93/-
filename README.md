# 직구역구 (JIKGUYEOKGU)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**한국 ↔ 중국 직구 전문 C2C 마켓플레이스**

[데모 보기](https://jikguyeokgu.vercel.app) · [API 문서](https://jikguyeokgu.vercel.app/api-docs) · [버그 리포트](https://github.com/yourusername/jikguyeokgu/issues)

</div>

---

## 📖 목차

- [소개](#-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [환경 변수](#-환경-변수)
- [데이터베이스 설정](#-데이터베이스-설정)
- [배포](#-배포)
- [프로젝트 구조](#-프로젝트-구조)
- [API 엔드포인트](#-api-엔드포인트)
- [라이센스](#-라이센스)

---

## 🎯 소개

**직구역구**는 한국과 중국 간의 직접 구매(직구)를 연결하는 혁신적인 C2C(Consumer to Consumer) 마켓플레이스입니다.

### 핵심 가치

- 🌐 **국경 없는 거래**: 한국-중국 양방향 직구를 하나의 플랫폼에서
- 🤝 **커뮤니티 중심**: 투표 기반 분쟁 해결 시스템
- 🚀 **스마트 자동화**: AI 추천, 자동 쿠폰 발급, 등급 시스템
- 🌍 **다국어 지원**: 한국어, 중국어(간체), 영어 완벽 지원
- 💎 **판매자 성장**: 등급별 혜택과 프로모션 도구 제공

### 주요 이용자

- 🛍️ **구매자**: 한국/중국 제품을 합리적인 가격에 구매
- 🏪 **판매자**: 국경을 넘어 더 넓은 시장에 진출
- 🚚 **배송업체**: 국제 배송 주문 통합 관리
- 👔 **관리자**: 플랫폼 운영 및 분쟁 중재

---

## ✨ 주요 기능

### 1️⃣ 핵심 거래 기능 (Phase 1)

<details>
<summary><b>사용자 관리</b></summary>

- 이메일/소셜 로그인 (Google, Kakao)
- 본인인증 (휴대폰, 신분증, 사업자등록증)
- 다국어 프로필 관리
- 사용자 활동 통계 대시보드

</details>

<details>
<summary><b>상품 관리</b></summary>

- 다국어 상품 등록 (한/중/영)
- 이미지 업로드 (Cloudflare R2)
- 7개 대분류, 30+ 소분류 카테고리
- 고급 검색/필터링 (가격, 지역, 평점, 배송비)
- 상품 비교 기능
- 최근 본 상품 추적

</details>

<details>
<summary><b>주문/결제</b></summary>

- 장바구니 (다중 판매자 지원)
- 9단계 주문 상태 관리
- 다국적 결제 통합
  - 🇰🇷 토스페이먼츠 (한국)
  - 💳 Stripe (해외)
  - 🇨🇳 Alipay, WeChat Pay (중국)
- 환불/부분환불 처리
- 주문 타임라인 추적

</details>

<details>
<summary><b>배송 시스템</b></summary>

- 배송업체 등록/관리
- 실시간 배송 추적
- 통합 운송장 조회
- 배송 상태 자동 업데이트
- 배송업체별 정산 시스템

</details>

### 2️⃣ 커뮤니티 기능 (Phase 2)

<details>
<summary><b>리뷰 시스템</b></summary>

- 별점 평가 (5점 척도)
- 이미지 첨부 (최대 5장)
- 좋아요/신고 기능
- 베스트 리뷰 선정
- 리뷰 품질 평가 (BASIC/DETAILED/PREMIUM)
- 자동 포인트 보상 (100P~500P)

</details>

<details>
<summary><b>분쟁 해결</b></summary>

- 5가지 분쟁 타입
  - 미배송/배송지연
  - 상품 불일치
  - 상품 파손
  - 환불 요청
  - 기타 분쟁
- **커뮤니티 투표 시스템** (혁신적!)
- 관리자 중재
- 분쟁 메시지 스레드
- 자동 환불 처리

</details>

<details>
<summary><b>커뮤니티</b></summary>

- 자유 게시판
- 댓글/대댓글
- 좋아요/스크랩
- 신고 시스템
- 인기 게시글

</details>

<details>
<summary><b>실시간 채팅</b></summary>

- 1:1 채팅 (Pusher)
- 이미지 전송
- 읽음 상태 표시
- 채팅방 검색

</details>

### 3️⃣ 비즈니스 기능 (Phase 3)

<details>
<summary><b>판매자 대시보드</b></summary>

- 실시간 판매 통계
- 주문 관리
- 상품 재고 관리
- 문의 응답
- 정산 내역

</details>

<details>
<summary><b>배송업체 관리</b></summary>

- 배송 주문 대시보드
- 배송 상태 업데이트
- 정산 시스템
- 배송 통계

</details>

<details>
<summary><b>관리자 시스템</b></summary>

- 통합 대시보드
- 사용자/상품/주문 관리
- 분쟁 중재
- 배너 관리
- 카테고리 관리
- 쿠폰 관리
- 시스템 로그

</details>

### 4️⃣ 스마트 기능 (Phase 4) 🆕

<details>
<summary><b>고급 알림 시스템</b></summary>

- 26개 템플릿 (주문/결제/배송/분쟁/리뷰/쿠폰/포인트/판매자)
- 푸시 알림 (Firebase FCM)
- 3개 언어 지원
- 알림 그룹화/카테고리
- 읽음/안읽음 관리
- 우선순위별 분류

</details>

<details>
<summary><b>쿠폰 자동화</b></summary>

**11개 자동 발급 트리거**:
1. 회원가입 환영 쿠폰 (5,000원)
2. 생일 축하 쿠폰 (10,000원)
3. 첫 구매 축하 쿠폰 (15,000원)
4. 장바구니 이탈 쿠폰 (3,000원)
5. 휴면 회원 복귀 쿠폰 (20,000원)
6. 등급 상승 축하 쿠폰 (10,000원~50,000원)
7. 리뷰 작성 감사 쿠폰 (2,000원)
8. 월간 베스트 리뷰어 쿠폰 (30,000원)
9. 대량 구매 쿠폰 (50,000원)
10. 쿠폰 만료 임박 알림
11. 시즌별 이벤트 쿠폰

**Cron Job**: 매일 09:00 자동 실행

</details>

<details>
<summary><b>찜목록 고급 기능</b></summary>

- 폴더별 관리
- 가격 변동 알림 (6시간마다 체크)
- 재고 알림
- 개인 메모
- 통계 (카테고리별, 가격대별)
- AI 기반 추천 (협업 필터링)

</details>

<details>
<summary><b>판매자 등급 시스템</b></summary>

**5단계 등급**:

| 등급 | 최소 판매 | 최소 매출 | 평점 | 수수료 할인 |
|------|-----------|-----------|------|-------------|
| 🥉 브론즈 | - | - | 3.0 | 0% |
| 🥈 실버 | 10건 | 100만원 | 4.0 | 0.5% |
| 🥇 골드 | 50건 | 500만원 | 4.3 | 1.0% |
| 💎 플래티넘 | 200건 | 2,000만원 | 4.5 | 2.0% |
| 💎💎 다이아몬드 | 500건 | 5,000만원 | 4.7 | 3.0% |

**평가 기준**:
- 판매 실적
- 평균 평점
- 분쟁률
- 응답률
- 배송 점수

**혜택**:
- 수수료 할인 (최대 3%)
- 우선 노출
- 프로모션 도구
- 등급 뱃지

**Cron Job**: 매주 일요일 02:00 자동 갱신

</details>

<details>
<summary><b>리뷰 보상 시스템</b></summary>

**품질별 보상**:

| 등급 | 조건 | 포인트 |
|------|------|--------|
| BASIC | 별점 + 짧은 리뷰 | 100P |
| DETAILED | 별점 + 50자 이상 | 300P |
| PREMIUM | 별점 + 100자 + 사진 3장 | 500P |

**뱃지 시스템**:
- 🥉 브론즈 리뷰어 (10개)
- 🥈 실버 리뷰어 (50개)
- 🥇 골드 리뷰어 (100개)

**월간 베스트 리뷰**:
- 매월 1일 자동 선정
- 추가 보상 지급
- 베스트 뱃지 표시

</details>

<details>
<summary><b>판매자 프로모션</b></summary>

**5가지 프로모션 타입**:
1. **할인 프로모션**: 정률/정액 할인
2. **묶음 프로모션**: N개 구매 시 할인
3. **타임세일**: 시간 한정 특가
4. **무료배송**: 배송비 무료
5. **쿠폰 증정**: 구매 시 쿠폰 자동 발급

**통계 제공**:
- 조회수
- 클릭수
- 전환율
- 매출 증가율

</details>

<details>
<summary><b>다국어 확장</b></summary>

- 🇰🇷 한국어
- 🇨🇳 중국어 간체
- 🇬🇧 영어

**번역 범위**:
- 100+ UI 텍스트
- 알림 템플릿
- 에러 메시지
- 로케일별 날짜/통화 포맷

</details>

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **State Management**: React Query, Zustand
- **Form**: React Hook Form + Zod
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **i18n**: Custom i18n library

### Backend
- **Runtime**: Node.js 20+
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.0
- **Authentication**: NextAuth.js v5
- **Real-time**: Pusher (WebSocket)
- **Cron Jobs**: Vercel Cron (9 jobs)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **CDN**: Cloudflare
- **Monitoring**: Sentry (예정)

### External Services
- **Payment**: 토스페이먼츠, Stripe, Alipay, WeChat Pay
- **Push Notification**: Firebase Cloud Messaging
- **SMS**: CoolSMS (KR), Aliyun (CN)
- **Translation**: DeepL API
- **Chat**: Pusher

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky
- **Testing**: Jest, Playwright (예정)
- **CI/CD**: GitHub Actions (예정)

---

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.0 이상
- PostgreSQL 15 이상 (또는 Supabase 계정)
- npm 또는 yarn

### 설치 방법

1. **레포지토리 클론**

```bash
git clone https://github.com/yourusername/jikguyeokgu.git
cd jikguyeokgu
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경 변수를 설정합니다. ([환경 변수 가이드](#-환경-변수) 참고)

4. **데이터베이스 마이그레이션**

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev

# (선택) 초기 데이터 시딩
npx prisma db seed
```

5. **개발 서버 실행**

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

---

## 🔐 환경 변수

### 필수 환경 변수

#### 데이터베이스
```env
# Supabase PostgreSQL (Session Pooler)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?pgbouncer=true&connection_limit=1"
```

#### 인증 (NextAuth.js)
```env
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Kakao OAuth
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

#### Cron Job 보안
```env
CRON_SECRET="your-cron-secret-key"
```

### 선택 환경 변수

#### 이미지 업로드 (Cloudflare R2)
```env
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="your-bucket-name"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxxx.r2.dev"
```

#### 결제 (토스페이먼츠)
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_xxxxx"
TOSS_SECRET_KEY="test_sk_xxxxx"
TOSS_WEBHOOK_SECRET="your-webhook-secret"
```

#### 실시간 채팅 (Pusher)
```env
PUSHER_APP_ID="your-app-id"
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="ap3"
```

#### SMS 인증
```env
# CoolSMS (한국)
COOLSMS_API_KEY="your-coolsms-key"
COOLSMS_API_SECRET="your-coolsms-secret"
COOLSMS_SENDER_NUMBER="01012345678"

# Aliyun (중국)
ALIYUN_ACCESS_KEY_ID="your-aliyun-key"
ALIYUN_ACCESS_KEY_SECRET="your-aliyun-secret"
```

#### 푸시 알림 (Firebase)
```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"
```

#### 번역 (DeepL)
```env
DEEPL_API_KEY="your-deepl-api-key"
```

> 💡 **참고**: `.env.example` 파일에 모든 환경 변수 템플릿이 있습니다.

---

## 🗄️ 데이터베이스 설정

### Prisma 마이그레이션

#### 개발 환경
```bash
# 마이그레이션 생성 및 적용
npx prisma migrate dev --name your_migration_name

# Prisma Studio로 데이터 확인
npx prisma studio
```

#### 프로덕션 환경
```bash
# 마이그레이션만 적용 (새 마이그레이션 생성 안 함)
npx prisma migrate deploy

# Prisma 클라이언트 생성
npx prisma generate
```

### 데이터베이스 스키마

프로젝트는 **40개의 Prisma 모델**을 사용합니다:

- **사용자**: User, Account, Session, VerificationToken
- **상품**: Product, Category, ProductImage
- **주문**: Order, OrderItem, Cart, Payment, Refund
- **배송**: ShippingProvider, ShippingOrder, ShippingTracking
- **리뷰**: Review, ReviewReport, ReviewLike
- **분쟁**: Dispute, DisputeVote, DisputeMessage
- **문의**: Inquiry, ProductInquiry
- **커뮤니티**: Post, Comment, PostLike, PostBookmark
- **채팅**: ChatRoom, ChatMessage
- **알림/쿠폰**: Notification, Coupon, UserCoupon
- **찜목록**: Wishlist, WishlistFolder
- **정산**: SellerSettlement, ShippingSettlement
- **프로모션**: Promotion
- **기타**: FAQ, Banner, AdminLog

자세한 스키마는 `prisma/schema.prisma` 파일을 참고하세요.

### 초기 데이터 시딩

```bash
# 카테고리, FAQ 등 초기 데이터 생성
npx prisma db seed
```

---

## 🚀 배포

### Vercel 배포 (권장)

1. **Vercel 계정에 레포지토리 연결**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/jikguyeokgu)

2. **환경 변수 설정**

Vercel 대시보드에서 모든 환경 변수를 추가합니다.

3. **데이터베이스 마이그레이션**

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로덕션 환경 변수로 마이그레이션
vercel env pull .env.production.local
npx prisma migrate deploy
```

4. **Cron Job 설정**

`vercel.json` 파일에 9개의 Cron Job이 설정되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/cron/coupon-automation",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/seller-grades",
      "schedule": "0 2 * * 0"
    }
    // ... 7개 더
  ]
}
```

### Docker 배포

```bash
# Docker 이미지 빌드
docker build -t jikguyeokgu .

# 컨테이너 실행
docker run -p 3000:3000 --env-file .env.local jikguyeokgu
```

---

## 📁 프로젝트 구조

```
jikguyeokgu/
├── prisma/
│   ├── schema.prisma              # 데이터베이스 스키마
│   └── migrations/                # 마이그레이션 파일
├── public/                        # 정적 파일
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (main)/               # 메인 레이아웃 그룹
│   │   ├── (seller)/             # 판매자 레이아웃 그룹
│   │   ├── (admin)/              # 관리자 레이아웃 그룹
│   │   ├── api/                  # API Routes (131개)
│   │   │   ├── auth/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── cron/             # Cron Jobs (9개)
│   │   │   └── ...
│   │   └── ...
│   ├── components/               # React 컴포넌트 (58개)
│   │   ├── common/
│   │   ├── products/
│   │   ├── orders/
│   │   └── ...
│   ├── lib/                      # 라이브러리 (39개)
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── notification-templates.ts  # Phase 4
│   │   ├── notification-service.ts    # Phase 4
│   │   ├── coupon-automation.ts       # Phase 4
│   │   ├── wishlist-service.ts        # Phase 4
│   │   ├── seller-grade-system.ts     # Phase 4
│   │   ├── review-reward-system.ts    # Phase 4
│   │   ├── seller-promotion-system.ts # Phase 4
│   │   ├── i18n.ts                    # Phase 4
│   │   └── ...
│   ├── types/                    # TypeScript 타입
│   └── utils/                    # 유틸리티 함수
├── scripts/                      # 스크립트
│   └── test-api-endpoints.sh     # API 테스트
├── .env.local                    # 환경 변수 (git 제외)
├── .env.example                  # 환경 변수 예시
├── next.config.js                # Next.js 설정
├── tailwind.config.ts            # Tailwind 설정
├── tsconfig.json                 # TypeScript 설정
├── vercel.json                   # Vercel 설정 (Cron Jobs)
└── package.json
```

---

## 🔌 API 엔드포인트

총 **131개**의 REST API 엔드포인트를 제공합니다.

### 주요 엔드포인트

#### 인증
```
POST   /api/auth/signup           # 회원가입
POST   /api/auth/login            # 로그인
POST   /api/auth/logout           # 로그아웃
GET    /api/auth/me               # 현재 사용자 정보
```

#### 상품
```
GET    /api/products              # 상품 목록
GET    /api/products/:id          # 상품 상세
POST   /api/products              # 상품 등록
PUT    /api/products/:id          # 상품 수정
DELETE /api/products/:id          # 상품 삭제
```

#### 주문
```
GET    /api/orders                # 주문 목록
POST   /api/orders                # 주문 생성
GET    /api/orders/:id            # 주문 상세
PUT    /api/orders/:id/status     # 주문 상태 변경
```

#### 알림 (Phase 4)
```
GET    /api/notifications         # 알림 목록
PUT    /api/notifications/:id/read  # 읽음 처리
```

#### 쿠폰 (Phase 4)
```
GET    /api/coupons               # 쿠폰 목록
POST   /api/coupons/auto-issue    # 자동 발급
```

#### 판매자 (Phase 4)
```
GET    /api/seller/grade          # 등급 정보
GET    /api/seller/dashboard      # 대시보드
```

#### Cron Jobs
```
GET    /api/cron/coupon-automation    # 쿠폰 자동화 (매일 09:00)
GET    /api/cron/seller-grades        # 등급 갱신 (주간)
GET    /api/cron/review-reminders     # 리뷰 독려 (매일 10:00)
GET    /api/cron/price-alerts         # 가격 알림 (6시간)
GET    /api/cron/best-reviews         # 베스트 리뷰 (월간)
```

> 📚 **전체 API 문서**: [API-DOCUMENTATION.md](./docs/API-DOCUMENTATION.md) (준비 중)

---

## 📊 통계

### 코드베이스
- **API 엔드포인트**: 131개
- **데이터베이스 모델**: 40개
- **페이지**: 77개
- **컴포넌트**: 58개
- **라이브러리**: 39개
- **Cron Jobs**: 9개
- **지원 언어**: 3개 (한국어, 중국어, 영어)

### 완성도
- **백엔드**: 95% ✅
- **프론트엔드**: 70% ⚠️
- **인프라**: 60% ⚠️
- **테스트**: 30% ⚠️
- **문서화**: 70% ⚠️

---

## 🧪 테스트

### API 테스트

```bash
# 개발 서버 실행 (별도 터미널)
npm run dev

# API 엔드포인트 테스트
chmod +x scripts/test-api-endpoints.sh
./scripts/test-api-endpoints.sh http://localhost:3000
```

### 단위 테스트 (준비 중)

```bash
npm test
```

### E2E 테스트 (준비 중)

```bash
npx playwright test
```

---

## 📖 문서

- [Phase 4 완료 보고서](./PHASE_4_COMPLETION.md)
- [Prisma 마이그레이션 가이드](./PRISMA_MIGRATION_GUIDE.md)
- [배포 체크리스트](./DEPLOYMENT_CHECKLIST.md)
- [테스트 가이드](./TESTING_GUIDE.md)
- [프로젝트 TODO](./PROJECT_TODO.md)
- [전체 현황 보고서](./PROJECT_STATUS_REPORT.md)

---

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인

- **코드 스타일**: ESLint + Prettier 설정 준수
- **커밋 메시지**: Conventional Commits 규칙
- **PR**: 상세한 설명과 스크린샷 첨부
- **테스트**: 새 기능에 대한 테스트 작성

---

## 📄 라이센스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 팀

- **프로젝트 관리**: [Your Name]
- **백엔드 개발**: [Your Name]
- **프론트엔드 개발**: [Your Name]

---

## 📞 문의

- **이메일**: support@jikguyeokgu.com
- **GitHub Issues**: [이슈 등록](https://github.com/yourusername/jikguyeokgu/issues)
- **Discord**: [커뮤니티 참여](https://discord.gg/jikguyeokgu)

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 사용합니다:

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

**Made with ❤️ by JIKGUYEOKGU Team**

[⬆ 맨 위로 가기](#직구역구-jikguyeokgu)

</div>
