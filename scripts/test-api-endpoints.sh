#!/bin/bash

# Phase 4 API 엔드포인트 테스트 스크립트
#
# 사용 방법:
# chmod +x scripts/test-api-endpoints.sh
# ./scripts/test-api-endpoints.sh http://localhost:3000

BASE_URL=${1:-http://localhost:3000}
CRON_SECRET=${CRON_SECRET:-your-cron-secret}

echo "=========================================="
echo "🧪 Phase 4 API 엔드포인트 테스트"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo ""

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 테스트 결과 카운터
PASSED=0
FAILED=0

# 테스트 함수
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    local auth=$5

    echo -e "${YELLOW}Testing:${NC} $name"
    echo "URL: $method $url"

    if [ "$method" = "GET" ]; then
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $auth" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" "$url")
        fi
    else
        if [ -n "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "Authorization: Bearer $auth" -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
        fi
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        echo "Response: $body" | head -c 200
        echo ""
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo "=========================================="
echo "1. Health Check"
echo "=========================================="
test_endpoint "Health Check" "$BASE_URL/api/health"

echo "=========================================="
echo "2. 알림 시스템"
echo "=========================================="
test_endpoint "알림 목록 조회 (인증 필요)" "$BASE_URL/api/notifications"

echo "=========================================="
echo "3. 찜목록 고급 기능"
echo "=========================================="
test_endpoint "찜목록 통계 (인증 필요)" "$BASE_URL/api/wishlist/stats"
test_endpoint "찜목록 추천 (인증 필요)" "$BASE_URL/api/wishlist/recommendations"

echo "=========================================="
echo "4. 판매자 등급 시스템"
echo "=========================================="
test_endpoint "판매자 등급 조회 (인증 필요)" "$BASE_URL/api/seller/grade"

echo "=========================================="
echo "5. 쿠폰 시스템"
echo "=========================================="
test_endpoint "쿠폰 목록 조회 (인증 필요)" "$BASE_URL/api/coupons"

echo "=========================================="
echo "6. Cron Job 엔드포인트 (수동 실행)"
echo "=========================================="
echo "⚠️  주의: Cron Job 엔드포인트는 CRON_SECRET이 필요합니다."
echo "CRON_SECRET 환경 변수를 설정하거나 스크립트에 직접 입력하세요."
echo ""

# Cron Job 테스트 (실제 실행하지 않고 인증만 확인)
test_endpoint "쿠폰 자동화 Cron" "$BASE_URL/api/cron/coupon-automation" "GET" "" "$CRON_SECRET"
test_endpoint "판매자 등급 갱신 Cron" "$BASE_URL/api/cron/seller-grades" "GET" "" "$CRON_SECRET"
test_endpoint "리뷰 작성 독려 Cron" "$BASE_URL/api/cron/review-reminders" "GET" "" "$CRON_SECRET"
test_endpoint "가격 변동 알림 Cron" "$BASE_URL/api/cron/price-alerts" "GET" "" "$CRON_SECRET"
test_endpoint "베스트 리뷰 선정 Cron" "$BASE_URL/api/cron/best-reviews" "GET" "" "$CRON_SECRET"

echo "=========================================="
echo "📊 테스트 결과 요약"
echo "=========================================="
echo -e "통과: ${GREEN}$PASSED${NC}"
echo -e "실패: ${RED}$FAILED${NC}"
echo -e "총 테스트: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 모든 테스트 통과!${NC}"
    exit 0
else
    echo -e "${RED}❌ 일부 테스트 실패${NC}"
    exit 1
fi
