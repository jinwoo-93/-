# 환경 변수 체크리스트

## 📋 배포를 위한 환경 변수 설정 가이드

이 문서는 Vercel 배포 시 필요한 모든 환경 변수를 정리한 체크리스트입니다.

---

## 🔴 필수 환경 변수 (REQUIRED)

### 데이터베이스 (Database)

```bash
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

**설정 방법:**
1. Supabase Dashboard → Settings → Database
2. Connection String 복사
3. Vercel → Environment Variables에 추가

**확인 사항:**
- [ ] DATABASE_URL 설정 완료
- [ ] DIRECT_URL 설정 완료
- [ ] 패스워드가 정확한지 확인
- [ ] 데이터베이스 연결 테스트 완료

---

### 인증 (Authentication)

```bash
# NextAuth 설정
NEXTAUTH_URL="https://jikguyeokgu.vercel.app"  # 또는 커스텀 도메인
NEXTAUTH_SECRET="[GENERATE_WITH_OPENSSL]"
```

**Secret 생성 방법:**
```bash
openssl rand -base64 32
```

**확인 사항:**
- [ ] NEXTAUTH_URL에 프로덕션 URL 설정
- [ ] NEXTAUTH_SECRET 생성 및 설정
- [ ] Production, Preview, Development 환경별로 설정

---

### Cron Job 보안

```bash
# Vercel Cron Jobs 인증용
CRON_SECRET="[GENERATE_WITH_OPENSSL]"
```

**설정 방법:**
```bash
openssl rand -base64 32
```

**확인 사항:**
- [ ] CRON_SECRET 생성 및 설정
- [ ] API 라우트에서 검증 로직 확인
- [ ] 9개 Cron Job 모두 등록 확인

---

## 🟡 선택 환경 변수 (OPTIONAL)

### OAuth 제공자 - 한국

#### Kakao

```bash
KAKAO_CLIENT_ID="your-kakao-rest-api-key"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

**설정 방법:**
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 생성
3. REST API 키 복사 (CLIENT_ID)
4. 보안 → Client Secret 생성 (CLIENT_SECRET)
5. Redirect URI 설정: `https://yourdomain.com/api/auth/callback/kakao`

**확인 사항:**
- [ ] 애플리케이션 생성
- [ ] REST API 키 복사
- [ ] Client Secret 생성
- [ ] Redirect URI 등록
- [ ] 사용자 정보 동의 항목 설정 (이메일, 프로필)

---

#### Naver

```bash
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```

**설정 방법:**
1. [Naver Developers](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. Client ID, Client Secret 복사
4. Callback URL 설정: `https://yourdomain.com/api/auth/callback/naver`

**확인 사항:**
- [ ] 애플리케이션 등록
- [ ] Client ID 복사
- [ ] Client Secret 복사
- [ ] Callback URL 등록
- [ ] 제공 정보 설정 (이메일, 닉네임, 프로필 이미지)

---

### OAuth 제공자 - 중국

#### WeChat

```bash
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"
```

**설정 방법:**
1. [WeChat Open Platform](https://open.weixin.qq.com/) 접속
2. 웹사이트 애플리케이션 등록
3. AppID, AppSecret 복사
4. Callback URL 설정

**확인 사항:**
- [ ] 웹사이트 애플리케이션 등록
- [ ] AppID 복사
- [ ] AppSecret 복사
- [ ] Callback URL 등록

---

### OAuth 제공자 - 글로벌

#### Google

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**설정 방법:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
5. Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

**확인 사항:**
- [ ] Google Cloud 프로젝트 생성
- [ ] OAuth 2.0 Client ID 생성
- [ ] Client ID, Secret 복사
- [ ] Redirect URIs 등록
- [ ] OAuth consent screen 설정

---

## 💳 결제 시스템

### Stripe (글로벌)

```bash
STRIPE_SECRET_KEY="sk_live_..."  # 또는 sk_test_...
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."  # 또는 pk_test_...
```

**설정 방법:**
1. [Stripe Dashboard](https://dashboard.stripe.com/) 접속
2. API Keys → Secret Key 복사
3. Webhooks → Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Webhook Secret 복사
5. Publishable Key 복사

**확인 사항:**
- [ ] Secret Key 설정
- [ ] Webhook Secret 설정
- [ ] Publishable Key 설정 (NEXT_PUBLIC_)
- [ ] Webhook 엔드포인트 등록
- [ ] 테스트/프로덕션 모드 확인

---

### 토스페이먼츠 (한국)

```bash
TOSS_CLIENT_KEY="test_ck_..." # 또는 live_ck_...
TOSS_SECRET_KEY="test_sk_..." # 또는 live_sk_...
```

**설정 방법:**
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 애플리케이션 생성
3. Client Key, Secret Key 복사

**확인 사항:**
- [ ] 애플리케이션 생성
- [ ] Client Key 복사
- [ ] Secret Key 복사
- [ ] 테스트/라이브 모드 확인

---

### 알리페이 (중국)

```bash
ALIPAY_APP_ID="your-alipay-app-id"
ALIPAY_PRIVATE_KEY="your-rsa-private-key"
ALIPAY_PUBLIC_KEY="alipay-rsa-public-key"
ALIPAY_GATEWAY="https://openapi.alipay.com/gateway.do"
```

**설정 방법:**
1. [Alipay Open Platform](https://open.alipay.com/) 접속
2. 애플리케이션 생성
3. RSA 키 생성
4. App ID, Private Key, Public Key 설정

**확인 사항:**
- [ ] 애플리케이션 생성
- [ ] App ID 복사
- [ ] RSA 키 페어 생성
- [ ] Private Key 설정
- [ ] Alipay Public Key 설정

---

## 🗄️ 파일 저장소

### Option 1: Supabase Storage

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."
```

**설정 방법:**
1. Supabase Dashboard → Settings → API
2. Project URL 복사
3. anon public key 복사
4. service_role key 복사

**확인 사항:**
- [ ] Project URL 설정
- [ ] anon key 설정 (NEXT_PUBLIC_)
- [ ] service_role key 설정
- [ ] Storage 버킷 생성 (products, profiles, reviews)
- [ ] CORS 설정

---

### Option 2: AWS S3

```bash
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="jikguyeokgu-uploads"
AWS_REGION="ap-northeast-2"  # Seoul
```

**설정 방법:**
1. AWS IAM → Create User
2. S3 Full Access 권한 부여
3. Access Key 생성
4. S3 Bucket 생성

**확인 사항:**
- [ ] IAM 사용자 생성
- [ ] Access Key 생성
- [ ] S3 Bucket 생성
- [ ] Bucket 정책 설정
- [ ] CORS 설정

---

### Option 3: Cloudflare R2

```bash
S3_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="jikguyeokgu"
S3_REGION="auto"
CDN_URL="https://cdn.yourdomain.com"
```

**설정 방법:**
1. Cloudflare Dashboard → R2
2. Bucket 생성
3. API Token 생성
4. Custom Domain 연결 (CDN)

**확인 사항:**
- [ ] R2 Bucket 생성
- [ ] API Token 생성
- [ ] Access Key ID 복사
- [ ] Secret Access Key 복사
- [ ] Custom Domain 연결

---

## 🌐 기타 서비스

### DeepL (번역)

```bash
DEEPL_API_KEY="your-deepl-api-key"
```

**설정 방법:**
1. [DeepL API](https://www.deepl.com/pro-api) 접속
2. 계정 가입 (Free 또는 Pro)
3. API Key 복사

**확인 사항:**
- [ ] DeepL 계정 생성
- [ ] API Key 복사
- [ ] 무료/유료 플랜 확인

---

### Resend (이메일)

```bash
RESEND_API_KEY="re_..."
```

**설정 방법:**
1. [Resend](https://resend.com/) 접속
2. 계정 가입
3. API Key 생성
4. 도메인 인증 (선택)

**확인 사항:**
- [ ] Resend 계정 생성
- [ ] API Key 생성
- [ ] 도메인 인증 (프로덕션)
- [ ] 발신자 이메일 설정

---

### Firebase (푸시 알림)

```bash
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
```

**설정 방법:**
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 생성
3. Settings → Service accounts
4. Generate new private key (JSON 다운로드)
5. JSON에서 project_id, private_key, client_email 추출

**주의사항:**
- `FIREBASE_PRIVATE_KEY`는 `\n`을 실제 줄바꿈이 아닌 문자열로 설정
- Vercel에 설정 시 따옴표로 감싸기

**확인 사항:**
- [ ] Firebase 프로젝트 생성
- [ ] Service Account Key 다운로드
- [ ] PROJECT_ID 복사
- [ ] PRIVATE_KEY 복사 (\n 포함)
- [ ] CLIENT_EMAIL 복사
- [ ] Cloud Messaging 활성화

---

### Exchange Rate API

```bash
EXCHANGE_RATE_API_KEY="your-api-key"
```

**설정 방법:**
1. [ExchangeRate-API](https://www.exchangerate-api.com/) 또는 다른 서비스
2. 계정 가입
3. API Key 복사

**확인 사항:**
- [ ] 환율 API 서비스 선택
- [ ] API Key 복사
- [ ] 무료/유료 플랜 확인
- [ ] 지원 통화 확인 (KRW, CNY, USD)

---

### SMS 인증 - 한국 (CoolSMS)

```bash
COOLSMS_API_KEY="your-api-key"
COOLSMS_API_SECRET="your-api-secret"
COOLSMS_SENDER_NUMBER="01012345678"
```

**설정 방법:**
1. [CoolSMS](https://www.coolsms.co.kr/) 접속
2. 계정 가입 및 충전
3. API Key 생성
4. 발신번호 등록

**확인 사항:**
- [ ] CoolSMS 계정 생성
- [ ] API Key 생성
- [ ] API Secret 복사
- [ ] 발신번호 등록 및 인증
- [ ] 충전 완료

---

### SMS 인증 - 중국 (Aliyun)

```bash
ALIYUN_ACCESS_KEY_ID="LTAI..."
ALIYUN_ACCESS_KEY_SECRET="..."
ALIYUN_SMS_SIGN_NAME="your-signature-name"
ALIYUN_SMS_TEMPLATE_CODE="SMS_..."
```

**설정 방법:**
1. [Alibaba Cloud](https://www.alibabacloud.com/) 접속
2. SMS Service 활성화
3. Access Key 생성
4. 서명 및 템플릿 등록

**확인 사항:**
- [ ] Alibaba Cloud 계정 생성
- [ ] SMS Service 활성화
- [ ] Access Key 생성
- [ ] 서명 등록 및 승인
- [ ] 템플릿 등록 및 승인

---

## 🔧 Vercel 설정 방법

### CLI로 환경 변수 추가

```bash
# Production 환경
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production

# Preview 환경 (선택)
vercel env add DATABASE_URL preview

# Development 환경 (선택)
vercel env add DATABASE_URL development
```

### Dashboard에서 추가

1. Vercel Dashboard 접속
2. Project 선택
3. Settings → Environment Variables
4. Add New 클릭
5. Name, Value 입력
6. Environment 선택 (Production, Preview, Development)
7. Save

---

## ✅ 최종 체크리스트

### 필수 (배포 전 반드시 설정)

- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET
- [ ] CRON_SECRET

### 인증 (OAuth 사용 시)

- [ ] KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET
- [ ] NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
- [ ] WECHAT_APP_ID, WECHAT_APP_SECRET (중국 사용자)
- [ ] GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (선택)

### 결제 (결제 기능 사용 시)

- [ ] STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] TOSS_CLIENT_KEY, TOSS_SECRET_KEY
- [ ] ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY (중국)

### 파일 저장소 (하나 선택)

- [ ] Supabase: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- [ ] AWS S3: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
- [ ] Cloudflare R2: S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET_NAME

### 기타 서비스 (기능별 선택)

- [ ] DEEPL_API_KEY (번역)
- [ ] RESEND_API_KEY (이메일)
- [ ] FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL (푸시 알림)
- [ ] EXCHANGE_RATE_API_KEY (환율)
- [ ] COOLSMS_API_KEY, COOLSMS_API_SECRET (한국 SMS)
- [ ] ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET (중국 SMS)

---

## 🔒 보안 주의사항

### 절대 하지 말아야 할 것

- ❌ `.env` 파일을 Git에 커밋
- ❌ Secret 값을 코드에 하드코딩
- ❌ API Key를 클라이언트 코드에 노출
- ❌ Public 환경 변수에 민감한 정보 저장

### 반드시 해야 할 것

- ✅ `.env` 파일은 `.gitignore`에 포함
- ✅ `.env.example` 파일 최신화
- ✅ Production과 Development Secret 분리
- ✅ Secret을 안전한 곳에 백업 (1Password, AWS Secrets Manager 등)
- ✅ 정기적으로 Secret 로테이션

---

## 📚 참고 문서

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Environment Variables](https://www.prisma.io/docs/guides/development-environment/environment-variables)

---

**작성일**: 2024년
**작성자**: Claude (Anthropic)
**프로젝트**: 직구역구 (JIKGUYEOKGU)
**버전**: Beta v1.0.0
**상태**: 배포 준비 완료 ✅
