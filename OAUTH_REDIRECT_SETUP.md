# 🔐 OAuth Redirect URI 설정 가이드

**프로덕션 배포 완료 후 필수 작업**
**예상 소요 시간**: 10-15분

---

## ✅ 환경 변수 설정 완료 확인

다음 환경 변수들이 Vercel에 이미 설정되었습니다:

### Google OAuth
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`

### Kakao OAuth
- ✅ `KAKAO_CLIENT_ID`
- ✅ `KAKAO_CLIENT_SECRET`
- ✅ `KAKAO_BUSINESS_SECRET`
- ✅ `NEXT_PUBLIC_KAKAO_JS_KEY`
- ✅ `KAKAO_NATIVE_APP_KEY`
- ✅ `KAKAO_ADMIN_KEY`

**총 8개 OAuth 환경 변수 설정 완료 ✅**

---

## 📋 OAuth 로그인이 작동하려면

OAuth 환경 변수만 설정하는 것으로는 부족합니다. 각 플랫폼(Google, Kakao)에서 **프로덕션 도메인의 Redirect URI**를 승인해야 합니다.

현재 상태:
- ✅ 로컬 개발 환경: `http://localhost:3000` (이미 등록됨)
- ⏳ 프로덕션 환경: `https://jikguyeokgu.vercel.app` (**등록 필요**)

---

## 🌐 1. Google OAuth Redirect URI 설정

### 접속 URL
https://console.cloud.google.com

### 단계별 설정

1. **Google Cloud Console 접속**
   - 위 URL로 이동
   - Google 계정으로 로그인

2. **프로젝트 선택**
   - 상단의 프로젝트 선택기 클릭
   - 직구역구 프로젝트 선택

3. **Credentials 페이지 이동**
   - 왼쪽 메뉴: **APIs & Services** → **Credentials**

4. **OAuth 2.0 Client 찾기**
   - "OAuth 2.0 Client IDs" 섹션에서
   - Client ID가 `1041454411341-hd4h6d1uh2pao8pkvakfqe76k7tb4nr3`인 항목 클릭

5. **Authorized redirect URIs 추가**
   - "Authorized redirect URIs" 섹션으로 스크롤
   - **+ ADD URI** 버튼 클릭
   - 다음 URI 입력:
     ```
     https://jikguyeokgu.vercel.app/api/auth/callback/google
     ```

6. **저장**
   - 하단의 **Save** 버튼 클릭
   - "OAuth client updated" 메시지 확인

### ✅ 확인 사항

설정 후 다음 URIs가 모두 등록되어 있어야 합니다:
- `http://localhost:3000/api/auth/callback/google` (로컬)
- `https://jikguyeokgu.vercel.app/api/auth/callback/google` (프로덕션)

---

## 🟡 2. Kakao OAuth Redirect URI 설정

### 접속 URL
https://developers.kakao.com

### 단계별 설정

1. **Kakao Developers 접속**
   - 위 URL로 이동
   - Kakao 계정으로 로그인

2. **애플리케이션 선택**
   - "내 애플리케이션" 클릭
   - 직구역구 앱 선택 (App Key: `23e78f5fef194f38f33bd4c86d4e179a`)

3. **카카오 로그인 설정 페이지 이동**
   - 왼쪽 메뉴: **제품 설정** → **카카오 로그인**

4. **Redirect URI 추가**
   - "Redirect URI" 섹션으로 스크롤
   - **Redirect URI 등록** 버튼 클릭
   - 다음 URI 입력:
     ```
     https://jikguyeokgu.vercel.app/api/auth/callback/kakao
     ```

5. **저장**
   - **저장** 버튼 클릭
   - 추가된 URI 확인

### ✅ 확인 사항

설정 후 다음 URIs가 모두 등록되어 있어야 합니다:
- `http://localhost:3000/api/auth/callback/kakao` (로컬)
- `https://jikguyeokgu.vercel.app/api/auth/callback/kakao` (프로덕션)

---

## 🧪 3. OAuth 로그인 테스트

### 테스트 순서

1. **프로덕션 사이트 접속**
   ```
   https://jikguyeokgu.vercel.app
   ```

2. **로그인 페이지 이동**
   - 상단의 "로그인" 버튼 클릭
   - 또는 직접 접속: https://jikguyeokgu.vercel.app/login

3. **Google 로그인 테스트**
   - "Google로 로그인" 버튼 클릭
   - Google 계정 선택
   - 권한 동의
   - 로그인 성공 확인

4. **Kakao 로그인 테스트**
   - (로그아웃 후) "Kakao로 로그인" 버튼 클릭
   - Kakao 계정으로 로그인
   - 권한 동의
   - 로그인 성공 확인

### 예상되는 오류 (Redirect URI 미설정 시)

#### Google 오류
```
Error 400: redirect_uri_mismatch
The redirect URI in the request, https://jikguyeokgu.vercel.app/api/auth/callback/google, does not match the ones authorized for the OAuth client.
```

**해결**: Google Cloud Console에서 Redirect URI 추가

#### Kakao 오류
```
KOE006: invalid redirect_uri
등록되지 않은 redirect_uri입니다.
```

**해결**: Kakao Developers에서 Redirect URI 추가

---

## 📊 설정 완료 체크리스트

### Google OAuth
- [ ] Google Cloud Console 접속
- [ ] 프로젝트 선택
- [ ] OAuth 2.0 Client 찾기
- [ ] Redirect URI 추가: `https://jikguyeokgu.vercel.app/api/auth/callback/google`
- [ ] 저장 완료
- [ ] Google 로그인 테스트 성공

### Kakao OAuth
- [ ] Kakao Developers 접속
- [ ] 애플리케이션 선택
- [ ] 카카오 로그인 설정 이동
- [ ] Redirect URI 추가: `https://jikguyeokgu.vercel.app/api/auth/callback/kakao`
- [ ] 저장 완료
- [ ] Kakao 로그인 테스트 성공

---

## 🔍 문제 해결

### 문제 1: "redirect_uri_mismatch" 오류

**원인**: Redirect URI가 등록되지 않았거나 오타가 있음

**해결**:
1. URL 정확히 확인 (끝에 슬래시 없음)
2. HTTPS 확인 (HTTP 아님)
3. 대소문자 정확히 일치
4. 설정 후 5-10분 대기 (캐시 업데이트)

### 문제 2: OAuth 환경 변수 누락

**증상**: 로그인 버튼이 보이지 않음

**확인**:
```bash
vercel env ls | grep -E "(GOOGLE|KAKAO)"
```

**해결**: 환경 변수 재배포
```bash
vercel --prod
```

### 문제 3: 로그인 후 세션 유지 안 됨

**원인**: `NEXTAUTH_SECRET` 또는 `NEXTAUTH_URL` 문제

**확인**:
```bash
vercel env ls | grep NEXTAUTH
```

**해결**: 환경 변수 확인 및 재배포

---

## 💡 참고 정보

### NextAuth Callback URL 구조

```
https://{domain}/api/auth/callback/{provider}
```

예시:
- Google: `https://jikguyeokgu.vercel.app/api/auth/callback/google`
- Kakao: `https://jikguyeokgu.vercel.app/api/auth/callback/kakao`

### 보안 고려사항

1. **HTTPS 필수**: OAuth는 HTTPS에서만 작동 (Vercel 자동 적용 ✅)
2. **정확한 URI**: 슬래시, 대소문자 모두 정확해야 함
3. **도메인 소유권**: 등록한 도메인을 실제로 소유하고 있어야 함

### 로컬 개발 vs 프로덕션

| 환경 | URL | 용도 |
|------|-----|------|
| 로컬 | `http://localhost:3000/api/auth/callback/...` | 개발 및 테스트 |
| 프로덕션 | `https://jikguyeokgu.vercel.app/api/auth/callback/...` | 실제 서비스 |

**두 환경 모두 등록해야 합니다!**

---

## 🎯 다음 단계

OAuth Redirect URI 설정 완료 후:

1. **로그인 테스트**
   - Google 로그인
   - Kakao 로그인
   - 세션 유지 확인

2. **사용자 프로필 확인**
   - 로그인 후 프로필 정보
   - 이메일 동기화
   - 프로필 이미지

3. **기능 테스트**
   - 상품 등록 (로그인 필요)
   - 장바구니
   - 주문하기

---

## 📝 요약

### 설정해야 할 Redirect URIs

**Google Cloud Console**:
```
https://jikguyeokgu.vercel.app/api/auth/callback/google
```

**Kakao Developers**:
```
https://jikguyeokgu.vercel.app/api/auth/callback/kakao
```

### 예상 소요 시간

- Google 설정: 5분
- Kakao 설정: 5분
- 테스트: 5분
- **총 15분**

---

## ✅ 완료 확인

모든 설정이 완료되면:

1. ✅ Google Cloud Console에 URI 등록
2. ✅ Kakao Developers에 URI 등록
3. ✅ Google 로그인 테스트 성공
4. ✅ Kakao 로그인 테스트 성공

**축하합니다! OAuth 로그인이 완전히 설정되었습니다!** 🎉

---

**작성일**: 2026년 2월 26일
**프로덕션 URL**: https://jikguyeokgu.vercel.app
**상태**: OAuth 환경 변수 설정 완료, Redirect URI 설정 대기 중

---

## 🆘 도움이 필요하신가요?

문제가 발생하면:
1. 이 문서의 "문제 해결" 섹션 참고
2. Google/Kakao 개발자 문서 확인
3. NextAuth 공식 문서: https://next-auth.js.org/
