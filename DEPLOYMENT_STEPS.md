# 🚀 Vercel 배포 단계별 실행 가이드

**시작 시간**: 지금
**예상 소요 시간**: 30-40분

---

## ✅ Step 1: Vercel CLI 설치 (완료!)

```bash
✓ Vercel CLI 설치 완료
✓ Version: 50.23.2
```

---

## 👤 Step 2: Vercel 로그인 (사용자 작업 필요)

### 실행 명령어

```bash
vercel login
```

### 예상 동작

1. 명령어 실행 시 브라우저가 자동으로 열립니다
2. Vercel 계정 선택 또는 가입:
   - **GitHub 계정으로 가입** (권장)
   - 또는 이메일로 가입
3. 이메일 확인 링크 클릭
4. 터미널에 "Success! Email authentication complete" 메시지 표시

### 계정이 없다면?

**Vercel 가입** (무료):
1. 브라우저에서 https://vercel.com/signup 접속
2. "Continue with GitHub" 클릭 (권장)
3. GitHub 계정으로 인증
4. 또는 이메일로 가입

### 실행 준비

**이제 터미널에서 다음 명령어를 실행해주세요:**

```bash
vercel login
```

**브라우저가 열리면:**
- Vercel 계정으로 로그인
- 이메일 확인 링크 클릭
- "Logged in!" 메시지 확인

---

## 🗄️ Step 3: Supabase 프로덕션 DB 생성 (사용자 작업 필요)

### 로그인 후 동시 진행 가능

Vercel 로그인을 완료하는 동안 Supabase DB를 생성하시면 시간을 절약할 수 있습니다.

### 3-1. Supabase 프로젝트 생성

**1. Supabase Dashboard 접속**
- URL: https://app.supabase.com
- 로그인 (GitHub 계정 권장)

**2. "New Project" 클릭**

**3. 프로젝트 정보 입력**

| 항목 | 입력 값 | 중요도 |
|------|---------|--------|
| **Organization** | 기존 선택 또는 새로 생성 | - |
| **Name** | `jikguyeokgu-production` | ⭐ |
| **Database Password** | 강력한 비밀번호 생성 | ⭐⭐⭐ |
| **Region** | **Northeast Asia (Seoul)** | ⭐⭐⭐ |

**⚠️ 매우 중요!**
- **Database Password를 반드시 안전한 곳에 저장하세요!**
- 메모장, 1Password, 또는 안전한 비밀번호 관리자에 저장
- 이 비밀번호는 복구할 수 없습니다!

**4. "Create new project" 클릭**

프로젝트 생성에 약 2분 소요됩니다. 진행 상태바를 확인하세요.

---

### 3-2. Connection String 복사

프로젝트 생성 완료 후:

**1. Settings → Database 메뉴 이동**

**2. "Connection string" 섹션에서 복사**

**Connection Pooling (DATABASE_URL)**
```
Connection string 탭 선택
→ Session mode 선택 (기본값)
→ URI 복사 버튼 클릭
```

예시:
```
postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

**Direct Connection (DIRECT_URL)**
```
아래로 스크롤
→ "Direct Connection" 섹션
→ URI 복사 버튼 클릭
```

예시:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

**⚠️ 주의: `[YOUR-PASSWORD]`를 실제 비밀번호로 교체!**

---

### 3-3. Connection String 저장

복사한 2개의 URL을 메모장에 저장하세요:

```
DATABASE_URL=postgresql://postgres.xxx:[실제비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

DIRECT_URL=postgresql://postgres:[실제비밀번호]@db.xxx.supabase.co:5432/postgres
```

---

## 🔗 Step 4: Vercel 프로젝트 연결 (자동화 가능)

### Vercel 로그인 완료 후 진행

**실행 명령어:**
```bash
vercel link
```

### 프롬프트 응답 가이드

```
? Set up and deploy "~/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu"? [Y/n]
→ Y 입력 (엔터)

? Which scope should contain your project?
→ 본인 계정 선택 (화살표 키로 이동 후 엔터)

? Link to existing project? [y/N]
→ N 입력 (새 프로젝트)

? What's your project's name?
→ jikguyeokgu (또는 원하는 이름, 엔터)

? In which directory is your code located?
→ ./ (그냥 엔터)
```

**성공 메시지:**
```
✓ Linked to yourname/jikguyeokgu
```

`.vercel` 폴더가 생성됩니다.

---

## 🔑 Step 5: Vercel 환경 변수 설정 (사용자 작업)

### 방법 1: Vercel Dashboard (권장)

**더 쉽고 안전한 방법입니다!**

**1. Vercel Dashboard 접속**
- URL: https://vercel.com/dashboard
- 프로젝트 선택: `jikguyeokgu`

**2. Settings → Environment Variables 메뉴**

**3. "Add New" 클릭하여 하나씩 추가**

#### 필수 환경 변수 (5개)

**`VERCEL_ENV_READY.txt` 파일을 열어 값을 복사하세요!**

| # | Name | Value | Environment |
|---|------|-------|-------------|
| 1 | `DATABASE_URL` | Supabase에서 복사한 Connection Pooling URL | Production ✅ |
| 2 | `DIRECT_URL` | Supabase에서 복사한 Direct Connection URL | Production ✅ |
| 3 | `NEXTAUTH_URL` | `https://jikguyeokgu.vercel.app` | Production ✅ |
| 4 | `NEXTAUTH_SECRET` | `tHnXCrNBPeLd9QyJmLahmn068slZet3+EwptosL+1sk=` | Production ✅ |
| 5 | `CRON_SECRET` | `faf3d567d3fca3a215ad9116ec3e69e4b5eb73df10e79e379c9f387ea0a83f6d` | Production ✅ |

**Environment 선택:**
- ✅ Production (필수 체크)
- ⬜ Preview (선택)
- ⬜ Development (선택)

**4. 각 변수마다 "Save" 클릭**

---

#### 선택 환경 변수 (23개)

**기능별로 필요한 것만 추가하세요:**

**OAuth (8개) - 로그인 기능**
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- KAKAO_CLIENT_ID
- KAKAO_CLIENT_SECRET
- KAKAO_BUSINESS_SECRET
- NEXT_PUBLIC_KAKAO_JS_KEY
- KAKAO_NATIVE_APP_KEY
- KAKAO_ADMIN_KEY

**Cloudflare R2 (6개) - 파일 업로드**
- CLOUDFLARE_R2_ACCOUNT_ID
- CLOUDFLARE_R2_ACCESS_KEY_ID
- CLOUDFLARE_R2_SECRET_ACCESS_KEY
- CLOUDFLARE_R2_BUCKET_NAME
- CLOUDFLARE_R2_ENDPOINT
- CLOUDFLARE_R2_PUBLIC_URL

**토스페이먼츠 (4개) - 결제 (테스트 모드)**
- TOSS_CLIENT_KEY
- NEXT_PUBLIC_TOSS_CLIENT_KEY
- TOSS_SECRET_KEY
- TOSS_WEBHOOK_SECRET

**Pusher (4개) - 실시간 채팅**
- PUSHER_APP_ID
- NEXT_PUBLIC_PUSHER_KEY
- PUSHER_SECRET
- NEXT_PUBLIC_PUSHER_CLUSTER

**DeepL (1개) - 번역**
- DEEPL_API_KEY

**모든 값은 `VERCEL_ENV_READY.txt` 파일에 있습니다!**

---

### 방법 2: Vercel CLI (고급 사용자)

```bash
# 각 환경 변수 하나씩 추가
vercel env add DATABASE_URL production
# 값 입력 (붙여넣기)

vercel env add DIRECT_URL production
# 값 입력

vercel env add NEXTAUTH_URL production
# 값 입력

vercel env add NEXTAUTH_SECRET production
# 값 입력

vercel env add CRON_SECRET production
# 값 입력
```

---

## 🚀 Step 6: Preview 배포 (자동화 가능)

### 환경 변수 설정 완료 후 진행

**실행 명령어:**
```bash
vercel
```

### 예상 출력

```
🔍  Inspect: https://vercel.com/yourname/jikguyeokgu/xxxxx
✅  Preview: https://jikguyeokgu-xxxxx.vercel.app
📝  Deployed to production. Run `vercel --prod` to deploy to production.
```

### Preview URL 테스트

**브라우저에서 Preview URL 접속:**
- https://jikguyeokgu-xxxxx.vercel.app

**확인 사항:**
- [ ] 홈페이지 로드 확인
- [ ] 404 페이지 확인 (/nonexistent)
- [ ] API 응답 확인 (/api/auth/session)

**문제가 있다면:**
- Vercel Dashboard → Deployments → 최신 배포 → Logs 확인
- 에러 메시지 확인

---

## 🗄️ Step 7: 데이터베이스 마이그레이션 (자동화 가능)

### Preview 배포 성공 후 진행

**7-1. 환경 변수 설정 (터미널)**

```bash
# Supabase에서 복사한 DIRECT_URL 사용
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

**⚠️ `[PASSWORD]`를 실제 비밀번호로 교체!**

**7-2. Prisma Client 생성**

```bash
npx prisma generate
```

**7-3. 마이그레이션 적용**

```bash
npx prisma migrate deploy
```

**예상 출력:**
```
✓ Applying migration `20240101000000_init`
✓ Migration applied successfully
```

---

## 🌱 Step 8: Seed 데이터 생성 (선택 사항)

### 기본 데이터가 필요한 경우

**8-1. 관리자 계정 생성**

```bash
npm run db:set-admin
```

관리자 이메일/비밀번호를 설정합니다.

**8-2. 기본 카테고리 등 생성**

```bash
npm run db:seed
```

카테고리, 배송 템플릿 등 기본 데이터를 생성합니다.

---

## 🎉 Step 9: Production 배포 (자동화 가능)

### 모든 확인 완료 후 진행

**실행 명령어:**
```bash
vercel --prod
```

### 예상 출력

```
🔍  Inspect: https://vercel.com/yourname/jikguyeokgu/xxxxx
✅  Production: https://jikguyeokgu.vercel.app
```

### Production URL 확인

**브라우저에서 접속:**
- https://jikguyeokgu.vercel.app

**필수 확인 사항:**
- [ ] 홈페이지 로드
- [ ] 로그인 페이지 (/login)
- [ ] 회원가입 페이지 (/register)
- [ ] 상품 목록 (/products)
- [ ] 404 페이지
- [ ] API 응답 (/api/auth/session)

---

## ✅ Step 10: Cron Jobs 확인

### Vercel Dashboard에서 확인

**Vercel Dashboard → Project → Settings → Cron Jobs**

**9개 Cron Job 등록 확인:**
- ✅ /api/exchange-rate/update (매일 00:00 KST)
- ✅ /api/orders/auto-confirm (매일 15:00 KST)
- ✅ /api/ads/weekly-close (월요일 01:00 KST)
- ✅ /api/disputes/process-expired (매일 02:00 KST)
- ✅ /api/cron/coupon-automation (매일 09:00 KST)
- ✅ /api/cron/seller-grades (일요일 02:00 KST)
- ✅ /api/cron/review-reminders (매일 10:00 KST)
- ✅ /api/cron/price-alerts (6시간마다)
- ✅ /api/cron/best-reviews (매월 1일 00:00 KST)

**다음 실행 시간 확인**

---

## 🔗 Step 11: OAuth Redirect URI 업데이트 (선택 사항)

### Google OAuth (사용하는 경우)

**Google Cloud Console:**
1. https://console.cloud.google.com 접속
2. 프로젝트 선택
3. APIs & Services → Credentials
4. OAuth 2.0 Client IDs → 해당 클라이언트 선택
5. **Authorized redirect URIs** 추가:
   ```
   https://jikguyeokgu.vercel.app/api/auth/callback/google
   ```
6. Save

---

### Kakao OAuth (사용하는 경우)

**Kakao Developers:**
1. https://developers.kakao.com 접속
2. 애플리케이션 선택
3. 카카오 로그인 → Redirect URI
4. **Redirect URI** 추가:
   ```
   https://jikguyeokgu.vercel.app/api/auth/callback/kakao
   ```
5. 저장

---

## 📊 Step 12: 배포 확인 및 모니터링

### 터미널에서 확인

**기본 접속 테스트:**
```bash
curl -I https://jikguyeokgu.vercel.app
```

**예상 결과:**
```
HTTP/2 200
```

**Session API 확인:**
```bash
curl https://jikguyeokgu.vercel.app/api/auth/session
```

**예상 결과:**
```json
{"user":null}
```

---

### Vercel Dashboard 모니터링

**1. Analytics**
- Real-time 방문자 수
- Page Views
- Top Pages

**2. Logs**
- Function Logs
- Build Logs
- Error Logs

**3. Deployment**
- 배포 상태
- 빌드 시간
- 에러 여부

---

## 🎯 완료 체크리스트

### 필수 작업

- [ ] Vercel CLI 설치 ✅ (완료!)
- [ ] Vercel 로그인
- [ ] Supabase 프로덕션 DB 생성
- [ ] Connection String 복사
- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 입력 (5개 필수)
- [ ] Preview 배포
- [ ] DB 마이그레이션
- [ ] Production 배포
- [ ] Cron Jobs 확인

### 선택 작업

- [ ] Seed 데이터 생성
- [ ] OAuth Redirect URI 업데이트
- [ ] 선택 환경 변수 추가 (23개)

---

## 🚨 문제 해결

### 빌드 실패

**Vercel Dashboard → Logs 확인**
- Build Logs에서 에러 메시지 확인
- 환경 변수 누락 여부 확인

### 데이터베이스 연결 실패

**확인 사항:**
- DATABASE_URL이 올바른지 확인
- 비밀번호가 정확한지 확인
- Supabase 프로젝트가 활성화되었는지 확인

### 404 에러

**확인 사항:**
- 배포가 완료되었는지 확인
- URL이 정확한지 확인
- Vercel Dashboard에서 배포 상태 확인

---

## 📞 도움이 필요하시면

**에러 메시지 공유:**
- 스크린샷
- Vercel Logs
- 터미널 출력

**다음 정보 제공:**
- 어느 단계에서 막혔는지
- 어떤 에러 메시지가 나왔는지
- 환경 변수는 모두 입력했는지

---

## 🎊 배포 완료 후

**축하합니다!** 🎉

베타 서비스가 성공적으로 배포되었습니다!

**다음 단계:**
1. 베타 테스터 모집 (10-20명)
2. 2주간 베타 테스트 진행
3. 피드백 수집 및 버그 수정
4. 정식 런칭 준비

**Production URL:**
- https://jikguyeokgu.vercel.app

**Vercel Dashboard:**
- https://vercel.com/dashboard

**Supabase Dashboard:**
- https://app.supabase.com

---

**작성일**: 2024년
**현재 단계**: Step 1 완료 (Vercel CLI 설치)
**다음 단계**: Step 2 (Vercel 로그인)

🚀 **지금 시작하세요!**
