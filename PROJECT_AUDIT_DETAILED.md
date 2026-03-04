# 직구역구 프로젝트 전체 점검 보고서

생성일: 2026-03-04
점검자: Claude Sonnet 4.5

---

## 🔴 1. 로그인 시스템 점검 결과 (최우선)

### 1.1 회원 로그인 시스템 (`/src/app/(auth)/login/page.tsx`)

#### ✅ 정상 작동 기능
- 소셜 로그인 (카카오, 네이버, 구글)
- 전화번호 인증 로그인 UI
- CSRF 토큰 처리
- 로그인 후 리다이렉트

#### ⚠️ 문제점 발견

**문제 1: 전화번호 인증 로그인이 실제로 작동하지 않음**
- 위치: Line 19-30 (`handleSendCode`)
- 문제: `setTimeout`으로 가짜 인증번호 발송 시뮬레이션만 하고 있음
- 현재 코드:
```typescript
const handleSendCode = async () => {
  setIsLoading(true);
  setTimeout(() => {
    setIsCodeSent(true);
    setIsLoading(false);
    toast({ title: '인증번호가 발송되었습니다' });
  }, 1000);
};
```
- 원인: 실제 SMS API (`/api/auth/sms/verify`) 호출이 없음
- 영향: 사용자가 전화번호 로그인을 시도할 수 없음

**문제 2: Credentials Provider 인증이 제대로 설정되지 않음**
- 위치: `/src/lib/auth.config.ts` Line 25-35
- 문제: `authorize` 함수가 항상 `null` 반환
```typescript
Credentials({
  name: 'Phone',
  credentials: {
    phone: { label: 'Phone', type: 'tel' },
    code: { label: 'Verification Code', type: 'text' },
  },
  async authorize() {
    // 실제 인증 로직은 auth.ts에서 처리
    return null; // ❌ 항상 실패
  },
}),
```
- 영향: 전화번호 로그인이 항상 실패함

**문제 3: 소셜 로그인의 복잡한 수동 Form 제출**
- 위치: Line 56-87
- 문제: NextAuth의 `signIn` 함수를 사용하지 않고 수동으로 form을 생성하여 제출
- 현재 방식: CSRF 토큰 수동 가져오기 → Form 수동 생성 → Submit
- 권장 방식: `signIn(provider, { callbackUrl: '/' })` 한 줄로 처리 가능

---

### 1.2 관리자 로그인 시스템 (`/src/app/admin-login/page.tsx`)

#### ✅ 정상 작동 기능
- 소셜 로그인 (구글, 네이버, 카카오) - 간단한 방식 사용 ✅
- 이메일/비밀번호 로그인 UI
- 관리자 권한 확인 로직
- 로딩 상태 관리

#### ⚠️ 문제점 발견

**문제 1: 이메일/비밀번호 로그인이 작동하지 않음**
- 위치: Line 18-53 (`handleSubmit`)
- 문제: Credentials Provider가 설정되지 않음
- 현재 코드:
```typescript
const result = await signIn('credentials', {
  email,
  password,
  redirect: false,
});
```
- 원인: `auth.config.ts`의 Credentials Provider는 `phone`/`code`만 받고, `email`/`password`는 처리하지 않음
- 영향: 이메일로 관리자 로그인 불가능

**문제 2: 구글 OAuth 환경변수 누락**
- 이전 대화에서 확인된 문제
- 증상: `error=Configuration` 발생
- 필요 환경변수: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- 상태: Vercel 환경변수에 설정 필요 (사용자 조치 필요)

---

### 1.3 인증 설정 (`/src/lib/auth.config.ts`)

#### ✅ 정상 작동
- JWT 전략 사용
- OAuth 프로바이더 설정 (Google, Kakao, Naver)
- 관리자 페이지 권한 체크 (Line 129-143)
- URL 디코딩 처리 (Line 79)

#### ⚠️ 문제점 발견

**문제 1: Credentials Provider 미완성**
- 위치: Line 25-35
- 실제 인증 로직 없음 (항상 `null` 반환)

**문제 2: 이메일/비밀번호 Provider 없음**
- 관리자 로그인에서 사용하려는 email/password 인증 Provider가 없음
- 필요: 별도의 Credentials Provider 추가

---

## 🟡 2. API 엔드포인트 점검

### 2.1 미사용 가능성이 높은 API

확인 필요한 API 목록 (프론트엔드 호출 확인 필요):

1. `/api/ads/weekly-close` - 광고 주간 마감 (스케줄러용?)
2. `/api/payments/alipay/*` - Alipay 결제 (중국 결제 사용 중?)
3. `/api/chat/translate` - 채팅 번역 (채팅 기능 사용 중?)
4. `/api/chat/typing` - 타이핑 상태 (실시간 기능 구현?)

### 2.2 문서화되지 않은 API

다음 API들은 중요하지만 문서화되지 않음:
- `/api/admin/*` - 전체 관리자 API (154개 중 30+ 관리자 API)
- `/api/seller/*` - 판매자 API
- `/api/shipping/*` - 배송업체 API

---

## 🟢 3. 버튼/링크 작동 여부 점검

### 3.1 점검 대상 파일 (45개)

#### 높은 우선순위 페이지 점검

**메인 페이지 (`/src/app/(main)/page.tsx`)**
- 점검 필요: 모든 배너 링크, 카테고리 링크, 상품 카드 링크

**마이페이지 (`/src/app/(main)/mypage/page.tsx`)**
- 점검 필요: 사이드바 메뉴 링크들

**장바구니 (`/src/app/(main)/cart/page.tsx`)**
- 점검 필요: 결제하기 버튼, 상품 삭제 버튼

---

## 📊 4. 프로젝트 구조 개요

### 파일 통계
- TypeScript 파일: 389개
- API 엔드포인트: 154개
- 페이지: 85개
- 컴포넌트: 71개

### Route Groups
- `(admin)` - 관리자 페이지 (15개 페이지)
- `(auth)` - 인증 페이지 (2개)
- `(main)` - 일반 사용자 페이지 (60개)
- `(seller)` - 판매자 페이지 (5개)
- `(shipping)` - 배송업체 페이지 (3개)

---

## ✅ 5. 즉시 수정 필요 항목 (우선순위 순)

### 🔴 긴급 (현재 로그인 불가)

1. **전화번호 로그인 수정**
   - 파일: `/src/app/(auth)/login/page.tsx`
   - 수정 내용:
     - SMS API 연동 또는 UI에서 제거
     - Credentials Provider 실제 구현

2. **관리자 이메일 로그인 수정**
   - 파일: `/src/lib/auth.config.ts`
   - 수정 내용:
     - Email/Password용 Credentials Provider 추가
     - 또는 관리자도 소셜 로그인만 사용하도록 변경

3. **Google OAuth 환경변수 설정**
   - Vercel 대시보드에서 설정 필요

### 🟡 중요 (사용성 개선)

4. **회원 로그인 페이지 소셜 로그인 간소화**
   - 현재: 수동 Form 제출 (복잡)
   - 개선: `signIn(provider)` 사용 (간단)

5. **사용되지 않는 기능 정리**
   - 전화번호 로그인 기능 (미구현 상태)
   - 비밀번호 찾기 페이지 (`/auth/forgot-password`)

### 🟢 개선 (점진적)

6. **API 문서화**
7. **컴포넌트 정리**
8. **타입 안정성 개선**

---

## 📝 점검 계속 진행 중...

다음 단계:
- [ ] 모든 페이지의 버튼/링크 실제 작동 테스트
- [ ] 미사용 컴포넌트 식별
- [ ] import 정리
- [ ] 코드 중복 제거

