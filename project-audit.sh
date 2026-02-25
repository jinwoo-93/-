#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        직구역구 프로젝트 전체 구현 상태 점검 보고서         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 1. 프로젝트 규모"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

API_COUNT=$(find src/app/api -name "route.ts" | wc -l | tr -d ' ')
PAGE_COUNT=$(find src/app -name "page.tsx" | wc -l | tr -d ' ')
COMPONENT_COUNT=$(find src/components -name "*.tsx" | wc -l | tr -d ' ')
LIB_COUNT=$(find src/lib -name "*.ts" | wc -l | tr -d ' ')
TOTAL_TS=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')

echo "📁 API 엔드포인트:     $API_COUNT 개"
echo "📄 페이지:             $PAGE_COUNT 개"
echo "🧩 컴포넌트:           $COMPONENT_COUNT 개"
echo "📚 라이브러리:         $LIB_COUNT 개"
echo "📝 총 소스 파일:       $TOTAL_TS 개"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 2. 구현 완료 기능 (백엔드 API)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔐 인증 & 사용자:"
[ -f "src/app/api/auth/[...nextauth]/route.ts" ] && echo "  ✅ NextAuth 인증"
[ -f "src/app/api/auth/register/route.ts" ] && echo "  ✅ 회원가입"
[ -f "src/app/api/auth/sms/send/route.ts" ] && echo "  ✅ SMS 인증"
[ -f "src/app/api/users/me/route.ts" ] && echo "  ✅ 사용자 프로필"
[ -f "src/app/api/verify/identity/route.ts" ] && echo "  ✅ 본인인증"
[ -f "src/app/api/verify/business/route.ts" ] && echo "  ✅ 사업자인증"
echo ""

echo "📦 게시글 & 카테고리:"
[ -f "src/app/api/posts/route.ts" ] && echo "  ✅ 게시글 CRUD"
[ -f "src/app/api/posts/[id]/route.ts" ] && echo "  ✅ 게시글 상세"
[ -f "src/app/api/common/categories/route.ts" ] && echo "  ✅ 카테고리 관리"
[ -f "src/app/api/wishlist/route.ts" ] && echo "  ✅ 찜하기"
[ -f "src/app/api/follow/route.ts" ] && echo "  ✅ 팔로우"
echo ""

echo "🛒 주문 & 결제:"
[ -f "src/app/api/orders/route.ts" ] && echo "  ✅ 주문 생성"
[ -f "src/app/api/orders/[id]/route.ts" ] && echo "  ✅ 주문 관리"
[ -f "src/app/api/orders/[id]/confirm/route.ts" ] && echo "  ✅ 구매 확정"
[ -f "src/app/api/payments/route.ts" ] && echo "  ✅ 결제 처리"
echo ""

echo "⚖️ 분쟁 & 리뷰:"
[ -f "src/app/api/disputes/route.ts" ] && echo "  ✅ 분쟁 생성"
[ -f "src/app/api/disputes/[id]/vote/route.ts" ] && echo "  ✅ 분쟁 투표"
[ -f "src/app/api/reviews/route.ts" ] && echo "  ✅ 리뷰 작성"
echo ""

echo "🚚 배송 & 광고:"
[ -f "src/app/api/shipping/companies/route.ts" ] && echo "  ✅ 배송업체 관리"
[ -f "src/app/api/shipping/calculate/route.ts" ] && echo "  ✅ 배송비 계산"
[ -f "src/app/api/ads/bids/route.ts" ] && echo "  ✅ 광고 입찰"
[ -f "src/app/api/ads/weekly-close/route.ts" ] && echo "  ✅ 광고 마감"
echo ""

echo "📺 라이브 & 구매대행:"
[ -f "src/app/api/live/route.ts" ] && echo "  ✅ 라이브 커머스"
[ -f "src/app/api/purchase-requests/route.ts" ] && echo "  ✅ 구매대행 요청"
echo ""

echo "🎁 쿠폰 & 포인트:"
[ -f "src/app/api/coupons/route.ts" ] && echo "  ✅ 쿠폰 관리"
[ -f "src/app/api/coupons/auto-issue/route.ts" ] && echo "  ✅ 쿠폰 자동 발급"
[ -f "src/app/api/points/route.ts" ] && echo "  ✅ 포인트 시스템"
echo ""

echo "🔔 알림 & 자동화:"
[ -f "src/app/api/notifications/route.ts" ] && echo "  ✅ 알림 관리"
[ -f "src/app/api/fcm/token/route.ts" ] && echo "  ✅ FCM 푸시"
[ -f "src/app/api/cron/coupon-automation/route.ts" ] && echo "  ✅ 쿠폰 자동화 Cron"
[ -f "src/app/api/cron/seller-grades/route.ts" ] && echo "  ✅ 판매자 등급 Cron"
[ -f "src/app/api/cron/review-reminders/route.ts" ] && echo "  ✅ 리뷰 독려 Cron"
echo ""

echo "👨‍💼 판매자 & 관리자:"
[ -f "src/app/api/seller/grade/route.ts" ] && echo "  ✅ 판매자 등급"
[ -f "src/app/api/seller/statistics/route.ts" ] && echo "  ✅ 판매 통계"
[ -f "src/app/api/admin/users/route.ts" ] && echo "  ✅ 관리자 사용자 관리"
[ -f "src/app/api/admin/posts/route.ts" ] && echo "  ✅ 관리자 게시글 관리"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ 3. 부족한 부분 (프론트엔드 UI)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "❌ 미구현 페이지:"
[ ! -f "src/app/(main)/notifications/page.tsx" ] && echo "  ❌ 알림 센터 페이지"
[ ! -f "src/app/(seller)/seller/dashboard/page.tsx" ] && echo "  ❌ 판매자 대시보드"
[ ! -f "src/app/(seller)/seller/promotions/page.tsx" ] && echo "  ❌ 프로모션 관리 페이지"
[ ! -f "src/app/(main)/mypage/coupons/page.tsx" ] && echo "  ❌ 쿠폰함 개선"
[ ! -f "src/app/(main)/mypage/wishlist/folders/page.tsx" ] && echo "  ❌ 찜목록 폴더 관리"
echo ""

echo "❌ 미구현 컴포넌트:"
[ ! -f "src/components/notifications/NotificationCenter.tsx" ] && echo "  ❌ 알림 센터 컴포넌트"
[ ! -f "src/components/seller/GradeBadge.tsx" ] && echo "  ❌ 판매자 등급 뱃지"
[ ! -f "src/components/seller/PromotionForm.tsx" ] && echo "  ❌ 프로모션 폼"
[ ! -f "src/components/wishlist/FolderManager.tsx" ] && echo "  ❌ 찜목록 폴더 관리"
[ ! -f "src/components/common/LanguageSelector.tsx" ] && echo "  ❌ 언어 선택기"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ 4. 환경 설정 & 인프라"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "환경 변수 확인:"
[ -f ".env.local" ] && echo "  ✅ .env.local 존재" || echo "  ⚠️  .env.local 필요"
[ -f ".env.example" ] && echo "  ✅ .env.example 존재"

echo ""
echo "Firebase 설정:"
grep -q "FIREBASE_PROJECT_ID" .env.example && echo "  ⚠️  Firebase 환경 변수 설정 필요" || echo "  ❌ Firebase 설정 정보 없음"
echo ""

echo "데이터베이스:"
[ -d "prisma/migrations" ] && echo "  ✅ 마이그레이션 폴더 존재" || echo "  ⚠️  마이그레이션 실행 필요"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ 5. 테스트 & 품질"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TEST_COUNT=$(find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | wc -l | tr -d ' ')
echo "단위 테스트: $TEST_COUNT 개"
[ $TEST_COUNT -eq 0 ] && echo "  ⚠️  단위 테스트 미작성"
echo ""

[ -f "cypress.config.ts" ] && echo "  ✅ E2E 테스트 설정" || echo "  ❌ E2E 테스트 미설정"
[ -f ".github/workflows/test.yml" ] && echo "  ✅ CI/CD 파이프라인" || echo "  ❌ CI/CD 미설정"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ 6. 보안 & 성능"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "보안:"
grep -q "NEXTAUTH_SECRET" .env.example && echo "  ✅ NextAuth 시크릿 설정됨"
grep -q "CRON_SECRET" .env.example && echo "  ✅ Cron 시크릿 설정됨"
echo "  ⚠️  Rate Limiting 미구현"
echo "  ⚠️  CORS 설정 검토 필요"
echo ""

echo "성능:"
echo "  ⚠️  이미지 최적화 검토 필요"
echo "  ⚠️  캐싱 전략 수립 필요"
echo "  ⚠️  번들 크기 최적화 필요"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️ 7. 문서화 & 모니터링"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

[ -f "README.md" ] && echo "  ✅ README.md" || echo "  ⚠️  README.md 작성 필요"
[ -f "DEPLOYMENT_CHECKLIST.md" ] && echo "  ✅ 배포 체크리스트"
[ -f "TESTING_GUIDE.md" ] && echo "  ✅ 테스트 가이드"
echo "  ❌ API 문서 (Swagger/OpenAPI)"
echo "  ❌ 사용자 가이드"
echo "  ❌ 에러 모니터링 (Sentry)"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     점검 완료                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
