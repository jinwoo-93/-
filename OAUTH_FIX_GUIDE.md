# OAuth 로그인 오류 진단 및 해결 가이드

## 📋 현황 분석

### 배포 환경
- **프로덕션 URL**: `https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app`
- **최신 배포**: 8분 전 (Ready 상태)
- **플랫폼**: Vercel

### OAuth 프로바이더 설정 상태
환경변수가 Vercel에 정상적으로 등록되어 있음:
- ✅ GOOGLE_CLIENT_ID (Production)
- ✅ GOOGLE_CLIENT_SECRET (Production)
- ✅ KAKAO_CLIENT_ID (Production)
- ✅ KAKAO_CLIENT_SECRET (Production)
- ✅ NAVER_CLIENT_ID (Production)
- ✅ NAVER_CLIENT_SECRET (Production)
- ✅ NEXTAUTH_URL (Production)
- ✅ NEXTAUTH_SECRET (Production)

---

## 🔍 문제점 진단

### 1. **NEXTAUTH_URL 설정 확인 필요**
NextAuth.js는 OAuth 콜백 URL을 생성할 때 `NEXTAUTH_URL` 환경변수를 사용합니다.

**확인 사항:**
```bash
# Vercel 프로덕션 환경변수 확인
vercel env pull .env.production
```

**예상 문제:**
- NEXTAUTH_URL이 `http://localhost:3000`으로 설정되어 있을 가능성
- 프로덕션 도메인이 아닌 다른 URL로 설정되어 있을 가능성

**올바른 설정:**
```bash
# 프로덕션 환경
NEXTAUTH_URL=https://jikguyeokgu.com
# 또는 Vercel 배포 URL
NEXTAUTH_URL=https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

---

### 2. **OAuth 프로바이더 콜백 URL 등록 확인**

각 OAuth 프로바이더 콘솔에서 콜백 URL이 올바르게 등록되어 있는지 확인해야 합니다.

#### Google OAuth 콜백 URL
**Google Cloud Console → API 및 서비스 → 사용자 인증 정보**

등록되어야 할 URL:
```
https://jikguyeokgu.com/api/auth/callback/google
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/google
```

승인된 JavaScript 원본:
```
https://jikguyeokgu.com
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

#### Kakao OAuth 콜백 URL
**Kakao Developers → 내 애플리케이션 → 앱 설정 → 카카오 로그인**

Redirect URI 등록:
```
https://jikguyeokgu.com/api/auth/callback/kakao
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/kakao
```

웹 플랫폼 사이트 도메인:
```
https://jikguyeokgu.com
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

#### Naver OAuth 콜백 URL
**Naver Developers → 내 애플리케이션 → API 설정 → 서비스 URL/Callback URL**

Callback URL:
```
https://jikguyeokgu.com/api/auth/callback/naver
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/naver
```

---

### 3. **로그인 페이지 구현 확인**

현재 코드 분석 결과:
- ✅ 소셜 로그인 버튼 구현 (`handleSocialLogin` 함수)
- ✅ CSRF 토큰 처리
- ✅ 콜백 URL 설정 (`window.location.origin`)

**잠재적 문제:**
`login/page.tsx:58-83`에서 수동으로 form을 생성하여 제출하는 방식을 사용 중입니다.

```typescript
// 현재 방식
const form = document.createElement('form');
form.method = 'POST';
form.action = `/api/auth/signin/${provider}`;
// ...
form.submit();
```

**권장 방식:**
```typescript
// NextAuth.js 공식 방식
await signIn(provider, {
  callbackUrl: window.location.origin
});
```

---

### 4. **NextAuth.js 설정 검증**

현재 설정 (`auth.config.ts`):
- ✅ `trustHost: true` 설정됨 (Vercel 배포 환경에 필요)
- ✅ `debug: process.env.NODE_ENV === 'development'` 설정됨
- ✅ 에러 페이지 리다이렉트 설정 (`error: '/login'`)

---

## 🛠️ 해결 방안

### 우선순위 1: NEXTAUTH_URL 확인 및 수정

```bash
# 1. 현재 프로덕션 환경변수 확인
vercel env pull .env.production

# 2. NEXTAUTH_URL 확인
cat .env.production | grep NEXTAUTH_URL

# 3. 잘못된 경우 수정
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# 입력: https://jikguyeokgu.com (또는 실제 도메인)

# 4. 재배포
git commit --allow-empty -m "chore: trigger redeploy for NEXTAUTH_URL fix"
git push origin main
```

### 우선순위 2: OAuth 프로바이더 콜백 URL 등록

**체크리스트:**

- [ ] Google Cloud Console에서 콜백 URL 등록
  - `https://jikguyeokgu.com/api/auth/callback/google`
  - `https://[vercel-url]/api/auth/callback/google`

- [ ] Kakao Developers에서 Redirect URI 등록
  - `https://jikguyeokgu.com/api/auth/callback/kakao`
  - `https://[vercel-url]/api/auth/callback/kakao`

- [ ] Naver Developers에서 Callback URL 등록
  - `https://jikguyeokgu.com/api/auth/callback/naver`
  - `https://[vercel-url]/api/auth/callback/naver`

### 우선순위 3: 로그인 페이지 코드 개선

`src/app/(auth)/login/page.tsx` 파일 수정:

```typescript
const handleSocialLogin = async (provider: string) => {
  try {
    // NextAuth.js 공식 방식 사용
    await signIn(provider, {
      callbackUrl: window.location.origin,
      redirect: true // 자동 리다이렉트
    });
  } catch (error) {
    console.error('Social login error:', error);
    toast({
      title: language === 'ko'
        ? '로그인 중 오류가 발생했습니다'
        : '登录过程中发生错误',
      variant: 'destructive'
    });
  }
};
```

### 우선순위 4: 디버깅 환경 구축

프로덕션 환경에서 디버그 로그 확인:

```bash
# Vercel 로그 확인
vercel logs --follow
```

또는 임시로 디버그 모드 활성화:

```bash
# 환경변수 추가
vercel env add NODE_ENV production
# 입력: development (임시)

# 재배포 후 로그 확인
```

---

## 🧪 테스트 방법

### 1. 로컬 환경 테스트

```bash
# 1. 프로덕션 환경변수 다운로드
vercel env pull .env.local

# 2. NEXTAUTH_URL을 로컬호스트로 변경
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local

# 3. 로컬 서버 실행
npm run dev

# 4. 각 OAuth 로그인 테스트
# - http://localhost:3000/login
```

### 2. 프로덕션 환경 테스트

```bash
# 1. 배포 완료 확인
vercel ls

# 2. 브라우저에서 테스트
# - https://jikguyeokgu.com/login
# - 개발자 도구 → Console/Network 탭 확인

# 3. 예상 에러 메시지
# - "Callback URL mismatch" → OAuth 콜백 URL 미등록
# - "redirect_uri_mismatch" → NEXTAUTH_URL 설정 오류
# - "Invalid client" → Client ID/Secret 오류
```

---

## 📊 에러 메시지별 해결 방법

### 1. "Configuration" 또는 "OAuthCallback" 에러
**원인:** NEXTAUTH_URL 미설정 또는 잘못된 URL
**해결:** 우선순위 1 참조

### 2. "redirect_uri_mismatch"
**원인:** OAuth 프로바이더에 콜백 URL 미등록
**해결:** 우선순위 2 참조

### 3. "invalid_client" 또는 "unauthorized_client"
**원인:** Client ID/Secret 오류
**해결:** 환경변수 재확인
```bash
vercel env ls
vercel env pull .env.production
```

### 4. "access_denied"
**원인:** 사용자가 권한 승인 거부
**해결:** 정상 동작 (사용자가 취소한 경우)

---

## 🔐 보안 체크리스트

- [ ] NEXTAUTH_SECRET이 충분히 복잡한 문자열인지 확인
- [ ] OAuth Client Secret이 노출되지 않았는지 확인 (.env 파일 git에 커밋 안 됨)
- [ ] 프로덕션 환경변수가 Development와 분리되어 있는지 확인
- [ ] trustHost: true 설정 확인 (Vercel 필수)

---

## 📝 체크 완료 후 작업

1. [ ] NEXTAUTH_URL 프로덕션 환경변수 확인 및 수정
2. [ ] Google OAuth 콘솔에서 콜백 URL 등록
3. [ ] Kakao OAuth 콘솔에서 Redirect URI 등록
4. [ ] Naver OAuth 콘솔에서 Callback URL 등록
5. [ ] 로그인 페이지 코드 개선 (선택)
6. [ ] 프로덕션 배포 및 테스트
7. [ ] 각 프로바이더별 로그인 테스트 (Google, Kakao, Naver)

---

## 🚀 빠른 해결 스크립트

```bash
#!/bin/bash
# OAuth 문제 해결 스크립트

echo "1. 프로덕션 환경변수 다운로드..."
vercel env pull .env.production

echo "2. NEXTAUTH_URL 확인..."
grep NEXTAUTH_URL .env.production

echo "3. 도메인을 입력하세요 (예: https://jikguyeokgu.com):"
read DOMAIN

echo "4. NEXTAUTH_URL 업데이트..."
vercel env rm NEXTAUTH_URL production -y
echo "$DOMAIN" | vercel env add NEXTAUTH_URL production

echo "5. 재배포 트리거..."
git commit --allow-empty -m "fix: update NEXTAUTH_URL for OAuth"
git push origin main

echo "✅ 완료! Vercel 배포 대시보드에서 상태를 확인하세요."
echo "🔗 https://vercel.com/dashboard"
```

---

## 📞 추가 지원

문제가 지속되는 경우:
1. Vercel 로그 확인: `vercel logs --follow`
2. 브라우저 개발자 도구 Network 탭 확인
3. NextAuth.js 공식 문서 참조: https://next-auth.js.org/errors
