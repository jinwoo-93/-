# 관리자 로그인 시스템 문제 해결 보고서

## 📋 문제 상황

사용자가 `/admin/login`에서 소셜 로그인(Google/네이버/카카오) 시도 시, 로그인 후 일반 로그인 페이지(`/login?callbackUrl=%2Fadmin%2Flogin`)로 리다이렉트되는 문제 발생.

**재현 경로:**
1. `https://jikguyeokgu.vercel.app/admin/login` 접속
2. Google/네이버/카카오 로그인 클릭
3. OAuth 인증 완료
4. ❌ `/login?callbackUrl=%2Fadmin%2Flogin`으로 리다이렉트 (예상: `/admin`)

---

## 🔍 근본 원인 분석

### 1. **URL 디코딩 누락**
```typescript
// 문제: auth.config.ts의 redirect 콜백
const callbackUrl = urlObj.searchParams.get('callbackUrl');
// callbackUrl = "%2Fadmin%2Flogin" (인코딩된 상태)

if (callbackUrl.startsWith('/')) {  // ❌ false! (% 문자로 시작)
  return `${baseUrl}${callbackUrl}`;
}
```

**원인:** OAuth 제공자가 전달하는 `callbackUrl`이 URL 인코딩된 상태(`%2F` = `/`)인데, 디코딩하지 않고 바로 비교하여 조건문을 통과하지 못함.

### 2. **소셜 로그인 redirect 옵션 불일치**
```typescript
// 문제: admin/login/page.tsx
const result = await signIn(provider, {
  redirect: false,  // ❌ 수동 처리 시도
  callbackUrl: '/admin',
});

// 이후 수동으로 권한 체크 → 복잡도 증가 + 버그 유발
```

**원인:** `redirect: false`로 설정하여 NextAuth의 자동 리다이렉트를 비활성화하고 수동으로 처리하려 했으나, 이로 인해 `callbackUrl`이 제대로 전달되지 않음.

### 3. **관리자 페이지 접근 시 잘못된 리다이렉트**
```typescript
// 문제: auth.config.ts - authorized 미들웨어
if (isAdminPage && !isLoggedIn) {
  const loginUrl = new URL('/login', nextUrl);  // ❌ 일반 로그인 페이지
  loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
  return Response.redirect(loginUrl);
}
```

**원인:** 관리자 페이지 접근 시 관리자 전용 로그인 페이지(`/admin/login`)가 아닌 일반 로그인 페이지(`/login`)로 리다이렉트.

---

## ✅ 해결 방법

### 1. **URL 디코딩 추가 (auth.config.ts)**
```typescript
async redirect({ url, baseUrl }) {
  const urlObj = new URL(url);
  const callbackUrl = urlObj.searchParams.get('callbackUrl');

  if (callbackUrl) {
    try {
      // ✅ URL 디코딩 추가
      const decodedCallback = decodeURIComponent(callbackUrl);

      if (decodedCallback.startsWith('/')) {
        return `${baseUrl}${decodedCallback}`;
      }

      const callbackUrlObj = new URL(decodedCallback);
      if (callbackUrlObj.origin === baseUrl) {
        return decodedCallback;
      }
    } catch {
      // URL 파싱 실패 시 무시
    }
  }

  return baseUrl;
}
```

### 2. **소셜 로그인 자동 리다이렉트 활성화**
```typescript
// ✅ admin/login/page.tsx
const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
  setError('');
  setSocialLoading(provider);

  try {
    // redirect: true로 변경 → NextAuth가 자동 처리
    await signIn(provider, {
      callbackUrl: '/admin',
      redirect: true,  // ✅ 자동 리다이렉트
    });
  } catch (error) {
    console.error('Social login error:', error);
    setError('로그인 중 오류가 발생했습니다.');
    setSocialLoading(null);
  }
};
```

### 3. **관리자 페이지 미들웨어 수정**
```typescript
// ✅ auth.config.ts - authorized 콜백
if (isAdminPage) {
  // 관리자 로그인 페이지는 제외
  if (nextUrl.pathname === '/admin/login') {
    return true;
  }

  if (!isLoggedIn) {
    // ✅ 관리자 전용 로그인 페이지로 리다이렉트
    const loginUrl = new URL('/admin/login', nextUrl);
    return Response.redirect(loginUrl);
  }

  const userType = (auth as any)?.user?.userType;
  if (userType !== 'ADMIN') {
    return Response.redirect(new URL('/', nextUrl));
  }
}
```

### 4. **관리자 권한 체크 API 추가**
```typescript
// ✅ /api/auth/check-admin/route.ts (신규 생성)
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ isAdmin: false });
  }

  const isAdmin = session.user.userType === 'ADMIN';

  return NextResponse.json({
    success: true,
    isAdmin,
    user: session.user,
  });
}
```

### 5. **AdminAuthGuard 컴포넌트 생성**
```typescript
// ✅ /components/admin/AdminAuthGuard.tsx (신규 생성)
export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      if (session?.user?.userType !== 'ADMIN') {
        alert('관리자 권한이 필요합니다.');
        router.push('/');
      }
    }
  }, [status, session, router]);

  return <>{children}</>;
}
```

---

## 🛡️ 재발 방지 체크리스트

### 개발 시 준수 사항

1. **✅ OAuth callbackUrl은 항상 디코딩**
   - `decodeURIComponent()`로 URL 인코딩 해제 후 비교

2. **✅ 소셜 로그인은 `redirect: true` 사용**
   - NextAuth의 자동 리다이렉트 활용
   - 수동 처리는 특별한 경우만 사용

3. **✅ 관리자 페이지는 전용 로그인 페이지로 리다이렉트**
   - `/admin/*` → `/admin/login`
   - 일반 페이지 → `/login`

4. **✅ 미들웨어에서 로그인 페이지 자체는 예외 처리**
   - `/admin/login` 접근 시 미들웨어 통과 허용

5. **✅ 관리자 권한 체크 API 분리**
   - 재사용 가능한 엔드포인트 제공
   - 클라이언트/서버 양쪽에서 활용

### 테스트 시나리오

#### 1. 관리자 소셜 로그인
```
1. /admin/login 접속
2. Google/네이버/카카오 버튼 클릭
3. OAuth 인증 완료
4. ✅ /admin 대시보드로 자동 이동
```

#### 2. 권한 없는 사용자 접근
```
1. 일반 사용자로 소셜 로그인
2. /admin 접속 시도
3. ✅ "관리자 권한이 필요합니다" 알림
4. ✅ 메인 페이지(/)로 리다이렉트
```

#### 3. 미로그인 상태 관리자 페이지 접근
```
1. 로그아웃 상태
2. /admin/settlements 접속 시도
3. ✅ /admin/login으로 리다이렉트
```

#### 4. 이메일 로그인
```
1. /admin/login 접속
2. 이메일/비밀번호 입력
3. "이메일로 로그인" 버튼 클릭
4. ✅ 관리자 권한 확인 후 /admin으로 이동
```

---

## 📊 변경 파일 요약

| 파일 | 변경 내용 | 목적 |
|------|----------|------|
| `src/lib/auth.config.ts` | redirect 콜백 URL 디코딩 추가 | callbackUrl 정상 처리 |
| `src/lib/auth.config.ts` | 관리자 페이지 미들웨어 수정 | /admin/login으로 리다이렉트 |
| `src/app/(admin)/admin/login/page.tsx` | 소셜 로그인 redirect: true | 자동 리다이렉트 활성화 |
| `src/app/api/auth/check-admin/route.ts` | **신규 생성** | 관리자 권한 체크 API |
| `src/components/admin/AdminAuthGuard.tsx` | **신규 생성** | 클라이언트 권한 보호 |

---

## 🎯 결과

✅ **소셜 로그인 후 정상적으로 `/admin` 대시보드로 이동**
✅ **관리자 권한이 없는 경우 메인 페이지로 리다이렉트**
✅ **URL 인코딩 문제 완전 해결**
✅ **재사용 가능한 권한 체크 시스템 구축**
✅ **재발 방지 체크리스트 및 문서화 완료**

---

## 📝 향후 개선 사항

1. **다중 관리자 역할 지원**
   - `SUPER_ADMIN`, `ADMIN`, `MODERATOR` 등 세분화

2. **관리자 초대 시스템**
   - 이메일로 관리자 초대장 발송
   - 임시 비밀번호 또는 토큰 기반 등록

3. **관리자 활동 로그**
   - 로그인/로그아웃 기록
   - 주요 액션 감사 추적

4. **2단계 인증 (2FA)**
   - TOTP 기반 OTP
   - 관리자 계정 보안 강화

---

**작성일:** 2026-03-03
**작성자:** Claude Sonnet 4.5
**커밋 ID:** 369e61a
