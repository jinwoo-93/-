# 로깅 시스템 구현 완료 보고서

## 📋 작업 개요
- **작업 항목**: 로깅 시스템 구현 (Week 5-6 MEDIUM Priority - 4/5)
- **완료일**: 2024년
- **상태**: ✅ 100% 완료

## 🎯 구현 내용

### 1. Pino 로거 설정
**파일**: `src/lib/logger.ts` (280줄)

#### 주요 기능
- ✅ 구조화된 JSON 로깅
- ✅ 로그 레벨 관리 (trace/debug/info/warn/error/fatal)
- ✅ 프로덕션/개발 환경 분리
- ✅ 빠른 성능 (비동기 로깅)
- ✅ Pretty 포맷 (개발 환경)
- ✅ Phase 6 Sentry 통합 준비

#### 로그 레벨
```typescript
trace: 10  // 매우 상세한 디버깅
debug: 20  // 디버깅 정보
info:  30  // 일반 정보
warn:  40  // 경고
error: 50  // 에러
fatal: 60  // 치명적 에러
```

#### 로거 설정
```typescript
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (
    process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  ),
  
  // 프로덕션: JSON 포맷
  // 개발: Pino-pretty (읽기 쉬운 포맷)
}
```

---

### 2. 로깅 함수

#### 2.1 createLogger() - 자식 로거
```typescript
const userLogger = createLogger({ module: 'user', userId: '123' })
userLogger.info('User logged in')
// Output: {"module":"user","userId":"123","msg":"User logged in"}
```

#### 2.2 logHttpRequest() - HTTP 요청
```typescript
logHttpRequest({
  method: 'GET',
  url: '/api/users',
  statusCode: 200,
  duration: 150,
  headers: req.headers,
})
// Output: [HTTP] GET /api/users 200 (150ms)
```

**특징**:
- 민감한 헤더 자동 제거 (authorization, cookie)
- 요청 메서드, URL, 상태 코드, 소요 시간

#### 2.3 logDatabaseQuery() - 데이터베이스 쿼리
```typescript
logDatabaseQuery({
  operation: 'findMany',
  model: 'User',
  duration: 25,
})
// Output: [DB] findMany User (25ms)

logDatabaseQuery({
  operation: 'create',
  model: 'Order',
  error: new Error('Connection timeout'),
})
// Output: [DB Error] create Order
```

#### 2.4 logError() - 에러 로깅
```typescript
try {
  // ... 작업
} catch (error) {
  logError(error, {
    context: 'payment processing',
    orderId: '123',
    userId: '456',
  })
}
// Output: {
//   "type": "error",
//   "error": {
//     "name": "Error",
//     "message": "Payment failed",
//     "stack": "..."
//   },
//   "context": "payment processing",
//   "orderId": "123",
//   "userId": "456"
// }
```

#### 2.5 logPerformance() - 성능 로깅
```typescript
logPerformance({
  name: 'LCP',
  value: 2100,
  rating: 'good',
  context: { page: '/products' },
})
// Output: [Performance] LCP: 2100 (good)
```

#### 2.6 logEvent() - 비즈니스 이벤트
```typescript
logEvent('user.registered', {
  userId: '123',
  method: 'email',
  referrer: 'google',
})
// Output: [Event] user.registered

logEvent('order.placed', {
  orderId: '456',
  amount: 100000,
  items: 3,
})
// Output: [Event] order.placed
```

#### 2.7 logSecurityEvent() - 보안 이벤트
```typescript
logSecurityEvent({
  type: 'auth_failed',
  userId: '123',
  ip: '192.168.1.1',
  details: { attempts: 5 },
})
// Output: [Security] auth_failed

logSecurityEvent({
  type: 'suspicious_activity',
  ip: '10.0.0.1',
  details: { reason: 'rapid requests' },
})
// Output: [Security] suspicious_activity
```

**보안 이벤트 타입**:
- `auth_failed` - 인증 실패
- `suspicious_activity` - 의심스러운 활동
- `rate_limit` - 요청 제한 초과
- `unauthorized_access` - 무단 접근 시도

#### 2.8 sanitizeData() - 민감 데이터 제거
```typescript
const userData = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  token: 'abc123',
}

const sanitized = sanitizeData(userData)
// {
//   name: 'John',
//   email: 'john@example.com',
//   password: '[REDACTED]',
//   token: '[REDACTED]'
// }

// 커스텀 필드
const customData = {
  username: 'john',
  ssn: '123-45-6789',
}
const sanitized = sanitizeData(customData, ['ssn'])
// { username: 'john', ssn: '[REDACTED]' }
```

**기본 민감 필드**: password, token, secret, apiKey, creditCard

#### 2.9 devLog() - 개발 전용
```typescript
devLog('Debug information', { step: 1, data: {...} })
// 개발 환경에서만 출력
// 프로덕션에서는 무시
```

#### 2.10 debugLog() - 조건부 디버그
```typescript
// DEBUG=true 환경 변수 필요
debugLog('Detailed debug info', { internal: true })
```

---

### 3. 로깅 미들웨어
**파일**: `src/lib/logging-middleware.ts`

#### 3.1 withLogging() - HTTP 로깅 미들웨어
```typescript
// API Route
export async function GET(request: NextRequest) {
  return withLogging(request, async () => {
    const data = await prisma.user.findMany()
    return NextResponse.json({ data })
  })
}
// 자동으로 요청/응답 로깅, 에러 처리
```

#### 3.2 withDatabaseLogging() - DB 로깅 래퍼
```typescript
const users = await withDatabaseLogging(
  'findMany',
  'User',
  () => prisma.user.findMany()
)
// 쿼리 시간 측정, 느린 쿼리 경고 (1초 이상)
```

#### 3.3 withErrorLogging() - 에러 핸들링
```typescript
const result = await withErrorLogging(
  async () => await processPayment(),
  { context: 'payment', orderId: '123' }
)
// 에러 자동 로깅 및 재throw
```

---

### 4. 테스트
**파일**: `src/lib/__tests__/logger.test.ts`

#### 테스트 커버리지
✅ 21개의 테스트 케이스 (100% 통과)

1. ✅ createLogger() - 자식 로거 생성 (2개)
2. ✅ sanitizeData() - 민감 데이터 제거 (5개)
3. ✅ 로거 함수 존재 확인 (8개)
4. ✅ 로거 함수 호출 테스트 (3개)
5. ✅ 로그 레벨 정의 (1개)
6. ✅ 환경 변수 테스트 (2개)

**전체 테스트 결과**:
```
Test Suites: 4 passed, 4 total
Tests: 62 passed, 62 total (21개 logger + 41개 기존)
```

---

## 📊 로깅 시스템 아키텍처

### 로깅 흐름
```
Application Event
    ↓
Logger Function (logError, logEvent, etc.)
    ↓
Pino Logger
    ↓
├─ Development: Pino-pretty (Console, Colorized)
└─ Production: JSON (File/Stream/Cloud Service)
    ↓
Phase 6: Sentry / CloudWatch / DataDog
```

### 환경별 설정

#### 개발 환경
```typescript
{
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
    }
  }
}
```

**출력 예시**:
```
[14:30:45] INFO: GET /api/users 200 (150ms)
  type: "http"
  method: "GET"
  url: "/api/users"
  statusCode: 200
  duration: 150
```

#### 프로덕션 환경
```typescript
{
  level: 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime
}
```

**출력 예시** (JSON):
```json
{
  "level": "info",
  "time": "2024-01-01T14:30:45.123Z",
  "type": "http",
  "method": "GET",
  "url": "/api/users",
  "statusCode": 200,
  "duration": 150,
  "msg": "GET /api/users 200 (150ms)"
}
```

---

## 🔧 사용 방법

### 1. 기본 사용
```typescript
import { logger } from '@/lib/logger'

logger.info('Application started')
logger.error('Something went wrong', new Error('Error'))
logger.debug({ userId: '123' }, 'User data loaded')
```

### 2. 자식 로거
```typescript
import { createLogger } from '@/lib/logger'

const userLogger = createLogger({ module: 'user' })
const orderLogger = createLogger({ module: 'order' })

userLogger.info({ userId: '123' }, 'User logged in')
orderLogger.info({ orderId: '456' }, 'Order created')
```

### 3. API Route 로깅
```typescript
import { withLogging } from '@/lib/logging-middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return withLogging(request, async () => {
    // 실제 로직
    const data = await fetchData()
    return NextResponse.json({ data })
  })
  // 자동으로 요청/응답 시간, 상태 코드 로깅
}
```

### 4. 데이터베이스 로깅
```typescript
import { withDatabaseLogging } from '@/lib/logging-middleware'

const users = await withDatabaseLogging(
  'findMany',
  'User',
  () => prisma.user.findMany({ where: { active: true } })
)
// 쿼리 시간 측정, 느린 쿼리 경고
```

### 5. 에러 로깅
```typescript
import { logError } from '@/lib/logger'

try {
  await processPayment(orderId)
} catch (error) {
  logError(error as Error, {
    context: 'payment-processing',
    orderId,
    userId,
  })
  throw error
}
```

### 6. 비즈니스 이벤트
```typescript
import { logEvent } from '@/lib/logger'

// 사용자 등록
logEvent('user.registered', {
  userId: user.id,
  email: user.email,
  method: 'email',
})

// 주문 완료
logEvent('order.completed', {
  orderId: order.id,
  amount: order.total,
  items: order.items.length,
})
```

### 7. 보안 이벤트
```typescript
import { logSecurityEvent } from '@/lib/logger'

// 인증 실패
logSecurityEvent({
  type: 'auth_failed',
  userId: attemptedUserId,
  ip: request.ip,
  details: { reason: 'invalid password' },
})

// 요청 제한 초과
logSecurityEvent({
  type: 'rate_limit',
  ip: request.ip,
  details: { endpoint: '/api/search', limit: 100 },
})
```

---

## 🎨 로그 포맷

### 구조화된 로그
```typescript
{
  "level": "info",           // 로그 레벨
  "time": "2024-01-01...",   // ISO 8601 타임스탬프
  "type": "http",            // 로그 타입
  "method": "POST",          // HTTP 메서드
  "url": "/api/orders",      // 요청 URL
  "statusCode": 201,         // 상태 코드
  "duration": 230,           // 소요 시간 (ms)
  "msg": "POST /api/orders 201 (230ms)"
}
```

### 로그 타입
- `http` - HTTP 요청/응답
- `database` - 데이터베이스 쿼리
- `error` - 에러 발생
- `performance` - 성능 메트릭
- `event` - 비즈니스 이벤트
- `security` - 보안 이벤트
- `slow-query` - 느린 DB 쿼리

---

## 🔐 보안 및 프라이버시

### 1. 민감한 데이터 제거
```typescript
// 자동 제거되는 필드
- password
- token
- secret
- apiKey
- creditCard

// HTTP 헤더
- authorization: '[REDACTED]'
- cookie: '[REDACTED]'
```

### 2. 수동 Sanitization
```typescript
import { sanitizeData } from '@/lib/logger'

const userData = sanitizeData(user, ['ssn', 'phoneNumber'])
logger.info({ user: userData }, 'User updated')
```

### 3. 로그 레벨 제어
```bash
# 프로덕션: info 이상만 로깅
LOG_LEVEL=info

# 디버깅: 모든 로그
LOG_LEVEL=debug

# 에러만: error 이상
LOG_LEVEL=error
```

---

## 📈 성능

### Pino 성능 특징
- **빠른 속도**: 비동기 JSON 직렬화
- **낮은 오버헤드**: 최소한의 CPU 사용
- **스트리밍**: 대용량 로그 처리
- **JSON 최적화**: 구조화된 데이터

### 벤치마크 (Pino 공식)
```
Pino:     ~30,000 ops/sec
Winston:  ~11,000 ops/sec
Bunyan:   ~10,000 ops/sec
```

---

## 🚀 다음 단계 (Phase 6)

### 1. Sentry 통합
```typescript
// logger.ts
import * as Sentry from '@sentry/nextjs'

export function logError(error: Error, context?) {
  logger.error({ ... })
  
  // Sentry로 전송
  Sentry.captureException(error, {
    extra: context,
  })
}
```

### 2. CloudWatch Logs
```bash
# AWS CloudWatch로 스트리밍
pino | pino-cloudwatch --group /aws/lambda/my-app
```

### 3. DataDog APM
```typescript
// DataDog 로그 전송
import { datadogLogs } from '@datadog/browser-logs'

datadogLogs.logger.info('message', { context })
```

### 4. 로그 집계 대시보드
- Kibana (ELK Stack)
- Grafana Loki
- Splunk
- New Relic

### 5. 알림 설정
```typescript
// 에러 발생 시 Slack 알림
if (error.level === 'error') {
  await sendSlackNotification({
    channel: '#alerts',
    message: `Error: ${error.message}`,
  })
}
```

---

## 📚 Best Practices

### 1. 의미 있는 컨텍스트
```typescript
// ❌ Bad
logger.info('User action')

// ✅ Good
logger.info({
  userId: '123',
  action: 'profile_update',
  fields: ['name', 'email'],
}, 'User updated profile')
```

### 2. 적절한 로그 레벨
```typescript
// trace: 매우 상세한 디버깅
logger.trace({ step: 1, data }, 'Processing step 1')

// debug: 디버깅 정보
logger.debug({ userId }, 'User session validated')

// info: 일반 정보
logger.info({ orderId }, 'Order created')

// warn: 경고 (조치 필요 가능)
logger.warn({ queryTime: 2500 }, 'Slow query detected')

// error: 에러 (조치 필요)
logger.error({ error }, 'Payment processing failed')

// fatal: 치명적 (서비스 중단)
logger.fatal({ error }, 'Database connection lost')
```

### 3. 구조화된 데이터
```typescript
// ❌ Bad
logger.info(`User ${userId} placed order ${orderId} for ${amount}`)

// ✅ Good
logger.info({
  userId,
  orderId,
  amount,
  currency: 'KRW',
}, 'Order placed')
```

### 4. 에러 컨텍스트
```typescript
// ✅ Good
try {
  await payment.process()
} catch (error) {
  logError(error as Error, {
    context: 'payment-processing',
    orderId: order.id,
    userId: user.id,
    amount: order.total,
    paymentMethod: payment.method,
  })
}
```

---

## ✅ 체크리스트

### 구현 완료
- [x] Pino 로거 설정
- [x] 환경별 설정 (dev/prod)
- [x] 8개 로깅 함수 구현
- [x] 3개 미들웨어 함수
- [x] 민감 데이터 sanitization
- [x] 21개 테스트 작성 (100% 통과)
- [x] 문서화

### Phase 6 예정
- [ ] Sentry 통합
- [ ] CloudWatch / DataDog 연동
- [ ] 로그 집계 대시보드
- [ ] 알림 시스템 (Slack/Email)
- [ ] 로그 분석 및 모니터링
- [ ] 로그 보관 정책

---

## 🎉 결론

로깅 시스템이 성공적으로 구축되었습니다.

### 달성한 목표
1. ✅ **고성능 로거**: Pino 기반 빠른 로깅
2. ✅ **구조화된 로그**: JSON 포맷으로 검색/분석 용이
3. ✅ **환경 분리**: 개발/프로덕션 최적화
4. ✅ **보안**: 민감 데이터 자동 제거
5. ✅ **확장성**: Phase 6 클라우드 서비스 통합 준비

### 로깅 커버리지
- HTTP 요청/응답
- 데이터베이스 쿼리
- 에러 및 예외
- 성능 메트릭
- 비즈니스 이벤트
- 보안 이벤트

### 개발자 경험
- 간단한 API (`logger.info()`, `logEvent()`)
- 자동 컨텍스트 (자식 로거)
- Pretty 포맷 (개발 환경)
- TypeScript 타입 지원

---

**작성일**: 2024년
**작성자**: Claude (Anthropic)
**프로젝트**: 직구역구 (JIKGUYEOKGU) - 한중 C2C 크로스보더 마켓플레이스
**Phase**: Week 5-6 (안정성 강화) - 4/5 완료
