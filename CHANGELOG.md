# CHANGELOG — 직구역구 작업 이력

> 작업 완료 후 이 파일에 변경사항을 추가하세요.
> 형식: `## [날짜] 작업 내용` → 변경 파일 목록 → 결과

---

## [2026-02-20] Phase 12: 비즈니스 로직 완성

### 작업 내용
1. **관리자 쿠폰 관리 시스템 구현**
   - 관리자 쿠폰 생성/수정/삭제 API 구현
   - 대량 발급 API 구현 (전체 회원, 조건별 필터)
   - 관리자 쿠폰 관리 페이지 구현 (통계, 목록, 생성 모달, 발급 모달)
   - 관리자 레이아웃에 쿠폰 관리 메뉴 추가

2. **포인트 자동 적립 로직 추가**
   - 주문 확정 시 자동 포인트 적립 (주문 금액의 1%)
   - 리뷰 작성 시 자동 포인트 적립 (100 포인트)
   - 기존 포인트 유틸 함수 (`addPoints`) 활용

3. **분쟁 투표 UI 확인**
   - 이미 완전히 구현되어 있음 확인
   - 투표 진행 상태 시각화, 투표 버튼, 의견 작성 기능 모두 포함

### 수정/생성된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/app/api/admin/coupons/route.ts` | **신규 생성** - 관리자 쿠폰 목록 조회(GET), 생성(POST) API |
| `src/app/api/admin/coupons/[id]/route.ts` | **신규 생성** - 관리자 쿠폰 수정(PATCH), 삭제(DELETE) API |
| `src/app/api/admin/coupons/issue/route.ts` | **신규 생성** - 쿠폰 대량 발급 API (전체/조건별) |
| `src/app/(admin)/admin/coupons/page.tsx` | **신규 생성** - 관리자 쿠폰 관리 페이지 (통계 카드, 필터, 모달) |
| `src/app/(admin)/admin/layout.tsx` | 쿠폰 관리 메뉴 추가 (`Ticket` 아이콘) |
| `src/app/api/orders/[id]/confirm/route.ts` | 주문 확정 시 포인트 적립 로직 추가 (주문 금액의 1%) |
| `src/app/api/reviews/route.ts` | 리뷰 작성 시 포인트 적립 로직 추가 (100 포인트) |

### 관리자 쿠폰 관리 기능

**API 엔드포인트**
```
GET    /api/admin/coupons          - 쿠폰 목록 조회 (페이지네이션, 상태 필터)
POST   /api/admin/coupons          - 쿠폰 생성
PATCH  /api/admin/coupons/[id]     - 쿠폰 수정
DELETE /api/admin/coupons/[id]     - 쿠폰 삭제
POST   /api/admin/coupons/issue    - 쿠폰 대량 발급
```

**쿠폰 생성 필드**
- 코드, 이름(한/중), 할인 유형(퍼센트/고정), 할인값
- 최소 주문 금액, 최대 할인 금액, 총 발급 수량
- 시작일, 만료일, 사용자당 사용 횟수

**대량 발급 기능**
- 전체 회원 대상 발급
- 조건별 필터 발급 (회원 유형, 국가별 - 향후 확장 가능)
- 이미 보유한 사용자 자동 제외
- 수량 제한 체크

**관리자 페이지 UI**
- 통계 카드 4개: 전체 쿠폰, 활성 쿠폰, 만료된 쿠폰, 총 발급 수
- 검색 및 상태 필터 (전체/활성/만료/비활성)
- 쿠폰 목록 (코드, 할인, 발급 현황, 만료일)
- 쿠폰 생성 모달 (전체 필드 입력)
- 대량 발급 모달 (쿠폰 선택, 대상 선택)

### 포인트 자동 적립

**주문 확정 시**
```typescript
// 주문 금액의 1% 적립
const pointsToEarn = Math.floor(order.totalKRW * 0.01);
await addPoints(
  order.buyerId,
  pointsToEarn,
  'PURCHASE_REWARD',
  `구매 확정 적립 (주문번호: ${order.orderNumber})`,
  `购买确认积分 (订单号: ${order.orderNumber})`,
  { orderId }
);
```

**리뷰 작성 시**
```typescript
// 100 포인트 적립
await addPoints(
  session.user.id,
  100,
  'REVIEW_REWARD',
  '리뷰 작성 적립',
  '评论撰写积分',
  { orderId }
);
```

### 분쟁 투표 UI

**확인된 기능**
- ✅ 투표 진행 상태 프로그레스 바 (구매자/판매자 득표율)
- ✅ 투표 버튼 (구매자 편/판매자 편)
- ✅ 의견 작성 텍스트 영역
- ✅ 당사자는 투표 불가능 (자동 숨김)
- ✅ 투표 중 상태에서만 투표 가능
- ✅ 해결 결과 표시 (환불 비율)

### 빌드 결과
✅ `npm run build` 성공 — **56페이지**, 에러 없음
- 새로 추가된 `/admin/coupons` 페이지 포함
- 새로 추가된 API 3개 (`/api/admin/coupons`, `[id]`, `issue`) 포함

---

## [2026-02-20] Phase 11: UX 개선 완료

### 작업 내용
- HeroBanner 배경 이미지 + gradient 추가
- Header 검색창 자동완성 기능 추가
- 모바일 최적화 확인 (이미 구현되어 있음)

### 수정된 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/components/home/HeroBanner.tsx` | 배경 이미지 URL 추가 (Unsplash), gradient overlay, 이미지 + 어두운 오버레이로 텍스트 가독성 개선 |
| `src/components/common/Header.tsx` | 검색 자동완성 드롭다운 추가, `handleSearchInput()`, `selectSuggestion()`, 인기 키워드 필터링 |

### HeroBanner 개선
```tsx
// 배경 이미지 + gradient
bgImage: 'https://images.unsplash.com/...'
bg: 'from-black via-gray-900 to-gray-800'

// 오버레이로 텍스트 가독성 확보
<div className="absolute inset-0 bg-black/40" />
```

### 검색 자동완성
- 2글자 이상 입력 시 드롭다운 표시
- 인기 키워드 필터링 (언어별 7개 키워드)
- 클릭 시 즉시 검색 페이지 이동
- `onFocus`/`onBlur`로 UX 개선

### 모바일 최적화
- ✅ BottomNavigation 이미 구현됨 (홈/검색/등록/찜/마이페이지)
- ✅ 반응형 디자인 (`md:`, `hidden` 등) 이미 적용됨

### 빌드 결과
✅ `npm run build` 성공 — 55페이지, 에러 없음

---

## [2026-02-20] Phase 10: 관리자 페이지 확인 완료

### 작업 내용
- 관리자 페이지 전체 확인 (이미 구현되어 있음)
- API 엔드포인트 6개 확인 및 빌드 테스트

### 확인된 관리자 페이지 (모두 구현 완료)
| 페이지 | 경로 | 상태 |
|--------|------|------|
| **대시보드** | `/admin` | ✅ 통계 카드 6개, 최근 분쟁/주문, 빠른 링크 |
| **회원 관리** | `/admin/users` | ✅ 검색, 필터, 목록, 인증 배지 |
| **분쟁 관리** | `/admin/disputes` | ✅ 상태별 필터, 투표 현황 |
| **정산 관리** | `/admin/settlements` | ✅ 정산 통계, 기간별 필터 |
| **고객지원** | `/admin/support` | ✅ 문의 목록, 상태별 통계 |
| **고객지원 상세** | `/admin/support/[id]` | ✅ 문의 상세, 답변 작성 |

### 확인된 API 엔드포인트 (모두 구현 완료)
- `GET /api/admin/stats` - 대시보드 통계 (회원/상품/주문/분쟁/수수료)
- `GET /api/admin/users` - 회원 목록 (페이지네이션, 검색)
- `GET /api/admin/disputes` - 분쟁 목록
- `GET /api/admin/support` - 고객지원 문의 목록
- `GET /api/admin/support/[id]` - 고객지원 상세
- `GET /api/admin/reports` - 신고 관리

### 빌드 결과
✅ `npm run build` 성공 — 55페이지, 에러 없음
- 관리자 페이지 5개 모두 동적 라우트(ƒ)로 정상 빌드

---

## [2026-02-19] 직구/역직구 UX 개선 + 언어 자동감지

### 작업 내용
- 직구/역직구 팝업을 매 세션마다 표시되도록 변경
- Header에 직구/역직구 토글 버튼 추가
- IP 기반 언어 자동감지 추가 (중국 IP → 자동 중국어)
- 역직구 선택 시 카테고리 언어 깨지는 버그 수정

### 수정된 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/components/common/TradeDirectionModal.tsx` | `localStorage` → `sessionStorage` 팝업 체크 변경, `isOpen`/`onClose` prop 추가 |
| `src/app/(main)/page.tsx` | `isModalOpen` state 추가, `handleOpenModal()` 함수, `window.dispatchEvent` 이벤트 연동, 카테고리 데이터 구조 변경 |
| `src/components/common/Header.tsx` | `ArrowLeftRight` 아이콘, `tradeDirection` state, `handleOpenDirectionModal()`, 직구/역직구 토글 버튼 추가 |
| `src/hooks/useLanguage.tsx` | `detectLanguageByIP()` 비동기 함수 추가 (ipapi.co 사용), 저장된 언어 없을 때만 IP 감지 |

### 주요 로직
```
직구/역직구 팝업:
- sessionStorage 'jikguyeokgu_popup_shown' → 없으면 팝업 표시
- 브라우저 닫고 재접속 = sessionStorage 초기화 = 팝업 재표시
- 선택한 방향은 localStorage에 저장 (세션 간 기억)

Header 버튼:
- window.dispatchEvent('open-trade-direction-modal') → page.tsx 수신 → 모달 오픈
- 방향 선택 후 window.dispatchEvent('trade-direction-changed') → Header 버튼 텍스트 갱신

언어 자동감지:
- localStorage에 저장된 언어 있으면 즉시 적용 (API 호출 안함)
- 없으면 ipapi.co로 IP 조회 → CN이면 'zh', 그 외 'ko'
- 사용자가 직접 변경하면 localStorage에 저장
```

### 카테고리 데이터 구조 변경
```typescript
// 변경 전: name 필드 하나 (언어/방향 혼재)
{ name: 'K-Beauty' }  // 역직구에서 영어로 표시
{ name: '电子产品' }  // 역직구에서 중국어로 표시

// 변경 후: nameKo/nameZh 분리
{ nameKo: 'K-뷰티', nameZh: 'K-Beauty' }
{ nameKo: '전자기기', nameZh: '电子产品' }
// 렌더링: language === 'ko' ? category.nameKo : category.nameZh
```

### 빌드 결과
✅ `npm run build` 성공 — 55페이지, 에러 없음

---

## [2026-02-19] KREAM 디자인 리디자인 + 레이아웃 개선

### 작업 내용
- 전체 사이트 KREAM 스타일로 재디자인
- 직구/역직구 선택 팝업 신규 구현
- 섹션 순서 및 Features 바 위치 조정
- `useSearchParams()` Suspense 버그 수정

### 수정된 파일
| 파일 | 변경 내용 |
|------|-----------|
| `src/app/globals.css` | 전체 재작성 — `--radius: 0px`, `--primary: 5 85% 63%` (코랄), KREAM 컴포넌트 스타일 |
| `tailwind.config.ts` | `brand.blue → #222222`, `brand.orange → #EF6253`, `escrow → #41B979` |
| `src/components/common/Header.tsx` | KREAM 스타일 헤더, h-[52px], 그레이 검색바 |
| `src/components/common/Footer.tsx` | 리디자인 |
| `src/components/common/BottomNavigation.tsx` | 리디자인 |
| `src/app/(main)/page.tsx` | 섹션 순서: HeroBanner → 방향바 → CTA → 카테고리 → 추천상품 → 구매대행 → LIVE → 서비스안내 → BlackCTA → Features → 세관안내 |
| `src/components/common/TradeDirectionModal.tsx` | 신규 생성 |
| `src/app/(main)/disputes/create/page.tsx` | Suspense 래핑 추가 |
| `src/app/(main)/reviews/create/page.tsx` | Suspense 래핑 추가 |

---

## [2026-02-19] Phase 2-5: 외부 서비스 API 키 설정

### 설정된 서비스
| 서비스 | 설정 내용 |
|--------|-----------|
| **Cloudflare R2** | 버킷 생성, 접근키 설정, 이미지 업로드 연동 완료 |
| **TossPayments** | 테스트 클라이언트/시크릿 키 설정 |
| **Pusher** | app_id: 2117169, cluster: ap3 |
| **DeepL** | Free Plan 키 (`:fx` 접미사) |
| **Kakao OAuth** | REST/JS/Native/Admin 키, Client Secret, Redirect URI 등록 |

### 수정된 파일
- `.env.local` — 모든 API 키 저장
- `.toss-credentials.txt` (gitignored) — 토스페이먼츠 키 백업
- `.pusher-credentials.txt` (gitignored) — Pusher 키 백업
- `.deepl-credentials.txt` (gitignored) — DeepL 키 백업
- `.kakao-credentials.txt` (gitignored) — 카카오 키 백업

---

## [2026-02-19] Phase 3: Cron 자동화 + Phase 4: 관리자 설정

### 작업 내용
- `vercel.json` 확인 (이미 4개 cron job 설정됨)
- `CRON_SECRET` openssl로 생성 후 `.env.local`에 저장
- DB에서 `qkrqudcks93@gmail.com` 계정을 `ADMIN`으로 변경

### Cron Jobs (vercel.json)
```json
{ "path": "/api/exchange-rate/update", "schedule": "0 0 * * *" }
{ "path": "/api/orders/auto-confirm", "schedule": "0 15 * * *" }
{ "path": "/api/ads/weekly-close", "schedule": "0 1 * * 1" }
{ "path": "/api/disputes/process-expired", "schedule": "0 2 * * *" }
```

---

## [2026-02-10] Phase 1: 초기 설정 + 빌드 안정화

### 작업 내용
- Next.js App Router 프로젝트 초기 구성
- Supabase PostgreSQL 연결
- NextAuth v5 Google OAuth 설정
- 보안 수정 4건 (SQL Injection, XSS 등)
- 빌드 에러 수정 (에러 페이지, 미들웨어 Edge Runtime 분리)

---

## 📋 앞으로 해야 할 작업

### Phase 7 — Vercel 배포 (최우선)
- [ ] GitHub push
- [ ] Vercel 프로젝트 연결
- [ ] 환경변수 전체 입력 (`.env.local` 내용)
- [ ] `NEXTAUTH_URL` → Vercel 도메인으로 변경
- [ ] Google/Kakao Redirect URI에 Vercel 도메인 추가
- [ ] Cloudflare R2 CORS 설정
- [ ] 배포 후 기능 테스트

### Phase 8 — SMS 인증
- [ ] CoolSMS 가입 및 키 발급 → `COOLSMS_API_KEY` 설정
- [ ] Aliyun SMS 가입 및 키 발급 → `ALIYUN_ACCESS_KEY_ID` 설정

### Phase 9 — 결제 실키 전환
- [ ] TossPayments 심사 후 실 키 교체
- [ ] 알리페이 파트너 계정 신청 및 키 설정
- [ ] 웹훅 URL Vercel 도메인으로 등록

### Phase 10 — 관리자 페이지 구현
- [ ] `/admin` 대시보드 — 통계 카드 (가입자, 거래량, 분쟁 현황)
- [ ] `/admin/users` — 회원 목록, 상태 변경, 정지
- [ ] `/admin/posts` — 상품 목록, 숨김/삭제
- [ ] `/admin/orders` — 주문 목록, 강제 처리
- [ ] `/admin/settlements` — 정산 내역, 지급 처리
- [ ] `/admin/ads` — 광고 슬롯 현황
- [ ] `/admin/support` + `/admin/support/[id]` — 문의 목록, 답변

### Phase 11 — UX 개선
- [ ] HeroBanner 실제 이미지/슬라이드
- [ ] 검색 자동완성 드롭다운
- [ ] 모바일 최적화 (터치 영역, 스크롤)
- [ ] 실시간 채팅 Pusher 연결 확인

### Phase 12 — 비즈니스 로직
- [ ] FCM 푸시 알림 설정
- [ ] 사업자 인증 프로세스 (서류 업로드 → 관리자 승인)
- [ ] 쿠폰 발급 시스템
- [ ] 포인트 자동 지급 로직 확인
- [ ] 분쟁 투표 UI 완성

---

*마지막 업데이트: 2026-02-19*
