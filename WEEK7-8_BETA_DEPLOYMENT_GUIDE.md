# Week 7-8: 베타 배포 가이드

## 📊 현재 상태

### ✅ 완료된 작업
- ✅ Week 1-2 (CRITICAL): 베타 배포 준비 100%
- ✅ Week 3-4 (HIGH): 사용자 경험 개선 100%
- ✅ Week 5-6 (MEDIUM): 안정성 강화 100%

### 🎯 Week 7-8 목표
베타 배포 및 초기 테스트를 통한 실사용 환경 검증

---

## 📋 배포 전 최종 체크리스트

### 1. 코드 품질 검증

```bash
# 빌드 테스트
npm run build

# TypeScript 타입 체크
npm run type-check

# 린트 검사
npm run lint

# 전체 테스트 실행
npm test

# 테스트 커버리지
npm run test:coverage
```

**예상 결과:**
```
✅ Build: SUCCESS
✅ Pages: 86 pages
✅ First Load JS: 87.6 kB
✅ Tests: 98/98 passing (100%)
✅ Coverage: 70%+ (branches, functions, lines, statements)
✅ Lint: 0 errors, 0 warnings
✅ TypeScript: 0 errors
```

### 2. 성능 검증

```bash
# Bundle 분석
npm run analyze
```

**확인 사항:**
- [ ] First Load JS < 100 kB
- [ ] 번들 크기 적정성
- [ ] 불필요한 dependencies 제거
- [ ] Code splitting 적용

### 3. 보안 검증

**체크리스트:**
- [ ] `.env` 파일이 `.gitignore`에 포함됨
- [ ] `.env.example` 파일이 최신 상태
- [ ] 민감 데이터 로깅 제거 확인
- [ ] API Rate Limiting 구현 확인
- [ ] CORS 설정 검증

---

## 🚀 Vercel 배포 프로세스

### Step 1: Vercel 계정 준비

```bash
# Vercel CLI 설치
npm i -g vercel

# Vercel 로그인
vercel login
```

### Step 2: 프로젝트 연결

```bash
# 프로젝트 디렉토리로 이동
cd /Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu

# Vercel 프로젝트 링크 (첫 배포만)
vercel link
```

**프롬프트 응답:**
- Set up and deploy?: `Y`
- Scope: (본인 계정 선택)
- Link to existing project?: `N`
- Project name: `jikguyeokgu` (또는 원하는 이름)
- Directory: `./`
- Override settings?: `N`

### Step 3: 환경 변수 설정

#### 필수 환경 변수

Vercel Dashboard → Settings → Environment Variables에서 추가:

```bash
# Database (Production)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_URL=https://jikguyeokgu.vercel.app  # 또는 커스텀 도메인
NEXTAUTH_SECRET=[GENERATE_NEW_SECRET]

# Cron Job Security
CRON_SECRET=[GENERATE_NEW_SECRET]
```

#### Secret 생성

```bash
# NEXTAUTH_SECRET 생성
openssl rand -base64 32

# CRON_SECRET 생성
openssl rand -base64 32
```

#### CLI로 환경 변수 추가 (선택)

```bash
# Production 환경 변수 추가
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production

# Preview 환경 변수 (선택)
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_URL preview
```

#### 선택 환경 변수 (기능별)

**OAuth - 한국**
```bash
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

**OAuth - 중국**
```bash
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

**OAuth - 글로벌**
```bash
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**결제 시스템**
```bash
# Stripe (글로벌)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# 토스페이먼츠 (한국)
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 알리페이 (중국)
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
```

**파일 저장소**
```bash
# Option 1: Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Option 2: AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=ap-northeast-2

# Option 3: Cloudflare R2
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
CDN_URL=
```

**기타 서비스**
```bash
# 번역
DEEPL_API_KEY=

# 이메일
RESEND_API_KEY=

# Firebase (푸시 알림)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# 환율 API
EXCHANGE_RATE_API_KEY=

# SMS 인증
COOLSMS_API_KEY=
COOLSMS_API_SECRET=
COOLSMS_SENDER_NUMBER=
```

### Step 4: 배포 실행

#### Preview 배포 (테스트용)

```bash
# Preview 배포
vercel

# 배포 URL 확인
# 예: https://jikguyeokgu-abc123.vercel.app
```

#### Production 배포

```bash
# Production 배포
vercel --prod

# 배포 URL
# 예: https://jikguyeokgu.vercel.app
```

### Step 5: Cron Jobs 활성화

**vercel.json 확인:**

```json
{
  "crons": [
    {
      "path": "/api/exchange-rate/update",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/orders/auto-confirm",
      "schedule": "0 15 * * *"
    },
    {
      "path": "/api/ads/weekly-close",
      "schedule": "0 1 * * 1"
    },
    {
      "path": "/api/disputes/process-expired",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/coupon-automation",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/seller-grades",
      "schedule": "0 2 * * 0"
    },
    {
      "path": "/api/cron/review-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/price-alerts",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/best-reviews",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

**Cron Job 활성화 확인:**
- Vercel Dashboard → Project → Settings → Cron Jobs
- 9개 Cron Job이 모두 등록되었는지 확인
- 다음 실행 시간 확인

---

## 🗄️ 데이터베이스 설정

### 1. Supabase 프로덕션 DB 준비

#### Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `jikguyeokgu-production`
   - Database Password: 강력한 비밀번호 생성 (저장 필수)
   - Region: `Northeast Asia (Seoul)` 또는 `Northeast Asia (Tokyo)`
4. "Create new project" 클릭

#### Connection String 확인

Supabase Dashboard → Settings → Database:

```bash
# Connection Pooling (권장)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# Direct Connection
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### 2. Prisma 마이그레이션

#### 로컬 환경 변수 설정

```bash
# .env.production.local 파일 생성 (임시)
echo "DATABASE_URL=postgresql://..." > .env.production.local
```

#### 마이그레이션 실행

```bash
# Prisma Client 생성
npx prisma generate

# 프로덕션 DB에 마이그레이션 적용
npx prisma migrate deploy

# 성공 확인
npx prisma db push
```

**예상 결과:**
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Datasource "db": PostgreSQL database "postgres"
✓ Applying migration `20240101000000_init`
✓ Migration `20240101000000_init` applied successfully
```

### 3. Seed 데이터 생성

#### 관리자 계정 생성

```bash
# prisma/set-admin.ts 수정
# 프로덕션 관리자 이메일/비밀번호 설정

npm run db:set-admin
```

#### 기본 데이터 생성

```bash
# 카테고리, 배송 템플릿 등
npm run db:seed
```

**생성될 데이터:**
- [ ] 관리자 계정 (1개)
- [ ] 상품 카테고리 (주요 카테고리 10-15개)
- [ ] 배송 템플릿 (기본 템플릿 3-5개)
- [ ] 시스템 설정 (환율, 수수료 등)

### 4. 데이터베이스 백업 설정

#### Supabase 자동 백업

Supabase Dashboard → Settings → Backups:
- Point-in-time Recovery (PITR): 활성화
- 백업 보관 기간: 7일 (Free) / 30일 (Pro)

#### 수동 백업 스크립트

```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
```

---

## 🧪 배포 후 검증

### 1. 필수 기능 테스트

#### 페이지 접속 테스트

```bash
# 홈페이지
curl -I https://jikguyeokgu.vercel.app

# 상태 코드: 200 OK 확인
```

**브라우저 테스트:**
- [ ] 홈페이지 로드
- [ ] 로그인 페이지
- [ ] 회원가입 페이지
- [ ] 상품 목록 페이지
- [ ] 404 페이지
- [ ] 500 에러 페이지

#### 인증 테스트

```bash
# Session 확인
curl https://jikguyeokgu.vercel.app/api/auth/session

# 응답: {"user": null} 또는 사용자 정보
```

**브라우저 테스트:**
- [ ] 이메일 로그인
- [ ] OAuth 로그인 (Kakao, Naver, Google)
- [ ] 로그아웃
- [ ] 비밀번호 재설정
- [ ] 회원가입

#### API 테스트

```bash
# Health Check (있다면)
curl https://jikguyeokgu.vercel.app/api/health

# Cron Job 수동 실행 (테스트)
curl -X GET https://jikguyeokgu.vercel.app/api/cron/coupon-automation \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### 2. 성능 테스트

#### Lighthouse 테스트

```bash
# Chrome DevTools → Lighthouse
# 또는 CLI 사용
npm install -g lighthouse
lighthouse https://jikguyeokgu.vercel.app --view
```

**목표 점수:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

#### Core Web Vitals

브라우저 DevTools → Network → Performance:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 3. 에러 모니터링

#### Vercel 로그 확인

```bash
# Vercel CLI로 실시간 로그 확인
vercel logs

# 특정 배포의 로그
vercel logs [deployment-url]
```

**Vercel Dashboard:**
- Deployments → 최신 배포 → Logs
- 에러 메시지 확인
- 스택 트레이스 분석

#### 로그 분석

**정상 로그 예시:**
```
[info] Server listening on http://localhost:3000
[info] Compiled successfully
[info] Page: /
[info] API: /api/auth/session
```

**에러 로그 확인:**
- Database connection errors
- API route errors
- Build errors
- Runtime errors

---

## 📊 모니터링 설정

### 1. Vercel Analytics (기본)

#### 활성화

Vercel Dashboard → Project → Analytics → Enable

**제공 기능:**
- Page Views (페이지 뷰)
- Unique Visitors (고유 방문자)
- Top Pages (인기 페이지)
- Top Referrers (유입 경로)
- Devices & Browsers (디바이스/브라우저 분석)

### 2. Web Vitals 리포팅

#### app/layout.tsx에 추가

```typescript
// src/app/layout.tsx
import { reportWebVitals } from '@/lib/performance'

export function onWebVitals(metric: any) {
  reportWebVitals(metric)
}
```

**또는 Vercel Analytics 통합:**

```typescript
// next.config.js
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
}
```

### 3. 기본 에러 추적

**현재 구현된 기능:**
- Error Boundary (클라이언트 에러 캡처)
- API 에러 표준화 (14개 에러 코드)
- Pino 로깅 (구조화된 JSON 로그)
- 민감 데이터 자동 제거

**Vercel 함수 로그:**
- Vercel Dashboard → Functions
- 각 API route의 실행 로그
- 에러 발생 시 알림 설정 가능

### 4. 데이터베이스 모니터링

#### Supabase Dashboard

- Database → Connection Pooling: 활성 연결 수
- Database → Query Performance: 느린 쿼리 분석
- Database → Logs: SQL 쿼리 로그

**알림 설정:**
- 연결 수 임계값
- 느린 쿼리 감지
- 에러 발생 알림

---

## 🧪 베타 테스트 계획

### 1. 테스트 사용자 모집

#### 목표

- **테스터 수**: 10-20명
- **기간**: 2주
- **보상**: 초기 가입 포인트, 쿠폰 제공

#### 테스터 구성

- 한국 사용자: 7-10명 (주 타겟)
- 중국 사용자: 3-5명 (가능하면)
- 개발자/기술 사용자: 2-3명 (버그 발견)

#### 모집 방법

- 지인 초대
- 온라인 커뮤니티 (커뮤니티 규칙 확인)
- 소셜 미디어
- 테스터 모집 플랫폼

### 2. 테스트 시나리오

#### 회원 관리
- [ ] 이메일 회원가입
- [ ] OAuth 로그인 (Kakao, Naver, Google)
- [ ] 프로필 수정
- [ ] 비밀번호 변경
- [ ] 로그아웃

#### 상품 관리 (판매자)
- [ ] 상품 등록
- [ ] 상품 이미지 업로드
- [ ] 상품 수정/삭제
- [ ] 재고 관리
- [ ] 상품 검색

#### 쇼핑 (구매자)
- [ ] 상품 검색 (키워드, 카테고리)
- [ ] 상품 상세 보기
- [ ] 장바구니 추가/삭제
- [ ] 찜하기
- [ ] 가격 알림 설정

#### 주문 프로세스 (Mock)
- [ ] 장바구니에서 주문하기
- [ ] 배송지 입력
- [ ] 결제 방법 선택 (Mock - 실제 결제 없음)
- [ ] 주문 확인
- [ ] 주문 내역 조회

#### 리뷰 & 평점
- [ ] 리뷰 작성
- [ ] 이미지 리뷰
- [ ] 포인트 적립 확인
- [ ] 베스트 리뷰 선정 확인

#### 쿠폰 & 프로모션
- [ ] 쿠폰 발급
- [ ] 쿠폰 사용
- [ ] 자동 쿠폰 발급 확인

#### 알림
- [ ] 실시간 알림 수신 (주문, 리뷰 등)
- [ ] 알림 설정 변경
- [ ] 가격 변동 알림

#### 채팅
- [ ] 1:1 채팅 시작
- [ ] 메시지 전송/수신
- [ ] 파일 전송 (이미지)

#### 관리자 기능
- [ ] 관리자 로그인
- [ ] 사용자 관리
- [ ] 상품 관리
- [ ] 주문 관리
- [ ] 통계 확인

### 3. 피드백 수집

#### 피드백 양식 (Google Forms / Notion)

**버그 리포트:**
- 버그 설명
- 재현 단계
- 예상 결과 vs 실제 결과
- 스크린샷 (필수)
- 브라우저/디바이스 정보
- 우선순위 (Critical, High, Medium, Low)

**사용성 피드백:**
- 직관적이었나요? (1-5점)
- 느린 부분이 있었나요?
- 혼란스러운 UI는?
- 개선 제안
- 좋았던 점

**성능 피드백:**
- 로딩 속도 (1-5점)
- 반응 속도 (1-5점)
- 버벅임 여부
- 디바이스 발열 여부

#### 피드백 분석

**매일:**
- 새로운 버그 리포트 확인
- Critical 버그 즉시 수정

**주간:**
- 피드백 통계 분석
- 개선 우선순위 결정
- 다음 주 계획 수립

**테스트 종료 후:**
- 최종 리포트 작성
- 프로덕션 배포 여부 결정
- Phase 6 계획 수정

### 4. 테스트 지원

#### 테스터 온보딩

**환영 이메일:**
- 베타 테스트 목적 설명
- 테스트 시나리오 제공
- 피드백 제출 방법
- 연락처 (이슈 발생 시)

**가이드 문서:**
- 빠른 시작 가이드
- 주요 기능 사용법
- FAQ
- 알려진 이슈 목록

#### 테스터 소통

**채널:**
- Slack / Discord 채널 (선택)
- 이메일
- Google Forms

**주간 업데이트:**
- 수정된 버그 목록
- 새로운 기능 추가
- 다음 주 테스트 포커스

---

## 📝 문서화

### 1. API 문서

#### Swagger/OpenAPI (선택)

```bash
# Swagger 설치
npm install next-swagger-doc swagger-ui-react

# swagger.ts 설정
```

**또는 Notion/Markdown 문서:**

- API 엔드포인트 목록
- Request/Response 예시
- 에러 코드 설명 (14개)
- 인증 방법 (Bearer Token)

#### API 엔드포인트 예시

**인증:**
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- GET `/api/auth/session` - 세션 확인

**상품:**
- GET `/api/products` - 상품 목록
- GET `/api/products/[id]` - 상품 상세
- POST `/api/products` - 상품 등록
- PUT `/api/products/[id]` - 상품 수정
- DELETE `/api/products/[id]` - 상품 삭제

**주문:**
- POST `/api/orders` - 주문 생성
- GET `/api/orders` - 주문 목록
- GET `/api/orders/[id]` - 주문 상세

### 2. 사용자 가이드

#### 판매자 가이드

- [ ] 회원가입 및 로그인 방법
- [ ] 상품 등록 방법 (이미지, 설명, 가격)
- [ ] 재고 관리 방법
- [ ] 주문 처리 프로세스
- [ ] 정산 확인 방법

#### 구매자 가이드

- [ ] 상품 검색 및 필터링
- [ ] 장바구니 사용법
- [ ] 주문 방법
- [ ] 결제 방법 (베타: Mock)
- [ ] 리뷰 작성 방법

### 3. 관리자 가이드

- [ ] 관리자 로그인
- [ ] 사용자 관리 (승인, 차단)
- [ ] 상품 관리 (승인, 숨김)
- [ ] 주문 관리
- [ ] 통계 및 리포트

### 4. 개발자 문서

- [ ] 프로젝트 구조
- [ ] 환경 설정 방법
- [ ] 로컬 개발 가이드
- [ ] 배포 프로세스
- [ ] 트러블슈팅 가이드

---

## 🔒 보안 최종 점검

### 환경 변수
- [x] `.env` 파일 git 커밋 안됨
- [x] `.env.example` 최신 상태
- [ ] Vercel 환경 변수 설정 완료
- [ ] Secret 값 안전하게 저장 (1Password 등)

### 인증/인가
- [ ] NEXTAUTH_SECRET 프로덕션용 생성
- [ ] CRON_SECRET 생성
- [ ] JWT 설정 확인
- [ ] Session timeout 설정

### API 보안
- [ ] Rate Limiting 동작 확인
- [ ] CORS 설정
- [ ] SQL Injection 방지 (Prisma)
- [ ] XSS 방지 (React)

### 데이터 보안
- [ ] 비밀번호 해싱 (bcrypt)
- [x] 민감 데이터 로그 제거 (이미 구현)
- [ ] HTTPS 강제
- [ ] 데이터베이스 백업 설정

---

## 📈 성공 지표

### 기술 지표

**현재 달성:**
- ✅ Build: SUCCESS
- ✅ Tests: 98/98 (100%)
- ✅ Bundle: 87.6 kB (< 100 kB ✅)
- ✅ TypeScript: 0 errors
- ✅ Lint: 0 warnings

**배포 후 목표:**
- ⏳ Lighthouse: 90+ (모든 영역)
- ⏳ Core Web Vitals: Good
- ⏳ Uptime: 99.9%
- ⏳ API Response Time: < 200ms

### 비즈니스 지표 (2주)

- 회원가입: 10-20명
- 상품 등록: 5-10개
- Mock 주문: 3-5건
- 리뷰 작성: 2-3개
- 버그 리포트: < 10개 Critical

### 사용자 만족도

- 사용 편의성: 4/5 이상
- 성능 만족도: 4/5 이상
- 재사용 의향: 70% 이상
- NPS (Net Promoter Score): > 0

---

## 🚨 긴급 대응 계획

### 롤백 절차

```bash
# Vercel Dashboard에서 이전 배포로 롤백
# 또는 CLI 사용
vercel rollback
```

### Hotfix 프로세스

```bash
# Hotfix 브랜치 생성
git checkout -b hotfix/critical-issue

# 수정 및 커밋
git add .
git commit -m "hotfix: Fix critical issue"

# 즉시 배포
git push origin hotfix/critical-issue
vercel --prod

# Main 브랜치에 병합
git checkout main
git merge hotfix/critical-issue
git push origin main
```

### 연락 체계

- **개발자**: [연락처]
- **관리자**: [연락처]
- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.com

### 다운타임 대응

**모니터링:**
- Vercel Analytics → Real-time
- UptimeRobot 설정 (선택)

**알림:**
- 이메일 알림
- Slack/Discord Webhook (선택)

**대응:**
1. 에러 로그 확인
2. 데이터베이스 상태 확인
3. 롤백 또는 Hotfix
4. 사용자 공지

---

## ✅ 배포 완료 후 체크리스트

### 즉시 확인 (배포 후 1시간 이내)

- [ ] 홈페이지 접속 확인
- [ ] 로그인 기능 테스트
- [ ] 상품 목록 확인
- [ ] API 응답 확인
- [ ] Vercel 로그 확인
- [ ] 데이터베이스 연결 확인
- [ ] Cron Jobs 등록 확인

### 24시간 모니터링

- [ ] Vercel Analytics 확인
- [ ] 에러 로그 모니터링
- [ ] 성능 메트릭 확인
- [ ] 데이터베이스 쿼리 성능
- [ ] Cron Job 첫 실행 확인

### 1주일 후

- [ ] 베타 테스터 피드백 수집
- [ ] 주요 버그 수정
- [ ] 성능 개선 적용
- [ ] 통계 분석
- [ ] 중간 보고서 작성

### 2주일 후 (베타 테스트 종료)

- [ ] 최종 베타 테스트 보고서
- [ ] 프로덕션 배포 여부 결정
- [ ] Phase 6 작업 계획 수정
- [ ] 정식 런칭 준비

---

## 🎯 다음 단계: Phase 6 (Month 3-4)

### 계획된 작업

**Analytics & Monitoring:**
- Sentry 통합 (에러 추적)
- Google Analytics 통합
- CloudWatch Logs (로그 집계)
- DataDog APM (성능 모니터링)

**실제 API 통합:**
- 결제: Stripe, 토스페이먼츠, 알리페이
- SMS: CoolSMS, 알리바바 클라우드
- 이메일: Resend
- 번역: DeepL
- 환율: Exchange Rate API

**고급 기능:**
- 실시간 재고 동기화
- 고급 검색 (Elasticsearch)
- 추천 시스템
- A/B 테스팅

---

**작성일**: 2024년
**작성자**: Claude (Anthropic)
**프로젝트**: 직구역구 (JIKGUYEOKGU)
**Phase**: Week 7-8 베타 배포 🚀
**버전**: Beta v1.0.0
**상태**: 배포 준비 완료 ✅
