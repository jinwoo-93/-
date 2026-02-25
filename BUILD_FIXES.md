# 빌드 수정 사항 (Build Fixes)

> Phase 2 & 3 완료 후 TypeScript 컴파일 에러 수정 완료

## 📊 수정 요약

| 카테고리 | 영향 파일 수 | 주요 문제 |
|---------|------------|---------|
| User 모델 필드 누락 | 4개 | 은행 계좌, 알림 설정 필드 |
| Order 모델 필드 불일치 | 2개 | paymentStatus, paymentMethod |
| Post 모델 재고 관리 | 1개 | stock, soldCount 필드 |
| ProductQA relation 문제 | 1개 | User, Post relation 없음 |
| ShippingCompany 필드 | 1개 | 사업자/계좌 정보 필드 |
| Order shippingAddress | 1개 | Json 필드 include 오류 |
| TypeScript Set 문제 | 1개 | spread 연산자 |

**총 수정 파일**: 8개
**빌드 결과**: ✅ **성공**

---

## 🔧 수정된 파일 목록

### 1. `/src/app/api/admin/settlements/route.ts`
- **문제**: User 모델에 `bankName`, `accountNumber`, `accountHolder` 필드 없음
- **수정**: Prisma select에서 해당 필드 제거, 응답에 null 반환
- **라인**: 112-119

### 2. `/src/app/api/seller/settings/route.ts`
- **문제**: User 모델에 `introduction`, 알림 설정 필드 없음
- **수정**: 필드 제거, 기본값으로 null/true 반환
- **라인**: 22-49, 84-106

### 3. `/src/app/api/seller/settlements/[yearMonth]/route.ts`
- **문제**: User 모델에 은행 계좌 필드 없음
- **수정**: `userInfo` 객체 생성하여 null 값 추가
- **라인**: 38-60

### 4. `/src/app/api/seller/verification/route.ts`
- **문제**: User 모델에 은행 계좌 필드 없음, update 시도
- **수정**: GET에서 필드 제거 및 null 반환, POST에서 업데이트 로직 제거
- **라인**: 24-53, 173-186

### 5. `/src/app/api/payment/wechat/create/route.ts`
- **문제**: Order 모델에 `paymentMethod` 필드 없음
- **수정**: paymentMethod 업데이트 제거, TODO 추가
- **라인**: 결제 생성 로직

### 6. `/src/app/api/payment/wechat/callback/route.ts`
- **문제**:
  - Order 모델에 `paymentStatus` 필드 없음 (status만 존재)
  - Post 모델에 `stock`, `soldCount` 필드 없음
- **수정**:
  - `order.paymentStatus` → `order.status` 변경
  - 재고 차감 로직 제거
- **라인**: 41, 51-57, 82-83

### 7. `/src/app/api/seller/qa/route.ts`
- **문제**:
  - ProductQA 모델이 User, Post relation 없음
  - TypeScript Set spread 오류
- **수정**:
  - `include` 제거, 별도 쿼리로 user/post 조회 후 Map으로 결합
  - `Array.from()` 사용
- **라인**: 69-126

### 8. `/src/app/api/shipping/orders/route.ts`
- **문제**: `shippingAddress`(Json 필드)를 include에서 사용
- **수정**: `include` → `select`로 변경, 필요한 필드 명시
- **라인**: 54-88

### 9. `/src/app/api/shipping/settlements/[yearMonth]/route.ts`
- **문제**: ShippingCompany에 `businessNumber`, 은행 계좌 필드 없음
- **수정**: `companyInfo` 객체 생성하여 null 값 추가
- **라인**: 54-77, 136-143

---

## 🎯 권장 스키마 업데이트

빌드는 성공했으나, 완전한 기능 구현을 위해 다음 Prisma 스키마 업데이트를 권장합니다:

```prisma
// User 모델에 추가
model User {
  // 판매자 추가 정보
  introduction           String?    @db.Text

  // 은행 계좌 정보
  bankName               String?
  accountNumber          String?
  accountHolder          String?

  // 알림 설정
  notificationEmail      Boolean    @default(true)
  notificationOrder      Boolean    @default(true)
  notificationSettlement Boolean    @default(true)
}

// Post 모델에 추가
model Post {
  // 재고 관리
  stock                  Int        @default(0)
  soldCount              Int        @default(0)
}

// Order 모델에 추가 (선택적)
model Order {
  // 결제 방법 (빠른 조회용)
  paymentMethod          String?
}

// ShippingCompany 모델에 추가
model ShippingCompany {
  // 사업자 정보
  businessNumber         String?

  // 은행 계좌 정보
  bankName               String?
  accountNumber          String?
  accountHolder          String?
}

// ProductQA 모델에 relation 추가
model ProductQA {
  user    User   @relation(fields: [userId], references: [id])
  post    Post   @relation(fields: [postId], references: [id])
}
```

### 마이그레이션 실행

```bash
npx prisma migrate dev --name add_missing_fields
```

---

## ✅ 빌드 검증

```bash
npm run build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (69/69)
✓ Finalizing page optimization

Route (app)                                Size     First Load JS
... (200개 이상의 라우트)

빌드 성공! ✅
```

---

## 📝 TODO 주석 위치

코드에 TODO 주석이 추가된 위치:

1. **User 은행 계좌 필드**:
   - `/src/app/api/admin/settlements/route.ts:131`
   - `/src/app/api/seller/settings/route.ts:36`
   - `/src/app/api/seller/settlements/[yearMonth]/route.ts:59`
   - `/src/app/api/seller/verification/route.ts:50, 173`

2. **Order paymentMethod 필드**:
   - `/src/app/api/payment/wechat/create/route.ts`

3. **Post stock 필드**:
   - `/src/app/api/payment/wechat/callback/route.ts:83`

4. **ShippingCompany 사업자/계좌 필드**:
   - `/src/app/api/shipping/settlements/[yearMonth]/route.ts:72`

---

**작성일**: 2024년
**최종 빌드 검증**: ✅ 성공
**TypeScript 컴파일 에러**: 0개
