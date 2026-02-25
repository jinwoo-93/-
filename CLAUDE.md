# Claude Code 전용 컨텍스트 파일

> **새 세션 시작 시 이 파일을 먼저 읽으세요.**
> 전체 현황은 `PROJECT_STATUS.md`, 작업 이력은 `CHANGELOG.md`를 참조하세요.

---

## 🚀 빠른 현황 파악

```
프로젝트: 직구역구 (한중 크로스보더 마켓플레이스)
경로:     /Users/jw/Desktop/JIKGUYEOKGU_PROJECT/jikguyeokgu
빌드:     ✅ 정상 (npm run build → 56페이지)
배포:     ❌ 미배포 (Vercel, 마지막에 진행 예정)
현재단계: Phase 10/11/12 ✅ 완료 | Phase 9 (결제 실키) ← 다음
```

---

## 📋 작업 우선순위 (배포 제외)

> Phase 7 배포는 **가장 마지막**에 진행합니다.

```
✅ Phase 10 — 관리자 페이지 (이미 구현되어 있었음)
✅ Phase 11 — UX 개선 (HeroBanner 이미지 + 검색 자동완성)
✅ Phase 12 — 비즈니스 로직 완성 (쿠폰 관리 + 포인트 자동 적립)
1순위: Phase 9  — 결제 실키 전환 (TossPayments + 알리페이)
2순위: Phase 8  — SMS 인증 (CoolSMS + Aliyun)
마지막: Phase 7 — Vercel 배포
```

---

## ⚡ 작업 시작 전 필수 체크

1. `PROJECT_STATUS.md` 읽기 — 전체 현황
2. `CHANGELOG.md` 읽기 — 최근 작업 확인
3. 관련 파일 Read 후 작업 시작
4. 작업 완료 후 두 파일 업데이트

---

## 🔧 자주 쓰는 명령어

```bash
# 개발 서버
npm run dev

# 빌드 확인 (배포 전 필수)
npm run build

# 빌드 캐시 문제 시 클린 빌드
rm -rf .next && npm run build

# DB 스키마 변경 후
npx prisma db push
npx prisma generate

# DB 직접 조회
npx prisma studio
```

---

## 🗝️ 환경변수 빠른 참조

```
DB:       Supabase PostgreSQL (Session Pooler, port 5432)
Storage:  Cloudflare R2 (버킷: jikguyeokgu-uploads)
Auth:     Google OAuth ✅ / Kakao OAuth ✅
Payment:  TossPayments 테스트키 ⚠️
Realtime: Pusher (app_id: 2117169, cluster: ap3) ✅
Trans:    DeepL Free ✅
SMS:      ❌ 미설정
FCM:      ❌ 미설정
```

---

## 🏛️ 핵심 파일 위치

```
홈페이지:         src/app/(main)/page.tsx
헤더:             src/components/common/Header.tsx
방향팝업:         src/components/common/TradeDirectionModal.tsx
언어훅:           src/hooks/useLanguage.tsx
관리자 레이아웃:  src/app/(admin)/admin/layout.tsx
인증 설정:        src/lib/auth.ts
DB 클라이언트:    src/lib/prisma.ts
R2 업로드:        src/lib/storage.ts
환경변수:         .env.local (gitignored)
DB 스키마:        prisma/schema.prisma
Cron Jobs:        vercel.json
```

---

## 🐛 알려진 이슈

| 이슈 | 해결법 |
|------|--------|
| `useSearchParams()` 빌드 에러 | `<Suspense>`로 해당 컴포넌트 래핑 |
| `.next` 캐시 오류 | `rm -rf .next && npm run build` |
| PageNotFoundError (admin/settlements 등) | 클린 빌드로 해결됨 |

---

## 📐 코딩 컨벤션

- **언어 분기**: `language === 'ko' ? '한국어' : '中文'`
- **방향 분기**: `direction === 'CN_TO_KR' ? ... : ...`
- **다국어 데이터**: `{ nameKo: '...', nameZh: '...' }` 구조
- **CSS**: Tailwind 유틸리티 클래스, `cn()` 함수 사용
- **API 응답**: `{ success: true, data: ... }` 또는 `{ success: false, error: { message: '...' } }`
- **컴포넌트**: `'use client'` 필요 시 최상단에 선언
- **Suspense**: `useSearchParams()`, `useRouter()` 등 클라이언트 훅 사용 페이지는 Suspense 필수

---

## 🔄 작업 완료 후 할 일

작업이 끝나면 반드시:
1. `CHANGELOG.md`에 변경사항 추가 (날짜, 파일, 내용)
2. `PROJECT_STATUS.md`의 진행 단계 업데이트
3. `npm run build`로 빌드 확인

---

*이 파일은 Claude Code 전용입니다. 작업마다 최신 상태로 유지하세요.*
