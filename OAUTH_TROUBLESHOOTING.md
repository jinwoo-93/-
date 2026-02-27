# OAuth 로그인 오류 - 즉시 조치 사항

## 🚨 현재 상황
- **증상**: 카카오, 네이버, 구글 로그인 시 오류 발생
- **영향**: 사용자가 소셜 로그인을 통해 회원가입/로그인 불가
- **환경**: Vercel 프로덕션 배포

## 🔍 가장 가능성 높은 원인

### 1. OAuth 콜백 URL 미등록 (90% 확률)

각 OAuth 프로바이더(Google, Kakao, Naver) 개발자 콘솔에서 콜백 URL을 등록하지 않았거나, 잘못된 URL로 등록한 경우입니다.

**NextAuth.js가 사용하는 콜백 URL 형식:**
```
https://[도메인]/api/auth/callback/[프로바이더]
```

**현재 프로덕션 URL:**
```
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

**등록해야 할 콜백 URL:**
```
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/google
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/kakao
https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/naver
```

만약 커스텀 도메인이 있다면:
```
https://jikguyeokgu.com/api/auth/callback/google
https://jikguyeokgu.com/api/auth/callback/kakao
https://jikguyeokgu.com/api/auth/callback/naver
```

---

## ✅ 즉시 조치 방법

### Step 1: Google OAuth 콜백 URL 등록

1. **Google Cloud Console 접속**
   - https://console.cloud.google.com/

2. **프로젝트 선택** → API 및 서비스 → 사용자 인증 정보

3. **OAuth 2.0 클라이언트 ID 선택** (현재 사용 중인 클라이언트)

4. **승인된 리디렉션 URI에 추가**
   ```
   https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/google
   ```

5. **승인된 JavaScript 원본에 추가**
   ```
   https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
   ```

6. **저장** 클릭

---

### Step 2: Kakao OAuth 콜백 URL 등록

1. **Kakao Developers 접속**
   - https://developers.kakao.com/

2. **내 애플리케이션 선택**

3. **좌측 메뉴: 앱 설정 → 플랫폼**
   - Web 플랫폼 추가 (없는 경우)
   - 사이트 도메인 등록:
     ```
     https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
     ```

4. **좌측 메뉴: 제품 설정 → 카카오 로그인**
   - 활성화 설정: ON
   - Redirect URI 등록:
     ```
     https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/kakao
     ```

5. **저장** 클릭

---

### Step 3: Naver OAuth 콜백 URL 등록

1. **Naver Developers 접속**
   - https://developers.naver.com/

2. **Application → 내 애플리케이션**

3. **API 설정 탭**
   - **서비스 URL** 등록:
     ```
     https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
     ```

   - **Callback URL** 등록:
     ```
     https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/api/auth/callback/naver
     ```

4. **수정** 클릭하여 저장

---

### Step 4: NEXTAUTH_URL 환경변수 확인

현재 Vercel에 NEXTAUTH_URL이 설정되어 있지만, 값이 올바른지 확인이 필요합니다.

**확인 방법:**
```bash
# Vercel 대시보드 접속
# https://vercel.com/dashboard
# → 프로젝트 선택 → Settings → Environment Variables

# 또는 CLI로 확인
vercel env ls
```

**NEXTAUTH_URL 값이 다음 중 하나여야 합니다:**
- `https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app`
- `https://jikguyeokgu.com` (커스텀 도메인이 있는 경우)

**만약 `http://localhost:3000`으로 되어 있다면 수정 필요:**
```bash
# 삭제
vercel env rm NEXTAUTH_URL production

# 재등록
vercel env add NEXTAUTH_URL production
# 입력: https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

---

## 🧪 테스트 방법

모든 설정 완료 후:

1. **브라우저 시크릿/프라이빗 모드로 접속**
   ```
   https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/login
   ```

2. **개발자 도구 열기** (F12)
   - Console 탭 확인
   - Network 탭 확인

3. **각 소셜 로그인 버튼 클릭 테스트**
   - Google 로그인 → 정상 리다이렉트 되는지 확인
   - Kakao 로그인 → 정상 리다이렉트 되는지 확인
   - Naver 로그인 → 정상 리다이렉트 되는지 확인

4. **성공 시 기대 동작:**
   - OAuth 프로바이더 로그인 페이지로 이동
   - 권한 승인 후 사이트로 리다이렉트
   - 로그인 완료

5. **실패 시 에러 메시지:**
   - `redirect_uri_mismatch` → 콜백 URL 미등록 (Step 1-3 재확인)
   - `invalid_client` → Client ID/Secret 오류 (환경변수 확인)
   - `Configuration` 에러 → NEXTAUTH_URL 설정 오류 (Step 4 확인)

---

## 📋 체크리스트

작업 완료 후 체크:

- [ ] Google Cloud Console에서 콜백 URL 등록 완료
- [ ] Kakao Developers에서 Redirect URI 등록 완료
- [ ] Naver Developers에서 Callback URL 등록 완료
- [ ] Vercel NEXTAUTH_URL 환경변수 확인 완료
- [ ] 시크릿 모드에서 Google 로그인 테스트 성공
- [ ] 시크릿 모드에서 Kakao 로그인 테스트 성공
- [ ] 시크릿 모드에서 Naver 로그인 테스트 성공

---

## 🔧 추가 디버깅 (문제가 계속되는 경우)

### 1. Vercel 로그 확인
```bash
vercel logs --follow
```

### 2. 브라우저 개발자 도구에서 에러 확인
- Console 탭: JavaScript 에러 확인
- Network 탭: `/api/auth/signin/[provider]` 요청 확인
- Response에서 에러 메시지 확인

### 3. NextAuth.js 디버그 모드 활성화
`src/lib/auth.config.ts` 파일에서:
```typescript
export const authConfig: NextAuthConfig = {
  debug: true, // 프로덕션에서도 임시로 true로 설정
  // ...
}
```

재배포 후 Vercel 로그에서 상세 에러 확인

---

## 🎯 예상 소요 시간

- OAuth 콜백 URL 등록: **10-15분**
- NEXTAUTH_URL 확인/수정: **5분**
- 테스트: **5분**
- **총 소요 시간: 20-25분**

---

## 💡 참고 자료

- [NextAuth.js OAuth 설정 가이드](https://next-auth.js.org/configuration/providers/oauth)
- [Google OAuth 설정 가이드](https://support.google.com/cloud/answer/6158849)
- [Kakao OAuth 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [Naver OAuth 가이드](https://developers.naver.com/docs/login/api/api.md)

---

## ⚠️ 중요 사항

1. **OAuth 콜백 URL은 정확히 일치해야 합니다**
   - 끝에 `/`가 있으면 안 됩니다
   - `http`와 `https`를 구분합니다
   - 포트 번호까지 일치해야 합니다

2. **여러 도메인 사용 시 모두 등록**
   - Vercel 자동 배포 URL
   - 커스텀 도메인 (있는 경우)
   - localhost:3000 (개발용)

3. **변경 사항 반영 시간**
   - Google: 즉시 반영
   - Kakao: 즉시 반영
   - Naver: 즉시 반영
   - Vercel 환경변수 변경 시: 재배포 필요

---

작업 완료 후 이 문서를 업데이트하여 해결 과정을 기록해주세요.
