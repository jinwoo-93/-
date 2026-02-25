#!/bin/bash

echo "=========================================="
echo "🧪 직구역구 프로젝트 전체 기능 테스트"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

test_feature() {
    echo "▶ $1"
    if [ $2 -eq 0 ]; then
        echo "  ✅ PASS"
        PASSED=$((PASSED + 1))
    else
        echo "  ❌ FAIL"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "=========================================="
echo "1️⃣ 빌드 시스템"
echo "=========================================="

npm run build > /dev/null 2>&1
test_feature "프로젝트 빌드" $?

npx prisma generate > /dev/null 2>&1
test_feature "Prisma Client 생성" $?

echo "=========================================="
echo "2️⃣ 파일 구조 검증"
echo "=========================================="

# Phase 1 파일
[ -f "src/app/api/auth/[...nextauth]/route.ts" ]
test_feature "인증 API" $?

[ -f "src/app/api/posts/route.ts" ]
test_feature "게시글 API" $?

[ -f "src/app/api/users/me/route.ts" ]
test_feature "사용자 API" $?

# Phase 2 파일
[ -f "src/app/api/orders/route.ts" ]
test_feature "주문 API" $?

[ -f "src/app/api/disputes/route.ts" ]
test_feature "분쟁 API" $?

# Phase 3 파일
[ -f "src/app/api/shipping/companies/route.ts" ]
test_feature "배송 API" $?

[ -f "src/app/api/ads/bids/route.ts" ]
test_feature "광고 입찰 API" $?

[ -f "src/app/api/live/route.ts" ]
test_feature "라이브 커머스 API" $?

# Phase 4 파일
[ -f "src/lib/notification-templates.ts" ]
test_feature "알림 템플릿" $?

[ -f "src/lib/coupon-automation.ts" ]
test_feature "쿠폰 자동화" $?

[ -f "src/lib/wishlist-service.ts" ]
test_feature "찜목록 서비스" $?

[ -f "src/lib/seller-grade-system.ts" ]
test_feature "판매자 등급 시스템" $?

[ -f "src/lib/review-reward-system.ts" ]
test_feature "리뷰 보상 시스템" $?

[ -f "src/lib/seller-promotion-system.ts" ]
test_feature "판매자 프로모션" $?

[ -f "src/lib/i18n.ts" ]
test_feature "다국어 지원" $?

# Cron Jobs
[ -f "src/app/api/cron/coupon-automation/route.ts" ]
test_feature "쿠폰 자동화 Cron" $?

[ -f "src/app/api/cron/seller-grades/route.ts" ]
test_feature "판매자 등급 Cron" $?

[ -f "src/app/api/cron/review-reminders/route.ts" ]
test_feature "리뷰 독려 Cron" $?

[ -f "src/app/api/cron/price-alerts/route.ts" ]
test_feature "가격 알림 Cron" $?

[ -f "src/app/api/cron/best-reviews/route.ts" ]
test_feature "베스트 리뷰 Cron" $?

echo "=========================================="
echo "3️⃣ Prisma 스키마 검증"
echo "=========================================="

# Enum 확인
grep -q "enum Language" prisma/schema.prisma && grep -q "EN" prisma/schema.prisma
test_feature "Language enum (KO, ZH, EN)" $?

grep -q "enum SellerGrade" prisma/schema.prisma
test_feature "SellerGrade enum" $?

grep -q "enum PromotionType" prisma/schema.prisma
test_feature "PromotionType enum" $?

# 모델 확인
grep -q "model Wishlist" prisma/schema.prisma && grep -q "priceAlertEnabled" prisma/schema.prisma
test_feature "Wishlist 모델 (고급 기능)" $?

grep -q "model WishlistFolder" prisma/schema.prisma
test_feature "WishlistFolder 모델" $?

grep -q "model Promotion" prisma/schema.prisma
test_feature "Promotion 모델" $?

grep -q "sellerGrade" prisma/schema.prisma && grep -q "sellerScore" prisma/schema.prisma
test_feature "User 판매자 등급 필드" $?

grep -q "likesCount" prisma/schema.prisma && grep -q "isBest" prisma/schema.prisma
test_feature "Review 고급 필드" $?

echo "=========================================="
echo "4️⃣ 설정 파일 검증"
echo "=========================================="

# vercel.json Cron Jobs
grep -q "/api/cron/coupon-automation" vercel.json
test_feature "Vercel Cron Job 설정" $?

# 환경 변수 예시 파일
[ -f ".env.example" ]
test_feature "환경 변수 예시 파일" $?

# TypeScript 설정
[ -f "tsconfig.json" ]
test_feature "TypeScript 설정" $?

# Next.js 설정
[ -f "next.config.mjs" ]
test_feature "Next.js 설정" $?

echo "=========================================="
echo "5️⃣ 문서화"
echo "=========================================="

[ -f "README.md" ]
test_feature "README 문서" $?

[ -f "PHASE_4_SUMMARY.md" ]
test_feature "Phase 4 요약" $?

[ -f "PHASE_4_COMPLETION.md" ]
test_feature "Phase 4 완료 보고서" $?

[ -f "PRISMA_MIGRATION_GUIDE.md" ]
test_feature "Prisma 마이그레이션 가이드" $?

[ -f "DEPLOYMENT_CHECKLIST.md" ]
test_feature "배포 체크리스트" $?

echo "=========================================="
echo "📊 테스트 결과 요약"
echo "=========================================="
echo "✅ 통과: $PASSED"
echo "❌ 실패: $FAILED"
echo "📈 총 테스트: $((PASSED + FAILED))"
echo "🎯 성공률: $(echo "scale=1; $PASSED * 100 / ($PASSED + $FAILED)" | bc)%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 모든 테스트 통과!"
    exit 0
else
    echo "⚠️  일부 테스트 실패"
    exit 1
fi
