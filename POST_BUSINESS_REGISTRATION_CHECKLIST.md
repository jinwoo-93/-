# 사업자 등록 후 필수 작업 체크리스트

> **대표자**: 박병찬
> **작성일**: 2026년 2월 26일
> **목적**: 사업자 등록 완료 후 즉시 진행해야 할 필수 작업 정리

---

## 📋 목차
1. [법적 필수 조치](#1-법적-필수-조치)
2. [기술 구현](#2-기술-구현)
3. [마케팅 실행](#3-마케팅-실행)
4. [보안 강화](#4-보안-강화)
5. [운영 준비](#5-운영-준비)

---

## 1. 법적 필수 조치

### ✅ 1-1. 통신판매업 신고
**기한**: 사업자등록 후 즉시 (법적 필수)

**절차**:
1. 관할 구청/시청 방문 또는 온라인 신청
2. 필요 서류:
   - 사업자등록증 사본
   - 대표자 신분증
   - 사업장 임대차 계약서 (사무실 있는 경우)
3. 신고 수수료: 약 5만원
4. 처리 기간: 3~5일

**완료 후 조치**:
- [ ] 통신판매업 신고번호 발급
- [ ] 웹사이트 Footer에 표기

```typescript
// src/components/common/Footer.tsx에 추가
<div>
  <p>상호명: 직구역구</p>
  <p>대표자: 박병찬</p>
  <p>사업자등록번호: [등록 후 기재]</p>
  <p>통신판매업 신고번호: [신고 후 기재]</p>
  <p>주소: [사무실 주소]</p>
  <p>대표전화: [전화번호]</p>
  <p>이메일: [이메일]</p>
</div>
```

---

### ✅ 1-2. 전자금융업 등록 (에스크로)
**기한**: 통신판매업 신고 후

**필요성**:
- 에스크로 결제 서비스 제공 시 필수
- 현재 토스페이먼츠 사용 중이므로, 토스 측에 확인 필요

**조치**:
- [ ] 토스페이먼츠 담당자에게 문의
- [ ] 필요 시 금융위원회 등록

---

### ✅ 1-3. 개인정보처리방침 실제 내용 작성
**기한**: 사업자등록 후 1주일 내

**현황**:
- `/privacy` 페이지 존재
- 실제 내용 확인 및 법률 검토 필요

**필수 포함 내용**:
1. 수집하는 개인정보 항목
2. 개인정보 수집 및 이용 목적
3. 개인정보 보유 및 이용 기간
4. 개인정보 제3자 제공 (배송, 결제)
5. 개인정보 파기 절차
6. 개인정보 보호책임자 연락처

**조치**:
- [ ] 법무법인 검토 (권장)
- [ ] 내용 작성 및 게시
- [ ] 회원가입 시 동의 절차 추가

---

## 2. 기술 구현

### ✅ 2-1. 휴대폰 인증 SMS 발송 기능 구현
**기한**: 사업자등록 후 1개월 내
**우선순위**: 높음

**현황**:
- UI 및 API 구조는 이미 구현됨 (`/verify/phone`)
- SMS 실제 발송 기능만 TODO 상태

**필요한 서비스**:

#### 한국 SMS 서비스 (한국 회원용)
**옵션 1: 알리고 (Aligo)** ⭐ 추천
- 가격: 건당 8~20원
- 가입: https://smartsms.aligo.in
- 월 최소 비용: 없음 (충전식)

**옵션 2: NHN Cloud SMS**
- 가격: 건당 9원
- 기업용 안정성

**옵션 3: 카카오 알림톡**
- 가격: 건당 8원
- 도달률 높음

#### 중국 SMS 서비스 (중국 회원용)
**옵션 1: 阿里云短信服务** ⭐ 추천
- 가격: 건당 0.045元 (약 9원)
- 가입: https://www.aliyun.com/product/sms

**옵션 2: 腾讯云短信**
- 가격: 건당 0.05元

**구현 예시** (알리고):
```typescript
// src/lib/sms.ts
import fetch from 'node-fetch';

export async function sendSMS(phone: string, message: string) {
  const response = await fetch('https://apis.aligo.in/send/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      key: process.env.ALIGO_API_KEY!,
      user_id: process.env.ALIGO_USER_ID!,
      sender: process.env.ALIGO_SENDER!, // 발신번호
      receiver: phone,
      msg: message,
      msg_type: 'SMS',
    }),
  });

  const data = await response.json();
  return data.result_code === '1'; // 성공 여부
}
```

**src/app/api/auth/send-code/route.ts 수정**:
```typescript
import { sendSMS } from '@/lib/sms';

// 기존 TODO 부분 교체
const message = `[직구역구] 인증번호: ${code} (5분간 유효)`;
await sendSMS(phone, message);
```

**환경변수 추가**:
```bash
# .env
ALIGO_API_KEY=your_api_key
ALIGO_USER_ID=your_user_id
ALIGO_SENDER=01012345678  # 발신번호 (사업자 전화)

# 중국용
ALIYUN_ACCESS_KEY_ID=your_access_key
ALIYUN_ACCESS_KEY_SECRET=your_secret
```

**체크리스트**:
- [ ] SMS 서비스 가입 (한국: 알리고)
- [ ] 발신번호 등록 (본인 휴대폰 or 사무실 전화)
- [ ] API 키 발급
- [ ] 코드 구현 및 테스트
- [ ] Vercel에 환경변수 등록
- [ ] 중국 SMS 서비스 가입 (阿里云)
- [ ] 중국 발신번호 등록
- [ ] 테스트 발송 확인

**예상 비용**:
- 초기 충전: 5만원 (약 2,500~6,000건)
- 월 예상 비용: 인증 100건 x 10원 = 1,000원

---

### ✅ 2-2. 이메일/비밀번호 로그인 추가
**기한**: 2개월 내
**우선순위**: 중간

**현황**:
- OAuth만 지원 (Google, Kakao, Naver)
- Credentials Provider 미구현

**구현 단계**:

**1단계: 회원가입 페이지 수정**
```typescript
// src/app/(auth)/register/page.tsx
<form onSubmit={handleRegister}>
  <input type="email" name="email" required />
  <input type="password" name="password" required minLength={8} />
  <input type="password" name="confirmPassword" required />
  <button type="submit">회원가입</button>
</form>
```

**2단계: 비밀번호 해싱**
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

```typescript
// src/app/api/auth/register/route.ts
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);

await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name,
    // ...
  },
});
```

**3단계: Credentials Provider 추가**
```typescript
// src/lib/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

providers: [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user || !user.password) {
        return null;
      }

      const isValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    }
  }),
  // 기존 OAuth providers...
]
```

**4단계: 로그인 페이지 수정**
```typescript
// src/app/(auth)/login/page.tsx
// 이메일/비밀번호 입력 폼 추가
// OAuth 버튼과 함께 표시
```

**체크리스트**:
- [ ] bcryptjs 설치
- [ ] 회원가입 API 구현
- [ ] Credentials Provider 추가
- [ ] 로그인 페이지 UI 수정
- [ ] 비밀번호 찾기 기능 구현
- [ ] 테스트

---

### ✅ 2-3. 아이디/비밀번호 찾기 기능
**기한**: 이메일 로그인 구현 후
**우선순위**: 중간

**현황**: 미구현

**구현 계획**:

**아이디(이메일) 찾기**:
1. 휴대폰 번호 입력
2. SMS 인증번호 발송
3. 인증 성공 시 가입된 이메일 일부 마스킹 표시
   - 예: `abc***@gmail.com`

**비밀번호 찾기**:
1. 이메일 입력
2. 이메일로 비밀번호 재설정 링크 발송
3. 링크 클릭하여 새 비밀번호 설정

**구현 코드**:
```typescript
// 비밀번호 재설정 토큰 생성
import { randomBytes } from 'crypto';

const resetToken = randomBytes(32).toString('hex');
const resetTokenExpiry = new Date(Date.now() + 3600000); // 1시간

await prisma.user.update({
  where: { email },
  data: {
    resetToken,
    resetTokenExpiry,
  },
});

// 이메일 발송
await sendEmail({
  to: email,
  subject: '[직구역구] 비밀번호 재설정',
  html: `
    <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
    <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}">
      비밀번호 재설정
    </a>
  `,
});
```

**체크리스트**:
- [ ] 아이디 찾기 페이지
- [ ] 비밀번호 찾기 페이지
- [ ] 비밀번호 재설정 페이지
- [ ] 이메일 발송 기능 (Nodemailer or Resend)
- [ ] 토큰 만료 처리

---

### ✅ 2-4. 실시간 환율 정보 추가
**기한**: 1개월 내
**우선순위**: 낮음

**현황**:
- FloatingExchangeCalculator 존재
- 환율 정보는 수동 입력 추정

**구현 방법**:

**무료 환율 API**:
- exchangerate-api.com (무료 플랜: 월 1,500 requests)
- fixer.io (무료 플랜: 월 100 requests)

```typescript
// src/lib/exchange-rate.ts
export async function getExchangeRate() {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/KRW`
  );
  const data = await response.json();
  return data.rates.CNY; // KRW -> CNY 환율
}
```

**FloatingExchangeCalculator 수정**:
```typescript
const [rate, setRate] = useState(0);

useEffect(() => {
  fetchRate();
  const interval = setInterval(fetchRate, 3600000); // 1시간마다 갱신
  return () => clearInterval(interval);
}, []);

const fetchRate = async () => {
  const newRate = await getExchangeRate();
  setRate(newRate);
};
```

**체크리스트**:
- [ ] 환율 API 선택 및 가입
- [ ] 환율 조회 함수 구현
- [ ] 계산기 컴포넌트 수정
- [ ] 환율 갱신 주기 설정 (1시간)
- [ ] 실시간 표시 "최종 업데이트: XX:XX"

---

## 3. 마케팅 실행

### ✅ 3-1. 마케팅 로드맵 실행
**기한**: 사업자등록 후 즉시
**참고 문서**: `MARKETING_ROADMAP.md`

**1개월차 즉시 실행**:
- [ ] 네이버 블로그 개설
- [ ] 샤오홍슈 계정 개설
- [ ] Google Search Console 등록
- [ ] 네이버 서치어드바이저 등록
- [ ] 네이버 카페 5곳 가입
- [ ] 커뮤니티 활동 시작

**체크리스트**:
- [ ] MARKETING_ROADMAP.md 1개월차 체크리스트 완료
- [ ] 주간 진행 상황 기록

---

## 4. 보안 강화

### ✅ 4-1. Rate Limiting 구현
**기한**: 사업자등록 후 2주 내
**우선순위**: 높음
**참고 문서**: `SECURITY_AUDIT.md`

**구현 방법**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}
```

**Upstash 가입**:
1. https://upstash.com 회원가입
2. Redis 데이터베이스 생성 (무료 플랜)
3. API 키 복사

**환경변수**:
```bash
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

**체크리스트**:
- [ ] Upstash 가입 및 Redis 생성
- [ ] 환경변수 설정
- [ ] middleware.ts 구현
- [ ] Vercel에 환경변수 등록
- [ ] 테스트 (429 에러 확인)

**예상 비용**: 무료 (Upstash 무료 플랜)

---

### ✅ 4-2. HTTPS 보안 헤더 추가
**기한**: 사업자등록 후 1주일 내
**우선순위**: 중간

```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
      ],
    },
  ];
}
```

**체크리스트**:
- [ ] next.config.js 수정
- [ ] 배포 후 헤더 확인 (브라우저 개발자 도구)

---

## 5. 운영 준비

### ✅ 5-1. 고객센터 연락처 공개
**기한**: 사업자등록 후 즉시

**준비사항**:
- [ ] 대표 전화번호 결정
  - 휴대폰: 본인 번호
  - 사무실: 070 번호 (인터넷 전화)
- [ ] 고객센터 이메일 개설
  - 예: support@jikguyeokgu.com
  - Gmail Business 또는 Naver 웍스

**웹사이트 반영**:
```typescript
// Footer.tsx
<div>
  <h4>고객센터</h4>
  <p>대표전화: 070-XXXX-XXXX</p>
  <p>이메일: support@jikguyeokgu.com</p>
  <p>운영시간: 평일 09:00 - 18:00</p>
</div>
```

**체크리스트**:
- [ ] 대표 전화번호 결정
- [ ] 고객센터 이메일 개설
- [ ] Footer 업데이트
- [ ] About 페이지 업데이트

---

### ✅ 5-2. 관리자 페이지 접근 권한 설정
**기한**: 사업자등록 후 1주일 내

**현황**:
- `/admin` 페이지 존재
- 접근 권한 확인 필요

**슈퍼 관리자 계정 생성**:
```typescript
// Prisma Studio or SQL
await prisma.user.create({
  data: {
    email: 'admin@jikguyeokgu.com',
    name: '박병찬',
    role: 'ADMIN',
    nationality: 'KR',
    // OAuth 사용 시 password null
  },
});
```

**체크리스트**:
- [ ] 관리자 계정 생성
- [ ] 로그인 테스트
- [ ] 관리자 페이지 접근 확인
- [ ] 권한별 기능 테스트

---

### ✅ 5-3. 초기 데이터 준비
**기한**: 오픈 전

**필요 데이터**:
- [ ] 테스트 상품 10개 등록
- [ ] FAQ 10개 작성
- [ ] 공지사항 작성

---

## 📊 전체 타임라인

| 시기 | 작업 | 우선순위 |
|------|------|---------|
| **D-Day (등록일)** | 통신판매업 신고, Footer 정보 업데이트 | 긴급 |
| **D+3일** | 개인정보처리방침 작성, HTTPS 헤더 | 높음 |
| **D+1주** | Rate Limiting, 고객센터 연락처 | 높음 |
| **D+2주** | SMS 서비스 가입 및 구현 | 높음 |
| **D+1개월** | 마케팅 1단계 실행, 환율 API | 중간 |
| **D+2개월** | 이메일 로그인 구현 | 중간 |
| **D+3개월** | 마케팅 2단계, 보안 강화 | 낮음 |

---

## 💰 예상 비용 (초기 3개월)

| 항목 | 금액 | 비고 |
|------|------|------|
| 통신판매업 신고 | 5만원 | 1회 |
| SMS 서비스 (한국) | 5만원 | 충전식 |
| SMS 서비스 (중국) | 5만원 | 충전식 |
| 070 전화번호 | 월 1만원 | 선택 |
| 이메일 서비스 | 무료 | Gmail/Naver |
| Rate Limiting (Upstash) | 무료 | 무료 플랜 |
| 환율 API | 무료 | 무료 플랜 |
| 마케팅 | 350만원 | MARKETING_ROADMAP 참조 |
| **합계** | **약 370만원** | 3개월 |

---

## ✅ 최종 체크리스트

### 법적 (필수)
- [ ] 사업자등록증 발급
- [ ] 통신판매업 신고
- [ ] Footer에 사업자 정보 표기
- [ ] 개인정보처리방침 작성

### 기술
- [ ] SMS 인증 실제 구현
- [ ] 이메일/비밀번호 로그인
- [ ] Rate Limiting
- [ ] HTTPS 보안 헤더

### 운영
- [ ] 고객센터 연락처
- [ ] 관리자 계정
- [ ] 초기 데이터

### 마케팅
- [ ] 블로그/SNS 개설
- [ ] 커뮤니티 활동
- [ ] SEO 등록

---

**작성**: Claude Sonnet 4.5
**최종 수정**: 2026년 2월 26일
**대상**: 박병찬 대표
