# Prisma 마이그레이션 가이드

## Phase 4 기능 활성화를 위한 데이터베이스 마이그레이션

Phase 4에서 추가된 기능들이 완전히 작동하려면 데이터베이스에 새로운 필드와 테이블을 추가해야 합니다.

## 🔧 마이그레이션 방법

### 1. 개발 환경에서 마이그레이션

```bash
# 마이그레이션 실행
npx prisma migrate dev

# 프로덕션에서는 deploy 사용
npx prisma migrate deploy
```

### 2. 수동 마이그레이션 (필요시)

마이그레이션 파일이 이미 생성되어 있습니다:
- `prisma/migrations/20260223172913_add_phase4_features/migration.sql`

직접 데이터베이스에 적용하려면:

```bash
# Supabase SQL Editor에서 migration.sql 내용 실행
# 또는 psql 사용:
psql $DATABASE_URL -f prisma/migrations/20260223172913_add_phase4_features/migration.sql
```

## 📋 추가되는 변경 사항

### 1. 새로운 Enum 타입
- `SellerGrade`: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND
- `PromotionType`: DISCOUNT, BUNDLE, TIME_SALE, FREE_SHIPPING, COUPON
- `Language`: EN 값 추가 (기존: KO, ZH)
- `NotificationType`: COUPON, POINT, SELLER 값 추가

### 2. User 테이블 추가 필드
- `sellerGrade`: 판매자 등급 (SellerGrade?)
- `sellerScore`: 판매자 점수 (Int?)

### 3. Wishlist 테이블 추가 필드
- `priceAlertEnabled`: 가격 알림 활성화 (Boolean, default: false)
- `targetPrice`: 목표 가격 (Float?)
- `lastKnownPrice`: 마지막 알려진 가격 (Float?)
- `stockAlertEnabled`: 재고 알림 활성화 (Boolean, default: false)
- `folderId`: 폴더 ID (String?)
- `note`: 메모 (Text?)

### 4. WishlistFolder 테이블 (신규)
```sql
CREATE TABLE "WishlistFolder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameZh" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "WishlistFolder_pkey" PRIMARY KEY ("id")
);
```

### 5. Review 테이블 추가 필드
- `likesCount`: 좋아요 수 (Int, default: 0)
- `isBest`: 베스트 리뷰 여부 (Boolean, default: false)
- `bestSelectedAt`: 베스트 선정 일시 (DateTime?)

### 6. Promotion 테이블 (신규)
```sql
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "title" TEXT NOT NULL,
    "titleZh" TEXT,
    "description" TEXT,
    "descriptionZh" TEXT,
    "discountRate" DOUBLE PRECISION,
    "discountAmount" DOUBLE PRECISION,
    "minPurchase" DOUBLE PRECISION,
    "bundlePostIds" TEXT[],
    "bundlePrice" DOUBLE PRECISION,
    "targetPostIds" TEXT[],
    "categoryIds" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);
```

## 🔍 마이그레이션 확인

```bash
# Prisma Client 재생성
npx prisma generate

# 스키마와 데이터베이스 동기화 확인
npx prisma db push --preview-feature

# 마이그레이션 상태 확인
npx prisma migrate status
```

## ⚠️ 주의사항

1. **프로덕션 배포 전 백업**
   - 마이그레이션 실행 전 반드시 데이터베이스 백업
   - Supabase Dashboard > Database > Backups

2. **단계적 배포 권장**
   - 개발 환경에서 먼저 테스트
   - 스테이징 환경 검증
   - 프로덕션 배포

3. **다운타임 최소화**
   - 새로운 필드는 모두 optional (nullable)
   - 기존 데이터에 영향 없음
   - 롤백 가능

## 🚀 마이그레이션 후 작업

```bash
# Prisma Client 재생성 (필수)
npx prisma generate

# 프로젝트 빌드
npm run build

# 개발 서버 재시작
npm run dev
```

## 📊 영향받는 기능

마이그레이션 후 다음 Phase 4 기능들이 완전히 활성화됩니다:

1. ✅ 알림 시스템 고도화 (EN 언어 지원)
2. ✅ 쿠폰 자동화 (만료 알림)
3. ✅ 찜목록 고급 기능 (가격/재고 알림, 폴더, 메모)
4. ✅ 판매자 등급 시스템 (5단계 등급, 수수료 할인)
5. ✅ 리뷰 보상 시스템 (베스트 리뷰 선정)
6. ✅ 판매자 프로모션 (5가지 타입)
7. ✅ 영어 지원 확장

## 🐛 문제 해결

### 마이그레이션 실패 시

```bash
# 마이그레이션 초기화 (개발 환경만!)
npx prisma migrate reset

# 마이그레이션 강제 적용
npx prisma db push --force-reset
```

### Prisma Client 에러 발생 시

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules
npm install

# Prisma Client 재생성
npx prisma generate
```

## 📞 문제 발생 시

마이그레이션 중 문제가 발생하면:
1. 에러 메시지 캡처
2. `prisma/migrations` 폴더 백업
3. 데이터베이스 백업본으로 복구
4. 개발팀 문의
