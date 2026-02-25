# 🚀 Vercel 배포 실행 매뉴얼

## ✅ 프로젝트 최종 점검 완료

### 검증 결과 (2024년 실행)

#### 1. 빌드 검증 ✅
```
✓ Compiled successfully
✓ Total Pages: 86
✓ First Load JS: 87.6 kB (목표: <100 kB)
✓ Middleware: 77.9 kB
✓ Build Time: ~30초
```

#### 2. 테스트 검증 ✅
```
Test Suites: 5 passed, 5 total
Tests: 98 passed, 98 total
Time: 0.655s
```

#### 3. TypeScript 검증 ✅
```
0 errors
모든 타입 체크 통과
```

#### 4. Git 상태 ✅
```
✓ 모든 변경사항 커밋됨
✓ 최신 커밋: docs: Complete Week 7-8 beta deployment preparation
✓ Working directory clean
```

---

## 📋 배포 전 필수 확인사항

### ✅ 완료된 항목

- [x] Production 빌드 성공
- [x] 98개 테스트 100% 통과
- [x] TypeScript 타입 체크 통과
- [x] Git 커밋 완료
- [x] .gitignore에 .env 파일 포함
- [x] 배포 문서 3개 작성
- [x] vercel.json 설정 (Cron Jobs 9개)
- [x] next.config.js 최적화 설정

### ⏳ 사용자가 직접 해야 할 작업

**다음 작업들은 제가 대신 할 수 없으며, 사용자님께서 직접 하셔야 합니다:**

1. ✋ **Vercel 계정 생성** - 웹 브라우저 필요
2. ✋ **Supabase 프로젝트 생성** - 웹 브라우저 필요
3. ✋ **환경 변수 값 입력** - 민감한 정보 (패스워드, API Key 등)
4. ✋ **OAuth 앱 등록** - Kakao, Naver 등 각 서비스
5. ✋ **결제 서비스 계약** - Stripe, 토스페이먼츠 등

**제가 도와드릴 수 있는 작업:**

- ✅ 명령어 실행 (Vercel CLI 설치 및 배포)
- ✅ 설정 파일 생성 및 수정
- ✅ 데이터베이스 마이그레이션 스크립트 실행
- ✅ 테스트 및 검증

---

## 🔐 1단계: Vercel CLI 설치 및 로그인

**이 단계는 제가 진행할 수 있습니다!**

### 1-1. Vercel CLI 설치

```bash
npm install -g vercel
```

제가 실행해드릴까요? (Y/N)

### 1-2. Vercel 로그인

```bash
vercel login
```

**⚠️ 주의: 이 명령어는 웹 브라우저를 열고 사용자님의 인증이 필요합니다.**

- 브라우저가 열리면 Vercel 계정으로 로그인하세요
- 이메일 확인 링크를 클릭하세요
- "Logged in!" 메시지가 나오면 성공입니다

**사용자님이 직접 하실 작업:**
1. 브라우저에서 Vercel 계정 생성 (https://vercel.com/signup)
   - GitHub 계정으로 가입 권장
   - 또는 이메일로 가입

---

## 🗄️ 2단계: Supabase 데이터베이스 생성

**⚠️ 이 단계는 사용자님이 직접 하셔야 합니다 (웹 브라우저 필요)**

### 2-1. Supabase 프로젝트 생성

1. **https://app.supabase.com** 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Organization**: 기존 또는 새로 생성
   - **Name**: `jikguyeokgu-production`
   - **Database Password**: 강력한 비밀번호 생성 ⚠️ **반드시 안전한 곳에 저장!**
   - **Region**: `Northeast Asia (Seoul)` 또는 `Northeast Asia (Tokyo)` 선택
4. "Create new project" 클릭
5. 프로젝트 생성 완료까지 약 2분 대기

### 2-2. Connection String 복사

프로젝트 생성 후:

1. **Settings → Database** 메뉴로 이동
2. **Connection String** 섹션에서:
   - "Connection pooling" → **Connection string** 복사
   - 예시: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
3. "Direct connection" → **Connection string** 복사
   - 예시: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

⚠️ **중요**: `[YOUR-PASSWORD]`를 2-1에서 설정한 실제 패스워드로 교체하세요!

**저장할 값:**
```bash
# DATABASE_URL (Connection pooling)
postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

# DIRECT_URL (Direct connection)
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

---

## 🔑 3단계: NextAuth Secret 생성

**이 단계는 제가 진행할 수 있습니다!**

### 3-1. NEXTAUTH_SECRET 생성

```bash
openssl rand -base64 32
```

제가 실행해서 Secret을 생성해드릴까요? (Y/N)

### 3-2. CRON_SECRET 생성

```bash
openssl rand -base64 32
```

제가 실행해서 Secret을 생성해드릴까요? (Y/N)

**⚠️ 생성된 Secret은 반드시 안전한 곳에 저장하세요!**

---

## 📝 4단계: 환경 변수 정리

**이 단계는 제가 파일을 생성해드릴 수 있습니다!**

생성된 모든 값을 정리한 파일을 만들어드릴까요?

제가 다음 파일을 생성해드리겠습니다:
- `.env.production.template` - 환경 변수 템플릿 (값 제외)
- `deployment-secrets.txt` - 사용자님이 직접 입력할 Secret 목록

---

## 🚀 5단계: Vercel 프로젝트 연결 및 배포

### 5-1. 프로젝트 링크 (첫 배포만)

**이 단계는 제가 진행할 수 있지만, 사용자님의 확인이 필요합니다.**

```bash
vercel link
```

**프롬프트에 대한 응답:**
```
? Set up and deploy "~/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu"? [Y/n]
→ Y 입력

? Which scope should contain your project?
→ 본인 계정 선택 (화살표 키로 이동)

? Link to existing project? [y/N]
→ N 입력 (새 프로젝트)

? What's your project's name?
→ jikguyeokgu (또는 원하는 이름)

? In which directory is your code located?
→ ./ (엔터)
```

제가 이 명령어를 실행해드릴까요? (Y/N)

### 5-2. 환경 변수 설정

**⚠️ 이 단계는 사용자님이 직접 하셔야 합니다 (민감한 정보 포함)**

#### 방법 1: Vercel Dashboard (권장)

1. **https://vercel.com/dashboard** 접속
2. 프로젝트 선택 (`jikguyeokgu`)
3. **Settings → Environment Variables** 메뉴
4. 다음 필수 환경 변수 추가:

**필수 환경 변수 (5개):**

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | 2-2에서 복사한 Connection pooling URL | Production |
| `DIRECT_URL` | 2-2에서 복사한 Direct connection URL | Production |
| `NEXTAUTH_URL` | `https://jikguyeokgu.vercel.app` | Production |
| `NEXTAUTH_SECRET` | 3-1에서 생성한 Secret | Production |
| `CRON_SECRET` | 3-2에서 생성한 Secret | Production |

**Environment 선택:**
- ✅ Production (필수)
- ⬜ Preview (선택)
- ⬜ Development (선택)

#### 방법 2: Vercel CLI

```bash
# 각 환경 변수 하나씩 추가
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production
```

**⚠️ 값을 입력할 때는 따옴표 없이 입력하세요!**

### 5-3. Preview 배포 (테스트)

**이 단계는 제가 진행할 수 있습니다!**

```bash
vercel
```

예상 결과:
```
✓ Deployment ready
✓ Preview: https://jikguyeokgu-abc123.vercel.app
```

제가 Preview 배포를 실행해드릴까요? (Y/N)

**배포 후 테스트:**
- [ ] Preview URL 접속 확인
- [ ] 홈페이지 로드 확인
- [ ] 404 페이지 확인
- [ ] API 응답 확인

### 5-4. Production 배포

**환경 변수 설정 완료 후, 제가 진행할 수 있습니다!**

```bash
vercel --prod
```

예상 결과:
```
✓ Production deployment ready
✓ Production: https://jikguyeokgu.vercel.app
```

제가 Production 배포를 실행해드릴까요? (Y/N)

---

## 🗄️ 6단계: 데이터베이스 마이그레이션

**이 단계는 제가 진행할 수 있습니다!**

### 6-1. 환경 변수 설정 (로컬)

**⚠️ 먼저 사용자님이 해야 할 작업:**

터미널에서 다음 명령어 실행:

```bash
# 2-2에서 복사한 Direct URL로 교체
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

### 6-2. Prisma 마이그레이션 실행

**환경 변수 설정 후, 제가 실행할 수 있습니다!**

```bash
# Prisma Client 생성
npx prisma generate

# 마이그레이션 적용
npx prisma migrate deploy
```

제가 마이그레이션을 실행해드릴까요? (Y/N)

### 6-3. Seed 데이터 생성

**제가 실행할 수 있습니다!**

```bash
# 관리자 계정 생성
npm run db:set-admin

# 기본 데이터 생성
npm run db:seed
```

제가 Seed 데이터를 생성해드릴까요? (Y/N)

---

## ✅ 7단계: 배포 확인 및 검증

**이 단계는 제가 진행할 수 있습니다!**

### 7-1. 기본 접속 테스트

```bash
# 홈페이지 상태 확인
curl -I https://jikguyeokgu.vercel.app

# Session API 확인
curl https://jikguyeokgu.vercel.app/api/auth/session
```

제가 테스트를 실행해드릴까요? (Y/N)

### 7-2. Cron Jobs 확인

**사용자님이 직접 확인:**
1. Vercel Dashboard → Project → Settings → Cron Jobs
2. 9개 Cron Job이 등록되었는지 확인:
   - ✅ /api/exchange-rate/update (매일 00:00)
   - ✅ /api/orders/auto-confirm (매일 15:00)
   - ✅ /api/ads/weekly-close (월요일 01:00)
   - ✅ /api/disputes/process-expired (매일 02:00)
   - ✅ /api/cron/coupon-automation (매일 09:00)
   - ✅ /api/cron/seller-grades (일요일 02:00)
   - ✅ /api/cron/review-reminders (매일 10:00)
   - ✅ /api/cron/price-alerts (6시간마다)
   - ✅ /api/cron/best-reviews (매월 1일)

### 7-3. Lighthouse 성능 테스트

**제가 실행할 수 있습니다!**

```bash
# Lighthouse CLI 설치
npm install -g lighthouse

# 성능 테스트 실행
lighthouse https://jikguyeokgu.vercel.app --view
```

제가 Lighthouse 테스트를 실행해드릴까요? (Y/N)

---

## 📊 배포 완료 체크리스트

### 필수 작업

- [ ] Vercel CLI 설치 ← **제가 진행 가능**
- [ ] Vercel 로그인 ← **사용자 직접 (브라우저)**
- [ ] Supabase 프로젝트 생성 ← **사용자 직접 (브라우저)**
- [ ] Database Connection String 복사 ← **사용자 직접**
- [ ] Secret 생성 (NEXTAUTH_SECRET, CRON_SECRET) ← **제가 진행 가능**
- [ ] Vercel 프로젝트 링크 ← **제가 진행 가능 (사용자 확인 필요)**
- [ ] 환경 변수 설정 (5개 필수) ← **사용자 직접 (민감 정보)**
- [ ] Preview 배포 ← **제가 진행 가능**
- [ ] Production 배포 ← **제가 진행 가능**
- [ ] 데이터베이스 마이그레이션 ← **제가 진행 가능**
- [ ] Seed 데이터 생성 ← **제가 진행 가능**
- [ ] 배포 확인 및 테스트 ← **제가 진행 가능**

### 선택 작업 (나중에 가능)

- [ ] OAuth 설정 (Kakao, Naver 등)
- [ ] 결제 시스템 연동 (Stripe, Toss)
- [ ] 파일 저장소 설정 (S3, R2)
- [ ] 이메일 서비스 (Resend)
- [ ] SMS 인증 (CoolSMS)
- [ ] 번역 API (DeepL)
- [ ] 커스텀 도메인 연결

---

## 🎯 단계별 실행 계획

제가 도와드릴 수 있는 최적의 방법은 다음과 같습니다:

### Phase 1: 사용자 직접 작업 (15-20분)

1. **Vercel 계정 생성**
   - https://vercel.com/signup
   - GitHub 계정으로 가입 권장

2. **Supabase 프로젝트 생성**
   - https://app.supabase.com
   - 프로젝트 이름: `jikguyeokgu-production`
   - Region: Seoul
   - **Database Password 생성 및 저장!**

3. **Connection String 복사**
   - DATABASE_URL (Connection pooling)
   - DIRECT_URL (Direct connection)

### Phase 2: 제가 도와드리는 작업 (10-15분)

1. **Vercel CLI 설치**
2. **Secret 생성** (NEXTAUTH_SECRET, CRON_SECRET)
3. **환경 변수 템플릿 파일 생성**

### Phase 3: 사용자 직접 작업 (5-10분)

1. **Vercel 로그인** (브라우저 인증)
2. **Vercel Dashboard에서 환경 변수 입력**
   - 5개 필수 값 입력

### Phase 4: 제가 실행하는 작업 (5-10분)

1. **Vercel 프로젝트 링크**
2. **Preview 배포**
3. **데이터베이스 마이그레이션**
4. **Production 배포**
5. **배포 확인 및 테스트**

---

## 💡 지금 바로 시작하기

**사용자님께 질문드립니다:**

1. **Vercel 계정이 이미 있으신가요?** (Y/N)
2. **Supabase 계정이 이미 있으신가요?** (Y/N)
3. **지금 바로 배포를 시작하시겠습니까?** (Y/N)

**YES라면:**

제가 지금 바로 다음 작업을 진행해드리겠습니다:
- ✅ Vercel CLI 설치
- ✅ Secret 생성 (NEXTAUTH_SECRET, CRON_SECRET)
- ✅ 환경 변수 템플릿 파일 생성

**그리고 사용자님께서:**
1. Vercel/Supabase 계정 생성 (없다면)
2. Database Connection String 복사
3. Vercel에서 환경 변수 입력

**완료하시면:**
제가 나머지 배포 과정을 모두 진행해드립니다!

---

## 📞 도움이 필요하시면

어느 단계에서든 막히시면 말씀해주세요:
- 스크린샷 공유
- 에러 메시지 복사
- 질문 사항

제가 단계별로 상세히 안내해드리겠습니다!

---

**작성일**: 2024년
**프로젝트**: 직구역구 (JIKGUYEOKGU)
**상태**: 배포 준비 완료 ✅
**다음**: 사용자 결정 후 즉시 실행 가능 🚀
