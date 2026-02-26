# 🔐 환경 변수 및 인증 키 현황 보고서

**확인 일시**: 2024년
**프로젝트**: 직구역구 (JIKGUYEOKGU)

---

## ✅ 저장된 환경 변수 현황

### 📁 파일 위치

| 파일 | 용도 | 상태 |
|------|------|------|
| `.env` | Prisma 전용 (개발) | ✅ 존재 |
| `.env.local` | 로컬 개발 환경 | ✅ 존재 (67줄) |
| `.env.example` | 템플릿 (공개) | ✅ 존재 |
| `.env.production.template` | 프로덕션 템플릿 | ✅ 생성됨 |

---

## 🗄️ Supabase 데이터베이스

### ✅ 저장된 정보

**Database URL (Session Pooler):**
```
Host: aws-1-ap-south-1.pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.hpguqmeiajcbkjwbnioe
Password: ✅ 저장됨 (Qk5IIX7CuKhnG2Gu)
Region: ap-south-1 (인도 - Mumbai)
```

**연결 모드:**
- ✅ Session Pooler (PgBouncer)
- ✅ NextAuth v5 호환
- ✅ Connection Limit: 1

**⚠️ 주의사항:**
현재 리전이 **ap-south-1 (인도 Mumbai)** 입니다.
프로덕션 배포 시 **ap-northeast-2 (서울)** 또는 **ap-northeast-1 (도쿄)** 사용을 권장합니다.

**현재 상태**: 개발 환경용 ✅

---

## 🔑 저장된 API 키 및 Secret

### 1. ✅ NextAuth (인증)

| 항목 | 상태 | 값 |
|------|------|-----|
| NEXTAUTH_SECRET | ✅ 저장됨 | tHnXC...1sk= (44자) |
| NEXTAUTH_URL | ✅ 설정됨 | http://localhost:3000 |

**프로덕션 배포 시 필요:**
- ✋ NEXTAUTH_URL 변경: `https://jikguyeokgu.vercel.app`
- ✅ NEXTAUTH_SECRET: 현재 값 사용 가능 (또는 새로 생성)

---

### 2. ✅ Google OAuth

| 항목 | 상태 | 비고 |
|------|------|------|
| GOOGLE_CLIENT_ID | ✅ 저장됨 | 1041454...nr3 |
| GOOGLE_CLIENT_SECRET | ✅ 저장됨 | GOCSPX-... |

**설정 완료**: Google Cloud Console
**Redirect URI 추가 필요** (프로덕션):
- `https://jikguyeokgu.vercel.app/api/auth/callback/google`

---

### 3. ✅ Kakao OAuth

| 항목 | 상태 | 비고 |
|------|------|------|
| KAKAO_CLIENT_ID | ✅ 저장됨 | 23e78f5... |
| KAKAO_CLIENT_SECRET | ✅ 저장됨 | pGHupGK... |
| KAKAO_BUSINESS_SECRET | ✅ 저장됨 | ymR5HHM... |
| NEXT_PUBLIC_KAKAO_JS_KEY | ✅ 저장됨 | a36a441... |
| KAKAO_NATIVE_APP_KEY | ✅ 저장됨 | 9276b14... |
| KAKAO_ADMIN_KEY | ✅ 저장됨 | 47be2ac... |

**설정 완료**: Kakao Developers
**Redirect URI 추가 필요** (프로덕션):
- `https://jikguyeokgu.vercel.app/api/auth/callback/kakao`

---

### 4. ✅ Cloudflare R2 (파일 저장소)

| 항목 | 상태 | 비고 |
|------|------|------|
| CLOUDFLARE_R2_ACCOUNT_ID | ✅ 저장됨 | 85eae33... |
| CLOUDFLARE_R2_ACCESS_KEY_ID | ✅ 저장됨 | e6eabb6... |
| CLOUDFLARE_R2_SECRET_ACCESS_KEY | ✅ 저장됨 | e4a781f... |
| CLOUDFLARE_R2_BUCKET_NAME | ✅ 설정됨 | jikguyeokgu-uploads |
| CLOUDFLARE_R2_ENDPOINT | ✅ 설정됨 | https://85eae...r2.cloudflarestorage.com |
| CLOUDFLARE_R2_PUBLIC_URL | ✅ 설정됨 | https://pub-f21d...r2.dev |

**설정 완료**: Cloudflare Dashboard
**프로덕션 준비**: ✅ 완료

---

### 5. ✅ 토스페이먼츠 (결제)

| 항목 | 상태 | 모드 |
|------|------|------|
| TOSS_CLIENT_KEY | ✅ 저장됨 | test_ck_... (테스트) |
| NEXT_PUBLIC_TOSS_CLIENT_KEY | ✅ 저장됨 | test_ck_... (테스트) |
| TOSS_SECRET_KEY | ✅ 저장됨 | test_sk_... (테스트) |
| TOSS_WEBHOOK_SECRET | ✅ 저장됨 | ef5a765... |

**현재 모드**: 테스트 모드 ✅
**프로덕션 배포 시**:
- ✋ Live 모드 키로 교체 필요
- ✋ Webhook URL 등록: `https://jikguyeokgu.vercel.app/api/webhooks/toss`

---

### 6. ✅ Pusher (실시간 채팅)

| 항목 | 상태 | 비고 |
|------|------|------|
| PUSHER_APP_ID | ✅ 저장됨 | 2117169 |
| NEXT_PUBLIC_PUSHER_KEY | ✅ 저장됨 | 38720f7... |
| PUSHER_SECRET | ✅ 저장됨 | 9438bb5... |
| NEXT_PUBLIC_PUSHER_CLUSTER | ✅ 설정됨 | ap3 |

**설정 완료**: Pusher Dashboard
**프로덕션 준비**: ✅ 완료

---

### 7. ✅ DeepL (번역)

| 항목 | 상태 | 비고 |
|------|------|------|
| DEEPL_API_KEY | ✅ 저장됨 | 03250d0...:fx |

**설정 완료**: DeepL API
**프로덕션 준비**: ✅ 완료

---

### 8. ✅ Cron Job 보안

| 항목 | 상태 | 비고 |
|------|------|------|
| CRON_SECRET | ✅ 저장됨 | faf3d56... (64자) |

**프로덕션 준비**: ✅ 완료
**용도**: Vercel Cron Jobs 인증

---

### 9. ⚠️ Supabase Storage (미설정)

| 항목 | 상태 | 비고 |
|------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | ❌ 빈 값 | 설정 필요 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ❌ 빈 값 | 설정 필요 |
| SUPABASE_SERVICE_ROLE_KEY | ❌ 빈 값 | 설정 필요 |

**현재 상태**: Cloudflare R2 사용 중 ✅
**선택 사항**: Supabase Storage는 선택 사항입니다.

---

### 10. ❌ SMS 인증 (미설정)

| 항목 | 상태 | 비고 |
|------|------|------|
| COOLSMS_API_KEY | ❌ 빈 값 | 한국 SMS |
| COOLSMS_API_SECRET | ❌ 빈 값 | 한국 SMS |
| ALIYUN_ACCESS_KEY_ID | ❌ 빈 값 | 중국 SMS |
| ALIYUN_ACCESS_KEY_SECRET | ❌ 빈 값 | 중국 SMS |

**선택 사항**: SMS 인증 기능 사용 시 설정

---

## 🚀 Vercel 배포 상태

### Vercel CLI 상태

```bash
$ which vercel
vercel not found
```

**상태**: ❌ Vercel CLI 미설치

**설치 필요**:
```bash
npm install -g vercel
```

### Vercel 프로젝트 연동

**`.vercel` 폴더**: ❌ 없음

**상태**: Vercel에 아직 연동되지 않음

**필요한 작업**:
1. Vercel CLI 설치
2. `vercel login` (브라우저 인증)
3. `vercel link` (프로젝트 연결)

---

## 📊 프로덕션 배포를 위한 체크리스트

### ✅ 이미 준비된 것

- [x] Supabase 데이터베이스 연결 (개발용)
- [x] NextAuth Secret 생성
- [x] Google OAuth 설정
- [x] Kakao OAuth 설정 (6개 키 모두)
- [x] Cloudflare R2 파일 저장소
- [x] 토스페이먼츠 (테스트 모드)
- [x] Pusher 실시간 채팅
- [x] DeepL 번역 API
- [x] Cron Job Secret

**총 9개 서비스 설정 완료!** ✅

---

### ⏳ 프로덕션 배포 전 필요한 작업

#### 1. Vercel 설정 (필수)

- [ ] Vercel CLI 설치
  ```bash
  npm install -g vercel
  ```

- [ ] Vercel 로그인
  ```bash
  vercel login
  ```

- [ ] Vercel 프로젝트 연결
  ```bash
  vercel link
  ```

---

#### 2. Supabase 프로덕션 DB (필수)

**현재 상태**: 개발용 DB (ap-south-1 인도)

**프로덕션용 필요**:
- [ ] 새 Supabase 프로젝트 생성
  - Region: **ap-northeast-2 (Seoul)** 또는 **ap-northeast-1 (Tokyo)**
  - Password: 강력한 비밀번호 설정

- [ ] Connection String 복사
  - DATABASE_URL (Session Pooler)
  - DIRECT_URL (Direct Connection)

**예상 형식**:
```
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
```

---

#### 3. Vercel 환경 변수 입력 (필수)

**Vercel Dashboard → Settings → Environment Variables**

**필수 변수 (5개)**:

| Name | Source | 비고 |
|------|--------|------|
| `DATABASE_URL` | 새 Supabase 프로젝트 | Connection pooling |
| `DIRECT_URL` | 새 Supabase 프로젝트 | Direct connection |
| `NEXTAUTH_URL` | 직접 입력 | https://jikguyeokgu.vercel.app |
| `NEXTAUTH_SECRET` | .env.local에서 복사 | 또는 새로 생성 |
| `CRON_SECRET` | .env.local에서 복사 | faf3d56... |

**선택 변수 (이미 준비된 것)**:

모두 `.env.local`에서 복사 가능:

- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_BUSINESS_SECRET
- NEXT_PUBLIC_KAKAO_JS_KEY, KAKAO_NATIVE_APP_KEY, KAKAO_ADMIN_KEY
- CLOUDFLARE_R2_* (6개)
- TOSS_* (4개) - 나중에 Live 키로 교체
- PUSHER_* (4개)
- DEEPL_API_KEY

---

#### 4. OAuth Redirect URI 업데이트 (필수)

**Google Cloud Console**:
- [ ] Authorized redirect URIs 추가:
  - `https://jikguyeokgu.vercel.app/api/auth/callback/google`

**Kakao Developers**:
- [ ] Redirect URI 추가:
  - `https://jikguyeokgu.vercel.app/api/auth/callback/kakao`

---

#### 5. 토스페이먼츠 Live 모드 (선택 - 나중에)

**현재**: 테스트 모드 키 사용 중 ✅

**정식 서비스 시**:
- [ ] 토스페이먼츠 사업자 인증
- [ ] Live 모드 키 발급
- [ ] Webhook URL 등록:
  - `https://jikguyeokgu.vercel.app/api/webhooks/toss`

---

## 🎯 즉시 실행 가능한 작업

### 제가 지금 바로 할 수 있는 것:

1. **Vercel CLI 설치**
   ```bash
   npm install -g vercel
   ```

2. **환경 변수 정리 파일 생성**
   - Vercel에 입력할 값들을 정리한 파일 생성

3. **OAuth Redirect URI 목록 생성**
   - Google, Kakao에 추가할 URI 목록

### 사용자님이 직접 하셔야 하는 것:

1. **Vercel 로그인** (브라우저 인증 필요)
   ```bash
   vercel login
   ```

2. **Supabase 프로덕션 프로젝트 생성** (웹 브라우저)
   - https://app.supabase.com
   - Region: Seoul 또는 Tokyo
   - Password 생성 및 저장

3. **Vercel에 환경 변수 입력** (웹 브라우저)
   - Dashboard에서 GUI로 입력
   - 또는 CLI: `vercel env add`

4. **OAuth Redirect URI 추가** (웹 브라우저)
   - Google Cloud Console
   - Kakao Developers

---

## 📝 요약

### 현재 상태

**✅ 준비 완료**:
- 9개 서비스 API 키/Secret 저장
- 로컬 개발 환경 완전 설정
- 모든 코드 및 테스트 완료

**⏳ 필요한 작업**:
- Vercel CLI 설치 및 연동
- Supabase 프로덕션 DB 생성
- Vercel 환경 변수 입력 (5개 필수)
- OAuth Redirect URI 업데이트

**예상 소요 시간**: 30-40분

---

## 💡 다음 단계 제안

**옵션 1: 지금 바로 시작**

1. 제가 Vercel CLI 설치
2. 제가 환경 변수 정리 파일 생성
3. 사용자님이 Supabase 프로덕션 DB 생성
4. 사용자님이 Vercel 로그인 및 환경 변수 입력
5. 제가 배포 실행

**옵션 2: 단계별 진행**

각 단계를 하나씩 확인하면서 진행

**옵션 3: 문서 먼저 확인**

`DEPLOYMENT_MANUAL.md`를 읽어보고 준비

---

**결론**: 이미 대부분의 API 키와 Secret이 안전하게 저장되어 있습니다! 🎉

프로덕션 배포를 위해 필요한 것은:
1. Vercel CLI 설치 (1분)
2. Supabase 프로덕션 DB 생성 (10분)
3. Vercel 환경 변수 입력 (10분)
4. OAuth Redirect URI 추가 (5분)

**총 소요 시간: 약 30분**

말씀만 해주시면 바로 시작하겠습니다! 🚀

---

**작성일**: 2024년
**상태**: 환경 변수 확인 완료 ✅
**다음**: Vercel 배포 대기 중
