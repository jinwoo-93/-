# 직구역구 (JIKGUYEOKGU) — 프로젝트 현황판

> **Claude Code가 이 파일을 먼저 읽으면 전체 프로젝트 상태를 즉시 파악할 수 있습니다.**
> 작업 완료 후 반드시 이 파일과 `CHANGELOG.md`를 업데이트하세요.

---

## 🏗️ 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **서비스명** | 직구역구 (JIKGUYEOKGU) |
| **설명** | 한국↔중국 양방향 크로스보더 C2C 마켓플레이스 |
| **프레임워크** | Next.js 14.2 (App Router) + TypeScript |
| **DB** | Supabase PostgreSQL + Prisma ORM |
| **배포** | Vercel (미배포 — 로컬 개발 중) |
| **도메인** | 미설정 (Vercel 배포 후 할당 예정) |
| **로컬 URL** | http://localhost:3000 |
| **빌드 상태** | ✅ 정상 (56페이지, 에러 없음) |

---

## 🗂️ 기술 스택

```
Frontend:   Next.js 14, React 18, TypeScript, Tailwind CSS (KREAM 디자인 시스템)
Backend:    Next.js API Routes (70+개)
DB/ORM:     Supabase PostgreSQL + Prisma (35개 모델)
Auth:       NextAuth v5 (Google OAuth ✅, Kakao OAuth ✅)
Storage:    Cloudflare R2 ✅
Payment:    TossPayments (테스트키) / 알리페이 (미설정)
Realtime:   Pusher Channels ✅ (app: jikguyeokgu, cluster: ap3)
Translation: DeepL API Free ✅
SMS:        CoolSMS (미설정) / Aliyun (미설정)
Push:       Firebase FCM (미설정)
State:      Zustand
Icons:      Lucide React
```

---

## 🔑 외부 서비스 설정 현황

| 서비스 | 상태 | 비고 |
|--------|------|------|
| **Supabase DB** | ✅ 연결됨 | Session Pooler, port 5432 |
| **Cloudflare R2** | ✅ 설정됨 | 버킷: jikguyeokgu-uploads |
| **Google OAuth** | ✅ 설정됨 | 로컬 Redirect URI 등록됨 |
| **Kakao OAuth** | ✅ 설정됨 | Redirect URI 등록됨 |
| **TossPayments** | ⚠️ 테스트키 | 실서비스 전환 필요 |
| **Pusher** | ✅ 설정됨 | app_id: 2117169, cluster: ap3 |
| **DeepL** | ✅ 설정됨 | Free Plan (:fx 접미사) |
| **CRON_SECRET** | ✅ 생성됨 | Vercel Cron 보안 키 |
| **CoolSMS** | ❌ 미설정 | 한국 SMS 인증 |
| **Aliyun SMS** | ❌ 미설정 | 중국 SMS 인증 |
| **Firebase FCM** | ❌ 미설정 | 푸시 알림 |
| **알리페이** | ❌ 미설정 | 중국 결제 |

---

## 👤 관리자 계정

| 항목 | 내용 |
|------|------|
| **이메일** | qkrqudcks93@gmail.com |
| **이름** | 박병찬 |
| **역할** | ADMIN (DB에 직접 설정됨) |
| **로그인** | Google OAuth 또는 이메일 |

---

## 🗃️ 데이터베이스 (Prisma 모델 35개)

**사용자**: User, NotificationSettings, Account, Session, VerificationToken
**상품/카테고리**: Post, Category
**주문/결제**: Order, Payment
**분쟁**: Dispute, DisputeVote
**리뷰**: Review
**배송**: ShippingCompany, ShippingReview
**광고**: AdSlot, AdBid, ShippingAdBid
**채팅**: ChatRoom, Message
**환율**: ExchangeRate
**알림**: Notification
**고객지원**: SupportTicket, SupportResponse
**검색**: SearchHistory
**Q&A**: ProductQA
**포인트**: UserPoint, PointHistory
**쿠폰**: Coupon, UserCoupon
**라이브**: LiveStream, LiveProduct
**구매대행**: PurchaseRequest, PurchaseOffer
**기타**: Wishlist, Follow, Report

---

## ⚙️ Vercel Cron Jobs (vercel.json 설정됨)

| 경로 | 스케줄 | 용도 |
|------|--------|------|
| `/api/exchange-rate/update` | 매일 00:00 | 환율 자동 갱신 |
| `/api/orders/auto-confirm` | 매일 15:00 | 주문 자동 구매확정 |
| `/api/ads/weekly-close` | 매주 월 01:00 | 주간 광고 낙찰 처리 |
| `/api/disputes/process-expired` | 매일 02:00 | 만료 분쟁 자동 처리 |

---

## 🎨 디자인 시스템 (KREAM 스타일)

- **컬러**: 흰/검정 모노크롬 + 코랄 `#EF6253` (Primary)
- **Radius**: `0px` (각진 스타일)
- **폰트**: Pretendard
- **Primary CSS var**: `--primary: 5 85% 63%`
- **Tailwind 커스텀**: `brand-orange`, `brand-blue`, `escrow`

---

## 🌐 다국어/방향 시스템

- **언어**: 한국어(`ko`) / 중국어(`zh`)
- **자동감지**: IP 기반 (ipapi.co) → 중국 IP이면 `zh` 자동 설정
- **저장**: `localStorage`의 `jikguyeokgu_language` 키
- **거래방향**: 직구(`CN_TO_KR`) / 역직구(`KR_TO_CN`)
- **팝업**: 매 세션 시작 시 표시 (sessionStorage 기반)
- **방향 저장**: `localStorage`의 `jikguyeokgu_trade_direction` 키

---

## 📁 핵심 파일 경로

```
src/
├── app/
│   ├── (main)/page.tsx          ← 홈페이지 (TradeDirectionModal 포함)
│   ├── (admin)/admin/layout.tsx ← 관리자 레이아웃
│   └── api/                     ← API 라우트 70+개
├── components/
│   ├── common/
│   │   ├── Header.tsx           ← 헤더 (직구/역직구 토글 버튼 포함)
│   │   ├── TradeDirectionModal.tsx ← 직구/역직구 선택 팝업
│   │   └── LanguageSelector.tsx
│   └── home/HeroBanner.tsx
├── hooks/
│   └── useLanguage.tsx          ← IP 기반 언어 자동감지 포함
├── lib/
│   ├── auth.ts                  ← NextAuth 설정
│   ├── prisma.ts                ← Prisma 클라이언트
│   └── storage.ts               ← Cloudflare R2 업로드
├── stores/
│   ├── cartStore.ts
│   └── uiStore.ts
└── i18n/
    ├── ko.json                  ← 한국어 번역
    └── zh.json                  ← 중국어 번역
prisma/schema.prisma             ← DB 스키마 (35개 모델)
vercel.json                      ← Cron Jobs 4개
.env.local                       ← 환경변수 (gitignored)
```

---

## 🚧 현재 진행 단계

```
Phase 1:  프로젝트 초기 설정         ✅ 완료
Phase 2:  외부 서비스 API 키 설정    ✅ 완료 (SMS/FCM 제외)
Phase 3:  Cron 자동화 설정           ✅ 완료
Phase 4:  관리자 계정 설정           ✅ 완료
Phase 5:  OAuth 설정 (Google+Kakao)  ✅ 완료
Phase 6:  빌드 점검 + 디자인 개선    ✅ 완료
Phase 10: 관리자 페이지 구현         ✅ 완료 (이미 구현되어 있었음)
Phase 11: UX 개선                    ✅ 완료 (HeroBanner 이미지 + 검색 자동완성)
Phase 12: 비즈니스 로직 완성         ✅ 완료 (쿠폰 관리 + 포인트 자동 적립)
Phase 9:  결제 실키 전환             ⏳ 미완료 ← 다음 1순위
Phase 8:  SMS 인증 설정              ⏳ 미완료 ← 2순위
Phase 7:  Vercel 배포                ⏳ 미완료 ← 마지막
```

> ⚠️ **배포(Phase 7)는 모든 기능 완성 후 마지막에 진행합니다.**

---

## ⏭️ 다음 작업 (Phase 9 — 결제 실키 전환)

1. TossPayments 실 키 발급 및 교체
2. 알리페이 파트너 계정 신청 및 키 설정
3. 웹훅 URL Vercel 도메인으로 등록 (배포 후)

---

## 📝 알려진 이슈 / 주의사항

- `useSearchParams()` 사용 페이지는 반드시 `<Suspense>` 래핑 필요 (빌드 에러 방지)
- `.next` 캐시 오래되면 `rm -rf .next` 후 클린 빌드 필요
- TossPayments는 현재 **테스트 키** — 실서비스 전 교체 필수
- DeepL은 **Free Plan** (월 500,000자 제한)
- Supabase Storage(빈값)는 미사용 — Cloudflare R2로 대체
- 관리자 페이지 대부분 구현 완료 (대시보드, 회원, 분쟁, 정산, 고객지원, 쿠폰)

---

*마지막 업데이트: 2026-02-20*
