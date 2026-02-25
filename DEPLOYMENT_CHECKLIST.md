# 배포 체크리스트 (Deployment Checklist)

## 🎯 배포 전 필수 작업

### 1. ✅ Prisma 데이터베이스 마이그레이션

```bash
# 프로덕션 데이터베이스에 마이그레이션 적용
npx prisma migrate deploy

# Prisma Client 재생성
npx prisma generate
```

📖 자세한 내용: [PRISMA_MIGRATION_GUIDE.md](./PRISMA_MIGRATION_GUIDE.md)

---

### 2. ✅ 환경 변수 설정

Vercel Dashboard > Settings > Environment Variables에 다음 변수 추가:

#### 필수 환경 변수

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"

# Cron Job 보안 (중요!)
CRON_SECRET="your-random-secure-key-here"
```

#### Firebase (푸시 알림용)

```bash
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

**Firebase 설정 방법:**
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 생성
3. Settings > Service accounts > Generate new private key
4. JSON 파일 다운로드 후 환경 변수 추가

#### 기타 필요한 변수들

```bash
# 파일 스토리지
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."

# 결제
STRIPE_SECRET_KEY="..."
TOSS_SECRET_KEY="..."

# SMS 인증
COOLSMS_API_KEY="..."
COOLSMS_API_SECRET="..."

# 환율 API
EXCHANGE_RATE_API_KEY="..."

# 번역 API
DEEPL_API_KEY="..."
```

---

### 3. ✅ Vercel Cron Job 설정 확인

`vercel.json` 파일이 다음 Cron Job을 포함하는지 확인:

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

**Cron Job 스케줄:**
- `환율 업데이트`: 매일 00:00
- `주문 자동 확정`: 매일 15:00
- `광고 입찰 마감`: 매주 월요일 01:00
- `분쟁 만료 처리`: 매일 02:00
- `쿠폰 자동화`: 매일 09:00
- `판매자 등급 갱신`: 매주 일요일 02:00
- `리뷰 작성 독려`: 매일 10:00
- `가격 변동 알림`: 6시간마다
- `베스트 리뷰 선정`: 매월 1일 00:00

---

### 4. ✅ 빌드 테스트

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# 빌드 성공 확인
npm run start
```

**예상 결과:**
- ✓ Compiled successfully
- 210+ routes 생성
- 0 TypeScript errors

---

### 5. ✅ 데이터베이스 초기 데이터 설정

#### 카테고리 추가

```typescript
// 예시: Prisma Studio 또는 seed script 사용
await prisma.category.createMany({
  data: [
    { id: 'fashion', nameKo: '패션', nameZh: '时尚', slug: 'fashion' },
    { id: 'beauty', nameKo: '뷰티', nameZh: '美妆', slug: 'beauty' },
    { id: 'food', nameKo: '식품', nameZh: '食品', slug: 'food' },
    // ... 추가 카테고리
  ]
});
```

#### 환율 초기값 설정

```bash
# API 호출로 환율 초기화
curl -X POST https://yourdomain.com/api/exchange-rate/update \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

---

### 6. ✅ 보안 설정

#### Vercel 설정

1. **Environment Variables**
   - Production에만 민감한 정보 추가
   - Preview/Development는 별도 설정

2. **Deployment Protection**
   - Vercel Dashboard > Settings > Deployment Protection
   - Password Protection 활성화 (선택)

3. **Custom Domain**
   - SSL/TLS 자동 설정 확인
   - HTTPS 강제 리다이렉트

#### 데이터베이스 보안

1. **Supabase RLS (Row Level Security)**
   - 필요시 RLS 정책 추가
   - API 키 관리

2. **Connection Pooling**
   - Supabase Pooler 사용 확인
   - 최대 연결 수 설정

---

### 7. ✅ 모니터링 설정

#### Vercel Analytics

```bash
# next.config.mjs에 추가
const nextConfig = {
  // ... 기존 설정
  experimental: {
    instrumentationHook: true,
  },
};
```

#### Sentry (에러 추적)

1. [Sentry](https://sentry.io/) 프로젝트 생성
2. `@sentry/nextjs` 설치
3. `.sentryrc` 및 `sentry.client.config.ts` 설정

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

### 8. ✅ 성능 최적화 확인

#### 이미지 최적화

- Next.js Image 컴포넌트 사용 확인
- CDN 설정 (Cloudflare R2 또는 S3)

#### 코드 스플리팅

```bash
# 번들 크기 분석
npm run build
npx @next/bundle-analyzer
```

#### 캐싱 전략

- ISR (Incremental Static Regeneration) 활용
- SWR/React Query로 클라이언트 캐싱

---

### 9. ✅ 테스트

#### API 엔드포인트 테스트

```bash
# Health check
curl https://yourdomain.com/api/health

# 인증 테스트
curl https://yourdomain.com/api/auth/session

# Cron Job 테스트 (수동 실행)
curl -X GET https://yourdomain.com/api/cron/coupon-automation \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

#### 기능 테스트

- [ ] 회원가입/로그인
- [ ] 상품 등록/조회
- [ ] 주문/결제
- [ ] 리뷰 작성 (포인트 지급 확인)
- [ ] 쿠폰 발급/사용
- [ ] 알림 수신
- [ ] 찜목록 (가격 알림 설정)
- [ ] 판매자 등급 조회

---

### 10. ✅ 문서화

- [ ] API 문서 작성 (Swagger/OpenAPI)
- [ ] 사용자 가이드 작성
- [ ] 관리자 매뉴얼 작성
- [ ] FAQ 페이지 업데이트

---

## 🚀 배포 절차

### Vercel 배포

```bash
# Git push로 자동 배포
git add .
git commit -m "Phase 4 deployment"
git push origin main

# 또는 Vercel CLI 사용
vercel --prod
```

### 배포 후 확인

1. **빌드 로그 확인**
   - Vercel Dashboard > Deployments
   - 빌드 성공 확인

2. **도메인 접속 테스트**
   - https://yourdomain.com
   - SSL 인증서 확인

3. **Cron Job 실행 확인**
   - Vercel Dashboard > Cron Jobs
   - 다음 실행 시간 확인

4. **데이터베이스 연결 확인**
   - Supabase Dashboard > Database
   - Active connections 모니터링

---

## 📊 모니터링 대시보드

### Vercel Dashboard
- **Analytics**: 트래픽, 성능 지표
- **Logs**: 실시간 로그
- **Cron Jobs**: Cron 실행 내역

### Supabase Dashboard
- **Database**: 연결 수, 쿼리 성능
- **Storage**: 파일 사용량
- **API**: API 호출 통계

### Firebase Console
- **Cloud Messaging**: 푸시 알림 전송 통계
- **Analytics**: 사용자 행동 분석

---

## 🐛 배포 후 문제 해결

### 일반적인 문제

1. **Cron Job이 실행되지 않음**
   - `CRON_SECRET` 환경 변수 확인
   - Authorization 헤더 검증

2. **데이터베이스 연결 실패**
   - `DATABASE_URL` 확인
   - Supabase connection pooling 확인

3. **푸시 알림 전송 실패**
   - Firebase 환경 변수 확인
   - Private Key 줄바꿈 문자 `\n` 확인

4. **이미지 업로드 실패**
   - Supabase Storage 버킷 권한 확인
   - CORS 설정 확인

---

## 📞 지원

문제 발생 시:
1. Vercel 로그 확인
2. Sentry 에러 리포트 확인
3. 데이터베이스 쿼리 로그 분석
4. GitHub Issues에 보고

---

## ✅ 배포 완료 체크리스트

- [ ] Prisma 마이그레이션 완료
- [ ] 모든 환경 변수 설정
- [ ] Vercel Cron Job 활성화
- [ ] Firebase 설정 완료
- [ ] 프로덕션 빌드 성공
- [ ] 도메인 연결 및 SSL 확인
- [ ] 주요 기능 테스트 완료
- [ ] 모니터링 도구 설정
- [ ] 백업 정책 수립
- [ ] 팀원 교육 완료

**배포 날짜:** _______________
**배포자:** _______________
**버전:** Phase 4 (v1.4.0)
