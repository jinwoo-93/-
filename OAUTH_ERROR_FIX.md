# OAuth 로그인 오류 해결 가이드

## 🔴 발생한 오류

### 1. Google: "401 오류: invalid_client"
### 2. Kakao: "앱 관리자 설정 오류 (KOE101)"
### 3. Naver: 로그인 후 로그인 페이지로 리다이렉트

---

## ✅ 해결 방법

### 1️⃣ Google OAuth 수정

#### Step 1: Google Cloud Console에서 정확한 Client ID/Secret 확인

1. **Google Cloud Console 접속**:
   ```
   https://console.cloud.google.com/
   ```

2. **API 및 서비스 → 사용자 인증 정보**

3. **OAuth 2.0 클라이언트 ID 클릭** (jikguyeokgu 프로젝트)

4. **클라이언트 ID 복사** (형식: `xxxxx.apps.googleusercontent.com`)

5. **클라이언트 보안 비밀번호 복사**

#### Step 2: Vercel Production 환경변수 업데이트

```bash
# 터미널에서 실행

# 1. 기존 Google Client ID 삭제
vercel env rm GOOGLE_CLIENT_ID production

# 2. 새로운 Google Client ID 추가
vercel env add GOOGLE_CLIENT_ID production
# → Google Cloud Console에서 복사한 Client ID 입력

# 3. 기존 Google Client Secret 삭제
vercel env rm GOOGLE_CLIENT_SECRET production

# 4. 새로운 Google Client Secret 추가
vercel env add GOOGLE_CLIENT_SECRET production
# → Google Cloud Console에서 복사한 Client Secret 입력
```

#### Step 3: 재배포

```bash
# 환경변수 변경 후 재배포 트리거
git commit --allow-empty -m "fix: update Google OAuth credentials"
git push origin main
```

---

### 2️⃣ Kakao OAuth 수정

#### KOE101 오류 해결 방법

**원인:** 앱이 "개발 중" 상태이며, 현재 계정이 앱 관리자/테스터로 등록되지 않음

#### 해결 방법 A: 테스터 추가 (권장)

1. **Kakao Developers 콘솔 접속**:
   ```
   https://developers.kakao.com/
   ```

2. **앱 선택 → 좌측 메뉴 "앱 설정" → "일반"**

3. **"관리자" 섹션 찾기**

4. **"멤버 관리" 클릭**

5. **"팀원 추가" 또는 "테스터 추가"**:
   - 테스트에 사용할 카카오 계정 추가

6. **저장**

#### 해결 방법 B: 비즈니스 앱 등록 (프로덕션용)

1. **좌측 메뉴 "비즈니스" 클릭**

2. **"비즈니스 앱으로 전환" 또는 "검수 요청"**

3. **필요한 정보 입력 후 제출**

**임시 테스트:**
- 카카오 개발자 콘솔에 등록된 본인 계정으로만 테스트 가능

---

### 3️⃣ Naver OAuth + 전체 환경변수 수정

#### 문제: 로그인 후 다시 로그인 페이지로 리다이렉트

**원인:**
1. `NEXTAUTH_URL` 환경변수가 잘못 설정됨
2. `NEXTAUTH_SECRET` 환경변수 문제

#### Step 1: NEXTAUTH_URL 확인 및 수정

```bash
# 1. Vercel 대시보드 접속
# https://vercel.com/dashboard
# → 프로젝트 선택 → Settings → Environment Variables

# 2. NEXTAUTH_URL 확인
# 값이 다음 중 하나여야 함:
# - https://jikguyeokgu.com (커스텀 도메인)
# - https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app

# 3. 잘못된 경우 수정
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# 입력: https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
```

#### Step 2: NEXTAUTH_SECRET 확인

```bash
# 1. NEXTAUTH_SECRET 존재 확인
vercel env ls | grep NEXTAUTH_SECRET

# 2. 없으면 생성
openssl rand -base64 32
# → 출력된 값을 복사

vercel env add NEXTAUTH_SECRET production
# → 복사한 값 입력
```

#### Step 3: Naver Client ID/Secret 재확인

Naver Developers 콘솔에서:
1. Application → 내 애플리케이션
2. Client ID와 Client Secret 확인
3. Vercel 환경변수와 일치하는지 확인

```bash
# 필요시 업데이트
vercel env rm NAVER_CLIENT_ID production
vercel env add NAVER_CLIENT_ID production

vercel env rm NAVER_CLIENT_SECRET production
vercel env add NAVER_CLIENT_SECRET production
```

---

## 🔍 환경변수 최종 체크리스트

Vercel Production 환경에 다음 환경변수가 모두 올바르게 설정되어 있어야 합니다:

```bash
# NextAuth
NEXTAUTH_URL=https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app
NEXTAUTH_SECRET=[32자 이상의 랜덤 문자열]

# Google OAuth
GOOGLE_CLIENT_ID=[Google Cloud Console의 Client ID]
GOOGLE_CLIENT_SECRET=[Google Cloud Console의 Client Secret]

# Kakao OAuth
KAKAO_CLIENT_ID=[Kakao Developers의 REST API 키]
KAKAO_CLIENT_SECRET=[Kakao Developers의 Client Secret]

# Naver OAuth
NAVER_CLIENT_ID=[Naver Developers의 Client ID]
NAVER_CLIENT_SECRET=[Naver Developers의 Client Secret]
```

---

## 🧪 재배포 및 테스트

### 1. 재배포

```bash
# 환경변수 변경 후 반드시 재배포
git commit --allow-empty -m "fix: update OAuth environment variables"
git push origin main

# 배포 완료 대기 (약 2-3분)
vercel ls
```

### 2. 테스트

```bash
# 시크릿 모드로 접속
# https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app/login

# F12 (개발자 도구) 열기

# 각 로그인 테스트:
# 1. Google 로그인
# 2. Kakao 로그인 (등록된 테스터 계정으로)
# 3. Naver 로그인
```

---

## 🐛 디버깅

### Vercel 로그 확인

```bash
# 실시간 로그 확인
vercel logs --follow
```

### 브라우저 콘솔 확인

1. F12 → Console 탭
2. 에러 메시지 확인
3. Network 탭에서 실패한 요청 확인

---

## 📞 문제 지속 시

1. **Vercel 대시보드에서 환경변수 직접 확인**:
   - https://vercel.com/dashboard
   - Settings → Environment Variables

2. **각 OAuth 프로바이더 콘솔 재확인**:
   - Google Cloud Console
   - Kakao Developers
   - Naver Developers

3. **로그 수집**:
   - Vercel 로그
   - 브라우저 Console 에러
   - Network 탭 요청/응답

---

## ⚡ 빠른 해결 스크립트

```bash
#!/bin/bash
# OAuth 환경변수 일괄 업데이트 스크립트

echo "🔧 OAuth 환경변수 업데이트 시작"

echo "📝 Google OAuth"
echo "Google Client ID를 입력하세요:"
read GOOGLE_ID
vercel env rm GOOGLE_CLIENT_ID production -y 2>/dev/null
echo "$GOOGLE_ID" | vercel env add GOOGLE_CLIENT_ID production

echo "Google Client Secret을 입력하세요:"
read -s GOOGLE_SECRET
vercel env rm GOOGLE_CLIENT_SECRET production -y 2>/dev/null
echo "$GOOGLE_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

echo ""
echo "📝 NEXTAUTH_URL 설정"
vercel env rm NEXTAUTH_URL production -y 2>/dev/null
echo "https://jikguyeokgu-jeut22jp4-bcs-projects-48c9ab3e.vercel.app" | vercel env add NEXTAUTH_URL production

echo ""
echo "📝 NEXTAUTH_SECRET 생성"
SECRET=$(openssl rand -base64 32)
vercel env rm NEXTAUTH_SECRET production -y 2>/dev/null
echo "$SECRET" | vercel env add NEXTAUTH_SECRET production

echo ""
echo "✅ 완료! 이제 재배포하세요:"
echo "git commit --allow-empty -m 'fix: update OAuth env vars'"
echo "git push origin main"
```

저장: `fix-oauth.sh`
실행: `chmod +x fix-oauth.sh && ./fix-oauth.sh`
