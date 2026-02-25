# 환경변수 설정 가이드

> 배포 전 필수 설정 항목

---

## 🔑 필수 환경변수 목록

### 1. 데이터베이스
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 2. NextAuth (인증)
```env
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"  # 배포 시 실제 도메인으로 변경
```

### 3. OAuth 소셜 로그인

#### 카카오
```env
KAKAO_CLIENT_ID="your-kakao-client-id"
KAKAO_CLIENT_SECRET="your-kakao-client-secret"
```

#### 네이버
```env
NAVER_CLIENT_ID="your-naver-client-id"
NAVER_CLIENT_SECRET="your-naver-client-secret"
```

#### 구글
```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. 결제 시스템

#### 토스페이먼츠
```env
TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
```

#### 알리페이 (중국 결제) 🔴 **배포 전 필수**
```env
ALIPAY_APP_ID="your-alipay-app-id"
ALIPAY_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
ALIPAY_GATEWAY="https://openapi.alipay.com/gateway.do"  # 운영
# ALIPAY_GATEWAY="https://openapi.alipaydev.com/gateway.do"  # 개발
```

### 5. SMS 인증 🔴 **배포 전 필수**

#### CoolSMS (한국)
```env
COOLSMS_API_KEY="your-coolsms-api-key"
COOLSMS_API_SECRET="your-coolsms-api-secret"
COOLSMS_SENDER="01012345678"  # 발신번호
```

#### Aliyun SMS (중국)
```env
ALIYUN_ACCESS_KEY_ID="your-aliyun-access-key-id"
ALIYUN_ACCESS_KEY_SECRET="your-aliyun-access-key-secret"
ALIYUN_SMS_SIGN_NAME="your-sms-sign-name"
ALIYUN_SMS_TEMPLATE_CODE="SMS_123456789"
```

### 6. 파일 저장소 (Cloudflare R2)
```env
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="jikguyeokgu"
R2_PUBLIC_URL="https://your-r2-public-url"
```

### 7. 번역 API
```env
GOOGLE_TRANSLATE_API_KEY="your-google-translate-api-key"
```

### 8. 배송 추적 API 🔴 **배포 전 필수**

#### Smart Parcel (한국 배송업체)
```env
SMARTPARCEL_API_KEY="your-smartparcel-api-key"
```

#### 17Track (중국/국제 배송업체)
```env
TRACK17_API_KEY="your-17track-api-key"
```

---

## 📝 상세 설정 가이드

### 🇰🇷 1. CoolSMS 설정 (한국 SMS)

**가입 및 API 키 발급**:

1. [CoolSMS 홈페이지](https://coolsms.co.kr) 접속
2. 회원가입 후 로그인
3. 우측 상단 프로필 → **API 키 관리** 클릭
4. **새 API 키 생성** 버튼 클릭
5. API Key와 API Secret 복사하여 `.env` 파일에 저장

**발신번호 등록**:

1. 좌측 메뉴 **발신번호 관리** 클릭
2. **발신번호 등록** 버튼 클릭
3. 휴대폰 번호 입력 후 인증
4. 등록된 번호를 `COOLSMS_SENDER`에 입력

**요금 충전**:
- 좌측 메뉴 **충전** 클릭
- SMS 1건당 약 10원 (2024년 기준)
- 테스트용으로 1만원 정도 충전 권장

---

### 🇨🇳 2. Aliyun SMS 설정 (중국 SMS)

**가입 및 AccessKey 발급**:

1. [Aliyun 홈페이지](https://www.aliyun.com) 접속
2. 회원가입 (중국 휴대폰 번호 필요)
3. 콘솔 로그인 → **AccessKey 관리**
4. **AccessKey 생성** 버튼 클릭
5. AccessKey ID와 Secret 복사

**SMS 서비스 활성화**:

1. 콘솔에서 **短信服务 (SMS)** 검색
2. **开通服务 (서비스 활성화)** 클릭
3. 실명인증 완료 필요

**서명(Sign) 및 템플릿 생성**:

1. 좌측 메뉴 **签名管理** (서명 관리)
2. 서명 추가 (예: "直购驿购")
3. 좌측 메뉴 **模板管理** (템플릿 관리)
4. 인증 코드 템플릿 생성 (예: "验证码：${code}，有效期5分钟")
5. 승인 대기 (1-2일 소요)
6. 승인 후 서명명과 템플릿 코드를 `.env`에 입력

**요금**:
- SMS 1건당 약 0.045위안 (약 8원)
- 테스트용으로 100위안 충전 권장

---

### 💳 3. 알리페이 설정 (Alipay)

**개발자 계정 생성**:

1. [Alipay Open Platform](https://open.alipay.com) 접속
2. 회원가입 (중국 사업자등록증 필요)
3. 실명인증 완료

**앱 생성**:

1. 콘솔 → **网页&移动应用** (웹 & 모바일 앱)
2. **创建应用** (앱 생성)
3. 앱 이름: JIKGUYEOKGU
4. 앱 유형: **网页应用** (웹 앱)
5. 생성 후 APP ID 확인

**RSA 키 생성** (중요!):

**Mac/Linux**:
```bash
# 개인키 생성
openssl genrsa -out alipay_private_key.pem 2048

# 공개키 생성
openssl rsa -in alipay_private_key.pem -pubout -out alipay_public_key.pem

# 개인키 내용 출력 (복사하여 .env에 저장)
cat alipay_private_key.pem

# 공개키 내용 출력 (Alipay 콘솔에 업로드)
cat alipay_public_key.pem
```

**Windows**:
1. [OpenSSL for Windows](https://slproweb.com/products/Win32OpenSSL.html) 다운로드
2. 설치 후 위 명령어 실행

**공개키 업로드**:

1. Alipay 콘솔 → 앱 상세 → **开发设置** (개발 설정)
2. **接口加签方式** (인터페이스 서명 방식) → **公钥** (공개키)
3. 생성한 `alipay_public_key.pem` 내용 복사하여 붙여넣기
4. 저장 후 **支付宝公钥** (Alipay 공개키) 다운로드
5. Alipay 공개키를 `ALIPAY_PUBLIC_KEY`에 저장

**샌드박스 테스트**:

1. 콘솔 → **沙箱环境** (샌드박스 환경)
2. 샌드박스 APP ID 확인
3. 게이트웨이: `https://openapi.alipaydev.com/gateway.do`
4. 테스트 완료 후 운영 환경으로 전환

---

### 🏦 4. 토스페이먼츠 설정

**개발자 계정 생성**:

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com) 접속
2. 회원가입 후 로그인
3. **내 앱 관리** → **앱 생성**

**API 키 발급**:

1. 생성한 앱 클릭
2. **개발 정보** 탭
3. **클라이언트 키**와 **시크릿 키** 확인
4. 테스트 키를 먼저 사용하고, 심사 후 라이브 키로 전환

**웹훅 URL 설정**:

1. **웹훅 설정** 탭
2. URL 입력: `https://yourdomain.com/api/payments/webhook`
3. 이벤트 선택: **결제 승인**, **결제 취소**, **가상계좌 입금**

**테스트 결제**:
- 테스트 카드번호: `4330123412341234`
- 유효기간: 아무 미래 날짜
- CVC: 아무 3자리 숫자

---

### ☁️ 5. Cloudflare R2 설정

**R2 활성화**:

1. [Cloudflare Dashboard](https://dash.cloudflare.com) 로그인
2. 좌측 메뉴 **R2** 클릭
3. **구매** 버튼 클릭 (무료 플랜 가능)

**버킷 생성**:

1. **Create bucket** 버튼
2. 버킷 이름: `jikguyeokgu`
3. 지역: **APAC** (아시아태평양)
4. 생성 완료

**API 토큰 생성**:

1. 우측 상단 **Manage R2 API Tokens**
2. **Create API Token**
3. 권한: **Admin Read & Write**
4. Access Key ID와 Secret Access Key 복사

**공개 URL 설정**:

1. 생성한 버킷 클릭
2. **Settings** 탭
3. **Public access** → **Allow Access**
4. **Custom Domains** → 도메인 연결
5. Public URL 확인하여 `.env`에 저장

---

### 🌐 6. 구글 번역 API 설정

**프로젝트 생성**:

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성: `jikguyeokgu`
3. 프로젝트 선택

**Translation API 활성화**:

1. 좌측 메뉴 **API 및 서비스** → **라이브러리**
2. "Cloud Translation API" 검색
3. **사용** 버튼 클릭

**API 키 생성**:

1. 좌측 메뉴 **사용자 인증 정보**
2. **사용자 인증 정보 만들기** → **API 키**
3. 생성된 키 복사
4. **키 제한** 설정 (선택):
   - API 제한사항: Cloud Translation API만 선택
   - 애플리케이션 제한사항: 웹사이트 → 도메인 입력

**요금**:
- 월 50만 자까지 무료
- 초과 시 100만 자당 $20

---

### 🚚 7. Smart Parcel API 설정 (한국 배송 추적)

**API 키 발급**:

1. [Tracker.Delivery](https://tracker.delivery) 접속
2. 회원가입 후 로그인
3. **API Keys** 메뉴 클릭
4. **Generate New API Key** 버튼 클릭
5. API Key 복사하여 `.env` 파일에 저장

**지원 택배사**:
- CJ대한통운, 한진택배, 롯데택배, 로젠택배, 우체국택배

**요금**:
- 월 1,000건까지 무료
- 초과 시 건당 ₩10

**테스트**:
```bash
curl https://apis.tracker.delivery/carriers/kr.cjlogistics/tracks/1234567890 \
  -H "Authorization: SMARTPARCEL your-api-key"
```

---

### 🇨🇳 8. 17Track API 설정 (중국/국제 배송 추적)

**API 키 발급**:

1. [17Track 개발자 센터](https://www.17track.net/en/api) 접속
2. 회원가입 후 로그인
3. **API Key** 섹션에서 키 생성
4. API Key 복사하여 `.env` 파일에 저장

**지원 택배사**:
- 중국: SF Express, ZTO, YTO, Yunda, STO, EMS
- 국제: DHL, FedEx, UPS 등 900개 이상

**요금**:
- Free Plan: 월 100건 무료
- Basic Plan: 월 $19.99 (1,000건)
- Pro Plan: 월 $99.99 (10,000건)

**테스트**:
```bash
curl -X POST https://api.17track.net/track/v2/register \
  -H "Content-Type: application/json" \
  -H "17token: your-api-key" \
  -d '[{"number":"1234567890","carrier":501}]'
```

**Carrier 코드**:
- SF Express: 501
- ZTO: 502
- YTO: 503
- Yunda: 504
- STO: 505
- EMS: 506
- DHL: 25
- FedEx: 26
- UPS: 27

---

## 🧪 테스트 방법

### SMS 테스트
```bash
# 한국 SMS
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "01012345678", "country": "KR"}'

# 중국 SMS
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000", "country": "CN"}'
```

### 결제 테스트
1. 상품 구매 플로우 진행
2. 결제 페이지에서 테스트 카드 사용
3. 결제 승인 확인
4. 웹훅 수신 확인

### 이미지 업로드 테스트
1. 상품 등록 페이지 접속
2. 이미지 선택 후 업로드
3. R2 버킷에 파일 생성 확인
4. 공개 URL로 이미지 접근 확인

### 배송 추적 테스트
```bash
# 한국 택배 추적
curl http://localhost:3000/api/shipping/track?trackingNumber=1234567890&carrier=CJ

# 중국 택배 추적
curl http://localhost:3000/api/shipping/track?trackingNumber=SF1234567890&carrier=SF

# 주문 배송 추적 (로그인 필요)
curl -X POST http://localhost:3000/api/shipping/track \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order-id-here"}'
```

---

## ⚠️ 주의사항

### 보안
- `.env` 파일은 **절대 Git에 커밋하지 않기**
- API 키는 정기적으로 변경
- 라이브 키는 서버 환경변수로만 관리

### 비용 관리
- 각 서비스 사용량 모니터링
- 예산 알림 설정
- 테스트 시 최소 금액 충전

### 백업
- `.env` 파일 안전한 곳에 백업
- 1Password, AWS Secrets Manager 등 활용

---

## 📞 문제 발생 시

### CoolSMS
- 고객센터: 1661-2648
- 이메일: support@coolsms.co.kr

### Aliyun
- 中国站: 95187
- 国际站: +86 95187

### 토스페이먼츠
- 고객센터: 1544-7772
- 이메일: support@tosspayments.com

### Cloudflare
- 커뮤니티: https://community.cloudflare.com
- 대시보드에서 티켓 생성

### Smart Parcel (Tracker.Delivery)
- 이메일: support@tracker.delivery
- 문서: https://tracker.delivery/docs

### 17Track
- 이메일: service@17track.net
- FAQ: https://www.17track.net/en/faq

---

**마지막 업데이트**: 2024년
**작성자**: JIKGUYEOKGU 개발팀

### 🇨🇳 9. WeChat Pay 설정 (중국 결제)

**상점 등록**:

1. [WeChat Pay 상점 플랫폼](https://pay.weixin.qq.com) 접속
2. 기업 계정 등록 (개인 불가)
3. 사업자 정보 및 법인 정보 제출
4. 심사 완료 후 상점 ID(MCH_ID) 발급

**API 키 설정**:

1. 상점 플랫폼 로그인
2. 계정 설정 → API 보안
3. API 키 설정 (32자리)
4. `.env` 파일에 저장

**환경변수**:
```env
WECHAT_APP_ID="wxXXXXXXXXXXXXXXXX"
WECHAT_MCH_ID="1234567890"
WECHAT_API_KEY="your-32-character-api-key"
```

**결제 방식**:
- NATIVE: QR 코드 스캔 결제
- JSAPI: 위챗 내부 브라우저 결제
- MWEB: H5 모바일 웹 결제
- APP: 앱 내 결제

**요금**:
- 국내 거래: 0.6%
- 크로스보더: 1.0%

**테스트**:
```bash
curl -X POST http://localhost:3000/api/payment/wechat/create \
  -H "Content-Type: application/json" \
  -d '{"orderId":"order-id","tradeType":"NATIVE"}'
```

---

### WeChat Pay
- 고객센터: +86 95017
- 이메일: wxpay_cn@tencent.com
- 문서: https://pay.weixin.qq.com/wiki/doc/api/index.html

