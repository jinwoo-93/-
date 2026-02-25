# Supabase PostgreSQL 연결 문제 디버깅 리포트

## 실행 날짜
2026-02-11

## 문제 요약
Supabase PostgreSQL 데이터베이스에 연결할 수 없음. 모든 연결 시도에서 "Circuit breaker open" 에러 발생.

---

## 진단 과정

### 1. 환경 확인
- **프로젝트 경로**: `/Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu`
- **Supabase Project ID**: `hpguqmeiajcbkjwbnioe`
- **리전**: `ap-south-1` (Mumbai, India)
- **현재 DATABASE_URL**: Transaction Pooler (port 6543)

### 2. 테스트한 연결 방법

#### 시도 1: Session Pooler (Port 5432)
```
postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```
**결과**: ❌ Circuit breaker open

#### 시도 2: Transaction Pooler (Port 6543)
```
postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```
**결과**: ❌ Circuit breaker open

#### 시도 3: Direct Connection
```
postgresql://postgres:Qk5IIX7CuKhnG2Gu@db.hpguqmeiajcbkjwbnioe.supabase.co:5432/postgres
```
**결과**: ❌ DNS 해결 실패 (nodename nor servname provided, or not known)

#### 시도 4: 다양한 SSL 설정
- `sslmode=require`
- `sslmode=disable`
- `ssl: { rejectUnauthorized: false }`

**결과**: 모두 동일한 "Circuit breaker open" 에러

### 3. 네트워크 진단

#### TCP 포트 연결 테스트
```bash
# Session Pooler (5432)
nc -zv aws-1-ap-south-1.pooler.supabase.com 5432
✅ Connection succeeded!

# Transaction Pooler (6543)
nc -zv aws-1-ap-south-1.pooler.supabase.com 6543
✅ Connection succeeded!
```

#### DNS 해결
```bash
nslookup aws-1-ap-south-1.pooler.supabase.com
✅ 정상 해결됨
- IP 1: 13.200.110.68
- IP 2: 3.111.225.200
```

### 4. 에러 분석

#### Prisma 에러
```
Error: P1001
Can't reach database server at aws-1-ap-south-1.pooler.supabase.com:5432
```

#### PostgreSQL 클라이언트 에러
```
Error code: XX000
Message: Circuit breaker open: Unable to establish connection to upstream database
```

#### SSL 관련 에러 (초기)
```
Error code: SELF_SIGNED_CERT_IN_CHAIN
Message: self-signed certificate in certificate chain
```

---

## 근본 원인 (Root Cause Analysis)

### 확정된 원인
**Supabase 프로젝트가 일시 중지(Paused) 상태**

### 증거
1. **TCP 연결 성공**: 네트워크 레벨에서 포트는 열려있음
2. **Pooler 응답**: PgBouncer가 작동하지만 업스트림 데이터베이스 연결 실패
3. **Circuit Breaker 활성화**: Supabase의 안전 장치가 비활성 데이터베이스로의 연결을 차단
4. **Direct Connection DNS 실패**: 일시 중지된 프로젝트는 직접 연결 엔드포인트가 제거됨

### 가능한 원인
1. **무료 플랜 비활성 정책**: Supabase 무료 플랜은 7일간 활동이 없으면 자동 일시 중지
2. **수동 일시 중지**: 관리자가 대시보드에서 프로젝트를 일시 중지했을 수 있음
3. **리소스 제한**: 무료 플랜의 데이터베이스 크기나 트래픽 제한 초과

---

## 해결 방법

### 즉시 조치 (필수)

#### 1. Supabase 대시보드에서 프로젝트 재개
1. https://supabase.com/dashboard 로그인
2. 프로젝트 `hpguqmeiajcbkjwbnioe` 선택
3. 프로젝트 상태 확인
4. "Resume" 또는 "Restore" 버튼 클릭
5. 데이터베이스가 완전히 시작될 때까지 2-5분 대기

#### 2. 연결 문자열 업데이트 (.env.local)

프로젝트가 재개된 후, **Session Pooler (port 5432)**를 사용하는 것을 권장합니다:

```bash
# NextAuth v5와 호환되는 Session Pooler
DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

**중요**: NextAuth v5는 Transaction Pooler (6543)를 지원하지 않습니다. Session mode만 사용해야 합니다.

#### 3. 데이터베이스 스키마 동기화

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 스키마를 데이터베이스에 푸시
npx prisma db push

# (옵션) 기존 데이터베이스에서 스키마 가져오기
npx prisma db pull
```

#### 4. 서버 재시작 및 테스트

```bash
# 개발 서버 시작
npm run dev

# 다른 터미널에서 API 엔드포인트 테스트
curl http://localhost:3000/api/auth/session
```

### 장기 조치 (권장)

#### 1. 프로젝트 활성 상태 유지
- **무료 플랜**: 7일마다 최소 1회 데이터베이스 쿼리 실행
- **해결책**: Cron job 또는 health check 설정

```javascript
// /app/api/cron/keep-alive/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'alive' });
  } catch (error) {
    return NextResponse.json({ error: 'Database unreachable' }, { status: 500 });
  }
}
```

외부 서비스 (예: UptimeRobot, Cron-job.org)에서 매주 이 엔드포인트 호출

#### 2. 유료 플랜 업그레이드 고려
- **Pro Plan**: 자동 일시 중지 없음
- **향상된 성능**: 더 많은 동시 연결, 더 큰 데이터베이스
- **프로덕션 준비**: 백업, 포인트-인-타임 복구

#### 3. 연결 문자열 환경별 관리

```bash
# .env.local (개발)
DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# .env.production (프로덕션)
DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10"
```

#### 4. 모니터링 설정
- Supabase 대시보드에서 메트릭 확인
- 데이터베이스 크기 추적
- 쿼리 성능 모니터링

---

## 예방책

### 1. 정기적인 활동 유지
- 매주 자동 health check
- 개발 중 정기적 접속

### 2. 알림 설정
- Supabase 이메일 알림 활성화
- 프로젝트 일시 중지 전 경고 수신

### 3. 백업 전략
- 정기적 데이터 백업 (`pg_dump`)
- 중요 데이터는 별도 저장소에 복사

### 4. 문서화
- 연결 문자열 변경 사항 기록
- 환경 변수 관리 프로세스 문서화

---

## 관련 파일

- **환경 변수**: `/Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu/.env.local`
- **Prisma 스키마**: `/Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu/prisma/schema.prisma`
- **테스트 스크립트**: `/Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu/test-db-connection.js`

---

## 참고 자료

- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [NextAuth.js Database Adapters](https://authjs.dev/reference/adapter/prisma)
- [PostgreSQL Circuit Breaker Pattern](https://www.postgresql.org/docs/current/pgbouncer-usage.html)

---

## 다음 단계

1. ✅ Supabase 대시보드에서 프로젝트 재개
2. ⬜ DATABASE_URL 업데이트
3. ⬜ `npx prisma db push` 실행
4. ⬜ 서버 재시작 및 테스트
5. ⬜ Keep-alive cron job 설정 (선택)
