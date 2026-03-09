# Claude Code 전용 가이드

> **새 세션 시작 시 필수 읽기 순서**
> 1. `PROJECT_STATUS.md` - 전체 프로젝트 현황
> 2. `TODO_LIST.md` - 작업 우선순위
> 3. 이 파일 - 작업 가이드라인

---

## 🚀 프로젝트 현황 (2026-03-09 기준)

```
프로젝트: 직구역구 (한중 크로스보더 C2C 마켓플레이스)
경로:     /Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu
상태:     개발 중 (사업자 등록 전)
배포:     Vercel (프로덕션)
진행률:   백엔드 95% | 프론트엔드 85%
```

### 완료된 Phase
- ✅ Phase 1-4: 기본 거래 ~ 고급 기능
- ✅ Phase 8-13: 보안 ~ 정산 시스템
- ✅ Phase 10-12: 광고/고객지원/알림

### 최근 완료 (2026-03-09)
- ✅ Cloudflare R2 이미지 업로드 설정 완료
- ✅ KREAM 스타일 전면 UI 리디자인 (11개 파일)
- ✅ 보안 강화 4종 (SMS 인증, Admin 3중 체크, 배송비 계산)
- ✅ React Hook 최적화 및 이미지 최적화 (15개)

---

## 📋 작업 우선순위

### 🔴 사업자 등록 후 즉시 (필수)
1. SMS 발송 구현 (알리고 연동)
2. Footer 사업자 정보 표시
3. 통신판매업 신고 완료

### 🟡 1~3개월 내 (중요)
4. NICE 본인인증 API
5. 국세청 사업자 번호 검증 API
6. SmartParcel 배송 추적 API
7. 판매자 등급 시스템 개선
8. 정산 시스템 배상금 로직

### 🟢 6개월 이후 (권장)
9. Sentry 에러 모니터링
10. Promotion/Cart 모델 구현
11. 위챗페이/알리페이 연동

**상세 내용**: `TODO_LIST.md`, `POST_BUSINESS_REGISTRATION_TODO.md` 참조

---

## ⚡ 작업 시작 전 필수 체크

### 매일 작업 시작 시
1. ✅ `PROJECT_STATUS.md` 읽기 → 전체 현황 파악
2. ✅ `TODO_LIST.md` 읽기 → 오늘 작업 확인
3. ✅ 관련 파일 Read → 수정 전 항상 읽기
4. ✅ 작업 시작

### 작업 완료 시
1. ✅ `PROJECT_STATUS.md` 업데이트 (완료일, 변경사항)
2. ✅ `TODO_LIST.md` 업데이트 (완료 항목 체크)
3. ✅ Git commit & push
4. ✅ 빌드 확인 (`npm run build`)

---

## 🔧 자주 쓰는 명령어

### 개발 서버
```bash
npm run dev
```

### 빌드 확인 (배포 전 필수)
```bash
npm run build

# 빌드 캐시 문제 시
rm -rf .next && npm run build
```

### DB 스키마 변경
```bash
# 개발 환경 (마이그레이션)
npx prisma migrate dev --name <migration_name>

# 프로덕션 DB에 직접 적용 (주의!)
npx prisma db push
npx prisma db push --accept-data-loss  # 데이터 손실 가능

# Prisma Client 재생성
npx prisma generate
```

### DB 조회
```bash
npx prisma studio  # GUI로 DB 조회
```

### 관리자 계정 생성
```bash
npx ts-node scripts/create-admin.ts
```

---

## 🗝️ 환경변수 빠른 참조

### 설정된 환경변수
```env
# Database
DATABASE_URL=postgresql://...  # Supabase PostgreSQL

# NextAuth
NEXTAUTH_URL=https://jikguyeokgu.vercel.app (또는 localhost:3000)
NEXTAUTH_SECRET=***

# OAuth
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
KAKAO_CLIENT_ID=***
KAKAO_CLIENT_SECRET=***
NAVER_CLIENT_ID=***  # ✅ 2026-02-23 추가
NAVER_CLIENT_SECRET=***  # ✅ 2026-02-23 추가

# Rate Limiting
UPSTASH_REDIS_REST_URL=***
UPSTASH_REDIS_REST_TOKEN=***

# Exchange Rate
EXCHANGE_RATE_API_KEY=***  # exchangerate-api.com
```

### 연동 대기 (사업자 등록 후)
```env
# SMS (알리고)
ALIGO_API_KEY=미설정
ALIGO_USER_ID=미설정
ALIGO_SENDER=미설정

# 본인인증 (NICE)
NICE_API_KEY=미설정

# 사업자 번호 검증 (국세청)
NTS_API_KEY=미설정

# 배송 추적 (SmartParcel)
SMARTPARCEL_API_KEY=미설정

# 에러 모니터링 (Sentry)
SENTRY_DSN=미설정
```

---

## 🏛️ 핵심 파일 위치

### 인증 관련
```
인증 설정 (Edge):  src/lib/auth.config.ts
인증 설정 (Node):  src/lib/auth.ts
회원가입 API:      src/app/api/auth/register/route.ts
SMS 발송 API:      src/app/api/auth/send-code/route.ts
SMS 라이브러리:    src/lib/sms.ts
```

### 레이아웃 및 컴포넌트
```
Root Layout:       src/app/layout.tsx (Analytics 포함)
메인 페이지:        src/app/(main)/page.tsx
관리자 페이지:      src/app/admin/page.tsx
관리자 레이아웃:    src/app/admin/layout.tsx
Header:            src/components/common/Header.tsx
Footer:            src/components/common/Footer.tsx (사업자 정보 추가 예정)
```

### 데이터베이스 및 서비스
```
DB 스키마:         prisma/schema.prisma
DB 클라이언트:     src/lib/db.ts (또는 src/lib/prisma.ts)
환율 서비스:       src/lib/exchange-rate.ts
Rate Limiting:     src/lib/rate-limit.ts
```

### Cron Jobs
```
환율 업데이트:     src/app/api/cron/exchange-rate/route.ts
베스트 리뷰 선정:  src/app/api/cron/select-best-reviews/route.ts
판매자 정산:       src/app/api/cron/seller-settlement/route.ts
배송사 정산:       src/app/api/cron/shipping-settlement/route.ts
```

### 정산 관련
```
판매자 정산 API:   src/app/api/seller/settlements/[yearMonth]/route.ts
판매자 설정 API:   src/app/api/seller/settings/route.ts
판매자 인증 API:   src/app/api/seller/verification/route.ts
배송사 정산 API:   src/app/api/shipping/settlements/[yearMonth]/route.ts
관리자 정산 API:   src/app/api/admin/settlements/route.ts
```

### 자동화 시스템
```
쿠폰 자동화:       src/lib/coupon-automation.ts
리뷰 보상:         src/lib/review-reward-system.ts
판매자 등급:       src/lib/seller-grade-system.ts
정산 Cron:         src/lib/cron/settlement.ts
```

---

## 🐛 알려진 이슈 및 해결법

### 빌드 에러
```
이슈: useSearchParams() 빌드 에러
해결: 해당 컴포넌트를 <Suspense>로 래핑

이슈: .next 캐시 오류
해결: rm -rf .next && npm run build

이슈: nationality column 재생성 경고
해결: npx prisma db push --accept-data-loss
```

### 개발 환경
```
이슈: SMS 코드가 실제로 발송되지 않음
상태: 정상 (콘솔 로그 출력, 사업자 등록 후 알리고 연동 예정)

이슈: 본인인증이 Mock으로 통과됨
상태: 정상 (개발용, NICE API 연동 예정)

이슈: 배송 추적이 Mock 데이터 반환
상태: 정상 (SmartParcel API 연동 예정)
```

---

## 📐 코딩 컨벤션

### 언어 및 방향 분기
```typescript
// 언어 분기
language === 'KO' ? '한국어' : '中文'
language === 'ZH' ? '中文' : '한국어'

// 방향 분기
direction === 'CN_TO_KR' ? '직구' : '역직구'
tradeDirection === 'KR_TO_CN' ? '역직구' : '직구'
```

### 다국어 데이터 구조
```typescript
// 카테고리, 게시글 등
{
  nameKo: '한국어 이름',
  nameZh: '中文名称',
  descriptionKo?: '한국어 설명',
  descriptionZh?: '中文说明'
}
```

### API 응답 형식
```typescript
// 성공
{ success: true, data: { ... } }

// 실패
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: '오류 메시지'
  }
}
```

### React 컴포넌트
```typescript
'use client'  // 클라이언트 컴포넌트는 최상단에 선언

// Suspense 필수 케이스
// - useSearchParams() 사용
// - useRouter() 사용
// - 동적 params 접근

import { Suspense } from 'react'

function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent />
    </Suspense>
  )
}
```

### CSS (Tailwind)
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-class",
  condition && "conditional-class",
  "another-class"
)}>
```

---

## 🗄️ 데이터베이스 주요 Enum

```typescript
// 사용자 타입
enum UserType {
  BUYER, SELLER, BOTH, SHIPPING, ADMIN
}

// 판매자 등급
enum SellerGrade {
  BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
}

// 주문 상태
enum OrderStatus {
  PENDING_PAYMENT, PAID, SHIPPING, DELIVERED,
  CONFIRMED, DISPUTED, REFUNDED, CANCELLED
}

// 결제 상태
enum PaymentStatus {
  PENDING, COMPLETED, ESCROW_HELD,
  RELEASED, REFUNDED, FAILED
}

// 분쟁 상태
enum DisputeStatus {
  OPEN, VOTING, RESOLVED, APPEALED
}

// 정산 상태
enum SettlementStatus {
  PENDING, APPROVED, PAID, REJECTED
}
```

---

## 🔒 보안 체크리스트

### 작업 시 확인사항
- [ ] API 라우트에 인증 체크 있는지 확인 (`auth()` 사용)
- [ ] 관리자 전용 API는 `userType === 'ADMIN'` 체크
- [ ] 민감 정보는 환경변수로 관리 (`.env.local`)
- [ ] 비밀번호는 bcrypt로 해싱 (12 rounds)
- [ ] Rate Limiting 적용 여부 확인
- [ ] SQL Injection 방지 (Prisma 사용으로 자동 방지)
- [ ] XSS 방지 (사용자 입력 sanitization)

---

## 📊 통계 및 현황

### 구현된 항목
- API 엔드포인트: 131개
- 데이터베이스 모델: 40개
- React 컴포넌트: 65개
- 페이지: 77개
- Cron Jobs: 9개

### 인증
- OAuth Provider: 3개 (Google, Kakao, Naver)
- 로그인 방식: 5개 (OAuth 3개 + 이메일/비밀번호 + 휴대폰)

### 자동화
- 쿠폰 자동 발급: 생일 쿠폰, 비활성 사용자 쿠폰
- 리뷰 보상: 베스트 리뷰 선정 (월 1회)
- 판매자 등급: 자동 업데이트
- 정산: 판매자/배송사 월 1회 자동

---

## 🔄 Git 워크플로우

### 커밋 메시지 형식
```
feat: 새 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 업데이트
style: 코드 스타일 변경
chore: 기타 작업

예시:
feat: Add Naver OAuth integration
fix: Resolve birthday coupon date comparison bug
docs: Update PROJECT_STATUS.md with latest changes
```

### 커밋 전 체크
```bash
# 1. 빌드 확인
npm run build

# 2. 타입 체크
npm run type-check  # 있다면

# 3. 린트 체크
npm run lint  # 있다면

# 4. 커밋
git add .
git commit -m "feat: Your message"
git push
```

---

## 📝 문서 업데이트 가이드

### PROJECT_STATUS.md 업데이트 시점
- 새로운 기능 완료 시
- 데이터베이스 스키마 변경 시
- 외부 API 연동 시
- Phase 완료 시

### TODO_LIST.md 업데이트 시점
- TODO 항목 완료 시
- 새로운 TODO 발견 시
- 우선순위 변경 시

### 업데이트 예시
```markdown
## ✅ 최근 완료 작업 (2026-02-XX)

### 1. 기능명
- 변경 파일: `src/path/to/file.ts`
- 변경 내용: 무엇을 했는지
- 영향 범위: 어디에 영향을 미치는지
```

---

## 🚨 긴급 상황 대응

### 빌드 실패 시
1. `.next` 폴더 삭제: `rm -rf .next`
2. `node_modules` 재설치: `rm -rf node_modules && npm install`
3. Prisma Client 재생성: `npx prisma generate`
4. 클린 빌드: `npm run build`

### DB 연결 실패 시
1. `.env.local`의 `DATABASE_URL` 확인
2. Supabase 콘솔에서 DB 상태 확인
3. Connection Pooler 사용 중인지 확인 (port 5432)

### 인증 에러 시
1. `NEXTAUTH_SECRET` 환경변수 확인
2. `NEXTAUTH_URL` 확인 (localhost:3000 또는 Vercel URL)
3. OAuth Provider 설정 확인 (클라이언트 ID/Secret)

---

## 💡 작업 팁

### 효율적인 작업 방법
1. **파일 읽기 먼저**: 수정 전 항상 Read 도구로 파일 읽기
2. **TODO 주석 활용**: 나중에 할 작업은 `// TODO:` 주석으로 표시
3. **콘솔 로그 활용**: 개발 중에는 `console.log()` 적극 활용
4. **타입 체크**: TypeScript 타입 에러 무시하지 않기
5. **빌드 확인**: 큰 변경 후에는 반드시 빌드 확인

### 자주 하는 실수
- ❌ 파일을 읽지 않고 수정
- ❌ TODO 완료 후 주석 제거하지 않음
- ❌ 환경변수를 코드에 하드코딩
- ❌ 빌드 확인 없이 푸시
- ❌ 문서 업데이트 누락

---

## 🎯 다음 작업 (사업자 등록 전)

### 즉시 진행 가능
- 판매자 등급 시스템 개선 (배송일 비교 로직)
- 정산 시스템 배상금 로직 구현
- 관리자 알림 시스템 (Resend)
- Cart/Promotion 모델 구현

### 사업자 등록 후
- SMS 발송 구현 (알리고)
- Footer 사업자 정보 표시
- 통신판매업 신고
- NICE 본인인증 API
- 국세청 사업자 번호 검증 API

---

**최종 업데이트**: 2026년 2월 26일
**다음 업데이트**: 주요 작업 완료 시
**관련 문서**: `PROJECT_STATUS.md`, `TODO_LIST.md`, `POST_BUSINESS_REGISTRATION_TODO.md`

*이 파일은 Claude Code 전용입니다. 작업마다 최신 상태로 유지하세요.*
