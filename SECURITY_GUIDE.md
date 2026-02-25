# 보안 가이드

직구역구 프로젝트의 보안 설정 및 가이드라인입니다.

---

## 📋 목차

1. [보안 개요](#보안-개요)
2. [Rate Limiting](#rate-limiting)
3. [CORS 설정](#cors-설정)
4. [보안 헤더](#보안-헤더)
5. [XSS 방어](#xss-방어)
6. [CSRF 방어](#csrf-방어)
7. [SQL Injection 방어](#sql-injection-방어)
8. [환경 변수 보안](#환경-변수-보안)
9. [API 보안 체크리스트](#api-보안-체크리스트)

---

## 🔒 보안 개요

### 적용된 보안 기능

✅ **Rate Limiting** - API 요청 제한
✅ **CORS** - Cross-Origin 요청 제어
✅ **보안 헤더** - XSS, Clickjacking 방어
✅ **NextAuth.js** - 안전한 인증 시스템
✅ **Prisma ORM** - SQL Injection 방어
✅ **HTTPS 강제** - Vercel 자동 적용

⚠️ **추가 필요**:
- DDoS 방어 (Cloudflare Pro)
- 파일 업로드 검증 강화
- 로그 모니터링 (Sentry)
- 정기 보안 감사

---

## 🚦 Rate Limiting

### 구현 위치
`src/lib/rate-limiter.ts`

### 기본 설정

| 엔드포인트 타입 | 제한 | 설명 |
|-----------------|------|------|
| API (일반) | 60회/분 | 일반 API 요청 |
| 인증 | 5회/분 | 로그인, 회원가입 |
| 결제 | 3회/분 | 결제 관련 요청 |
| 파일 업로드 | 10회/분 | 이미지 업로드 |
| 검색 | 30회/분 | 상품 검색 |

### 사용 방법

#### 1. API Route에 적용

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authLimiter, withRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Rate Limit 체크
  const rateLimitError = await withRateLimit(request, authLimiter);
  if (rateLimitError) return rateLimitError;

  // 정상 처리
  // ...
}
```

#### 2. 사용자 ID 기반 제한

```typescript
import { authLimiter, withRateLimit } from '@/lib/rate-limiter';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession();

  // 로그인한 사용자는 ID 기반, 아니면 IP 기반
  const identifier = session?.user?.id;
  const rateLimitError = await withRateLimit(request, authLimiter, identifier);
  if (rateLimitError) return rateLimitError;

  // ...
}
```

#### 3. 커스텀 Rate Limiter 생성

```typescript
import { RateLimiter } from '@/lib/rate-limiter';

// 1시간당 100회
const customLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1시간
  uniqueTokenPerInterval: 100,
});
```

### 응답 헤더

Rate Limiting 적용 시 다음 헤더가 포함됩니다:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
Retry-After: 15
```

### 프로덕션 고려사항

⚠️ **현재 구현은 메모리 기반**으로, 서버 재시작 시 초기화됩니다.

프로덕션 환경에서는 **Redis** 기반으로 전환 권장:

```typescript
// Redis 예시 (구현 필요)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(identifier: string) {
  const key = `rate-limit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 1분
  }

  return count <= 60;
}
```

---

## 🌐 CORS 설정

### 구현 위치
`src/middleware.ts`

### 허용된 도메인

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://jikguyeokgu.vercel.app',
  // 프로덕션 도메인 추가
];
```

### 배포 시 설정

프로덕션 도메인을 추가하세요:

```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  'https://jikguyeokgu.com',
  'https://www.jikguyeokgu.com',
  'https://api.jikguyeokgu.com',
];
```

### CORS 헤더

```
Access-Control-Allow-Origin: https://jikguyeokgu.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## 🛡️ 보안 헤더

### 구현 위치
`src/middleware.ts`

### 적용된 헤더

#### 1. X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
브라우저가 MIME 타입을 추측하지 못하도록 방지

#### 2. X-Frame-Options
```
X-Frame-Options: DENY
```
Clickjacking 공격 방어 (iframe 사용 차단)

#### 3. X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
구형 브라우저 XSS 필터 활성화

#### 4. Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
Referrer 정보 최소화

#### 5. Content-Security-Policy
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.tosspayments.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  connect-src 'self' https://*.supabase.co https://*.pusher.com;
```

**설명**:
- `default-src 'self'`: 기본적으로 같은 도메인만 허용
- `script-src`: JavaScript 실행 허용 도메인
- `style-src`: CSS 허용 도메인
- `img-src`: 이미지 허용 소스
- `connect-src`: AJAX/WebSocket 허용 도메인

#### 6. Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```
브라우저 기능 권한 제어

### CSP 테스트

CSP 위반 시 브라우저 콘솔에서 확인:

```
Refused to load the script 'https://evil.com/script.js' because it violates the following Content Security Policy directive: "script-src 'self'".
```

### CSP Report-Only 모드 (개발 중)

프로덕션 전 테스트:

```typescript
response.headers.set(
  'Content-Security-Policy-Report-Only',
  "default-src 'self'; report-uri /api/csp-report"
);
```

---

## 🔐 XSS 방어

### React의 기본 보호

React는 기본적으로 XSS를 방어합니다:

```tsx
// 안전: 자동 이스케이프
<div>{userInput}</div>

// 위험: dangerouslySetInnerHTML 사용 시
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### 안전한 사용

#### ❌ 위험한 코드

```tsx
// 사용자 입력을 직접 HTML로 렌더링
<div dangerouslySetInnerHTML={{ __html: comment }} />
```

#### ✅ 안전한 코드

```tsx
// 라이브러리로 sanitize
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(comment);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### 추천 라이브러리

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

### 사용자 입력 검증

```typescript
import { z } from 'zod';

const reviewSchema = z.object({
  comment: z.string()
    .min(10)
    .max(1000)
    .regex(/^[a-zA-Z0-9가-힣\s\.,!?]*$/, '특수문자는 사용할 수 없습니다'),
});
```

---

## 🛡️ CSRF 방어

### NextAuth.js 기본 보호

NextAuth.js는 CSRF 토큰을 자동으로 생성하고 검증합니다.

### API Route 보호

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  // 세션 확인으로 CSRF 방어
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ...
}
```

### 외부 폼 제출 방지

```typescript
// Referer 헤더 확인
const referer = request.headers.get('referer');
const allowedReferers = [
  'https://jikguyeokgu.com',
  'http://localhost:3000',
];

if (!referer || !allowedReferers.some(r => referer.startsWith(r))) {
  return new Response('Invalid referer', { status: 403 });
}
```

---

## 💉 SQL Injection 방어

### Prisma ORM 사용

Prisma는 **자동으로 SQL Injection을 방어**합니다:

```typescript
// ✅ 안전: Prisma가 파라미터를 이스케이프
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// ✅ 안전: Prisma가 자동 보호
const products = await prisma.product.findMany({
  where: {
    name: { contains: searchQuery }
  }
});
```

### 원시 쿼리 사용 시 주의

```typescript
// ❌ 위험: SQL Injection 가능
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;

// ✅ 안전: 파라미터화된 쿼리
const result = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${Prisma.sql`${userInput}`}
`;
```

---

## 🔑 환경 변수 보안

### 민감 정보 보호

#### ❌ 절대 커밋하지 말 것

```env
# .env.local (git에서 제외)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
TOSS_SECRET_KEY="..."
```

#### ✅ 예시 파일만 커밋

```env
# .env.example (git에 포함)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
NEXTAUTH_SECRET="your-secret-min-32-chars"
TOSS_SECRET_KEY="test_sk_xxxxx"
```

### .gitignore 확인

```gitignore
# 환경 변수
.env
.env.local
.env.production.local
.env.development.local

# 민감 파일
*.pem
*.key
secrets/
```

### 프론트엔드 노출 방지

```typescript
// ❌ 클라이언트에 노출됨
const SECRET_KEY = process.env.SECRET_KEY;

// ✅ 서버에서만 사용 (API Route)
export async function POST(request: Request) {
  const SECRET_KEY = process.env.SECRET_KEY; // 안전
  // ...
}

// ✅ 공개 가능한 값만 NEXT_PUBLIC_ 접두사
const PUBLIC_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
```

### Vercel 환경 변수

1. Vercel 대시보드 > Settings > Environment Variables
2. 각 환경별 설정 (Production, Preview, Development)
3. 민감 정보는 "Sensitive" 체크

---

## ✅ API 보안 체크리스트

### 인증이 필요한 API

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const rateLimitError = await withRateLimit(request, apiLimiter);
  if (rateLimitError) return rateLimitError;

  // 2. 인증 확인
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 3. 입력 검증
  const body = await request.json();
  const validated = schema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }

  // 4. 권한 확인
  const resource = await prisma.product.findUnique({
    where: { id: validated.data.id }
  });

  if (resource.sellerId !== session.user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // 5. 안전한 DB 작업 (Prisma)
  const result = await prisma.product.update({
    where: { id: validated.data.id },
    data: validated.data
  });

  return NextResponse.json({ data: result });
}
```

### 체크리스트

- [ ] Rate Limiting 적용
- [ ] 인증 확인 (세션/토큰)
- [ ] 입력 검증 (Zod 스키마)
- [ ] 권한 확인 (본인 확인)
- [ ] SQL Injection 방어 (Prisma 사용)
- [ ] XSS 방어 (입력 sanitize)
- [ ] CSRF 방어 (세션 확인)
- [ ] 에러 메시지에 민감 정보 포함 안 함
- [ ] HTTPS 사용
- [ ] 로그 기록

---

## 🔍 보안 테스트

### 1. Rate Limiting 테스트

```bash
# 60회 요청 (제한 초과 시 429 에러)
for i in {1..61}; do
  curl -X GET http://localhost:3000/api/products
  echo "Request $i"
done
```

### 2. CORS 테스트

```bash
# 허용되지 않은 도메인에서 요청
curl -X GET http://localhost:3000/api/products \
  -H "Origin: https://evil.com"
```

### 3. 인증 테스트

```bash
# 토큰 없이 요청 (401 에러)
curl -X GET http://localhost:3000/api/mypage/orders

# 유효하지 않은 토큰 (401 에러)
curl -X GET http://localhost:3000/api/mypage/orders \
  -H "Authorization: Bearer invalid-token"
```

### 4. XSS 테스트

```typescript
// 테스트 케이스
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
];

// 모두 이스케이프되거나 차단되어야 함
```

---

## 🚨 보안 사고 대응

### 1. 의심스러운 활동 감지

```typescript
// 로그 기록
console.error('[SECURITY] Suspicious activity detected:', {
  ip: request.ip,
  endpoint: request.url,
  userId: session?.user?.id,
  timestamp: new Date().toISOString(),
});

// 관리자 알림 발송
await sendAdminNotification({
  type: 'SECURITY_ALERT',
  message: 'Multiple failed login attempts',
});
```

### 2. 즉시 조치

1. 의심스러운 IP 차단
2. 사용자 세션 강제 종료
3. 비밀번호 재설정 요구
4. 관리자에게 알림

### 3. 사후 조치

1. 로그 분석
2. 취약점 패치
3. 보안 강화
4. 사용자 공지

---

## 📚 추가 리소스

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables#security)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Prisma Security](https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-injection)

---

## 📞 보안 문의

보안 취약점을 발견하셨나요?

- **이메일**: security@jikguyeokgu.com
- **우선 처리**: 심각도 높은 취약점
- **보상**: 버그 바운티 프로그램 (준비 중)

---

**마지막 업데이트**: 2026-02-25
