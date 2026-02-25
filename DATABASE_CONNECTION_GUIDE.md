# Supabase 데이터베이스 연결 가이드

## 현재 상태

**문제**: Supabase 프로젝트가 일시 중지(Paused) 상태입니다.

**원인**: 무료 플랜은 7일 이상 사용하지 않으면 자동으로 일시 중지됩니다.

---

## 즉시 해결 방법

### 1단계: Supabase 프로젝트 재개

1. https://supabase.com/dashboard 로그인
2. 프로젝트 목록에서 `hpguqmeiajcbkjwbnioe` 선택
3. 프로젝트 상태 확인
4. **"Resume Project"** 또는 **"Restore"** 버튼 클릭
5. 데이터베이스가 시작될 때까지 **2-5분 대기**

### 2단계: 연결 확인

```bash
# 데이터베이스 상태 확인
node check-db-status.js
```

**성공 메시지**를 보면 다음 단계로 진행하세요.

### 3단계: 데이터베이스 스키마 동기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 스키마를 데이터베이스에 푸시
npx prisma db push
```

### 4단계: 개발 서버 시작

```bash
# 개발 서버 실행
npm run dev
```

### 5단계: API 테스트

새 터미널에서 실행:

```bash
# Health check 테스트
curl http://localhost:3000/api/health

# NextAuth 세션 테스트
curl http://localhost:3000/api/auth/session
```

---

## 연결 문자열 설정

### 현재 설정 (.env.local)

```bash
# Session Pooler (NextAuth v5 호환)
DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

### 왜 Session Pooler를 사용하나요?

- **NextAuth v5 호환성**: Transaction Pooler (port 6543)는 NextAuth v5와 호환되지 않습니다
- **안정성**: Session mode는 prepared statements를 지원합니다
- **권장 사항**: Supabase 공식 문서에서 권장하는 방식입니다

### 다른 연결 방법 (참고용)

```bash
# Transaction Pooler (NextAuth에서 사용 불가)
# DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"

# Direct Connection (프로젝트 일시 중지 시 사용 불가)
# DATABASE_URL="postgresql://postgres:Qk5IIX7CuKhnG2Gu@db.hpguqmeiajcbkjwbnioe.supabase.co:5432/postgres"
```

---

## 자동 일시 중지 방지

### 옵션 1: 외부 Cron 서비스 (권장)

**무료 서비스**:
- [Cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com)
- [EasyCron](https://www.easycron.com)

**설정 방법**:

1. 계정 생성 및 로그인
2. 새 모니터/작업 생성
   - **URL**: `https://yourdomain.com/api/health`
   - **Method**: GET
   - **Interval**: 매주 1회 (또는 5일마다)
   - **Timeout**: 30초

3. 알림 설정 (선택사항)
   - 실패 시 이메일 알림 받기

### 옵션 2: GitHub Actions (프로젝트가 GitHub에 있는 경우)

`.github/workflows/keep-db-alive.yml` 파일 생성:

```yaml
name: Keep Database Alive

on:
  schedule:
    # 매주 월요일 오전 9시 (UTC)
    - cron: '0 9 * * 1'
  workflow_dispatch: # 수동 실행 가능

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          curl -f https://yourdomain.com/api/health || exit 1
```

### 옵션 3: Supabase Pro 플랜 업그레이드

**비용**: $25/월

**장점**:
- 자동 일시 중지 없음
- 더 많은 데이터베이스 크기 (8GB → 무제한)
- 더 많은 동시 연결
- 자동 백업
- Point-in-time 복구

---

## 작성된 파일

### 1. check-db-status.js
**용도**: 데이터베이스 연결 상태 확인

```bash
node check-db-status.js
```

**출력 예시**:
- ✅ 성공: "DATABASE IS ACTIVE AND READY"
- ❌ 실패: 진단 정보와 해결 방법 제공

### 2. test-db-connection.js
**용도**: 여러 연결 방법 테스트 (디버깅용)

```bash
node test-db-connection.js
```

### 3. /api/health
**용도**: Keep-alive 엔드포인트

**응답 예시**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-11T08:30:00.000Z",
  "dbTime": "2026-02-11T08:30:00.123Z",
  "responseTime": "45ms",
  "message": "Database is active and responding"
}
```

**사용법**:
```bash
# 로컬 테스트
curl http://localhost:3000/api/health

# 프로덕션 테스트
curl https://yourdomain.com/api/health
```

---

## 문제 해결

### "Circuit breaker open" 에러가 계속 발생하는 경우

**원인**: 프로젝트가 아직 재개되지 않았거나 시작 중입니다.

**해결**:
1. Supabase 대시보드에서 프로젝트 상태 확인
2. "Restoring" 또는 "Starting" 표시가 있으면 기다리세요
3. 5분 후에도 계속되면 Supabase 지원팀 문의

### "Self-signed certificate" 에러가 발생하는 경우

**해결**:
`.env.local` 파일 확인 - 올바른 연결 문자열이 설정되어 있는지 확인

```bash
# 올바른 형식
DATABASE_URL="postgresql://postgres.hpguqmeiajcbkjwbnioe:Qk5IIX7CuKhnG2Gu@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

### Prisma 마이그레이션 실패

**해결**:
```bash
# 강제로 스키마 푸시
npx prisma db push --force-reset

# 경고: 이 명령은 데이터베이스를 초기화합니다!
```

**안전한 방법**:
```bash
# 기존 스키마 가져오기
npx prisma db pull

# 스키마 비교 후 푸시
npx prisma db push
```

---

## 프로덕션 체크리스트

배포 전 확인사항:

- [ ] Supabase 프로젝트가 Pro 플랜으로 업그레이드되었거나
- [ ] 외부 cron 서비스가 설정되었음
- [ ] 환경 변수가 프로덕션 서버에 올바르게 설정됨
- [ ] DATABASE_URL이 Session Pooler를 사용함 (port 5432)
- [ ] `connection_limit` 값이 적절함 (프로덕션: 10-20)
- [ ] SSL 설정이 올바름
- [ ] Health check 엔드포인트가 접근 가능함
- [ ] 알림 설정이 활성화됨

---

## 연락처 및 리소스

### Supabase
- Dashboard: https://supabase.com/dashboard
- 문서: https://supabase.com/docs
- 상태: https://status.supabase.com
- 지원: https://supabase.com/support

### Prisma
- 문서: https://www.prisma.io/docs
- Supabase 가이드: https://www.prisma.io/docs/guides/database/supabase

### NextAuth.js
- 문서: https://authjs.dev
- Prisma Adapter: https://authjs.dev/reference/adapter/prisma

---

## 변경 이력

### 2026-02-11
- Session Pooler (port 5432)로 변경
- NextAuth v5 호환성 확보
- Health check API 추가
- 데이터베이스 상태 체크 스크립트 추가
- 자동 일시 중지 방지 가이드 추가
