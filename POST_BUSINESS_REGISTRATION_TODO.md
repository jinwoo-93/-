# 사업자 등록 후 TODO 목록

> **작성일**: 2026년 2월 26일
> **카테고리**: 사업자 등록 완료 후 필수 작업
> **우선순위**: 🔴 필수 / 🟡 중요 / 🟢 권장

---

## 📋 목차
1. [즉시 처리 필요 (사업자 등록 직후)](#1-즉시-처리-필요-사업자-등록-직후)
2. [1개월 이내 처리](#2-1개월-이내-처리)
3. [3개월 이내 처리](#3-3개월-이내-처리)
4. [6개월 이내 처리](#4-6개월-이내-처리)

---

## 1. 즉시 처리 필요 (사업자 등록 직후)

### 🔴 1-1. SMS 인증 실제 발송 구현

**현황**: 현재는 콘솔 로그로만 출력
**파일**:
- `src/app/api/auth/send-code/route.ts`
- `src/lib/sms.ts`

**필요 작업**:

#### 한국 사용자용 (알리고)
```typescript
// src/lib/sms.ts
import axios from 'axios';

export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.ALIGO_API_KEY;
  const userId = process.env.ALIGO_USER_ID;
  const sender = process.env.ALIGO_SENDER; // 등록된 발신번호

  const response = await axios.post('https://apis.aligo.in/send/', {
    key: apiKey,
    user_id: userId,
    sender: sender,
    receiver: phone,
    msg: message,
  });

  if (response.data.result_code !== '1') {
    throw new Error(`SMS 발송 실패: ${response.data.message}`);
  }

  return response.data;
}
```

#### 중국 사용자용 (阿里云短信)
```typescript
export async function sendSMSChina(phone: string, code: string) {
  // 阿里云短信 API 연동
  // https://help.aliyun.com/document_detail/101414.html
}
```

**필요 계정**:
- 알리고: https://smartsms.aligo.in (월 최저 5,500원)
- 阿里云: https://www.aliyun.com/product/sms

**우선순위**: 🔴 필수 (회원가입 기능 작동 안 함)

---

### 🔴 1-2. Footer에 사업자 정보 표시

**현황**: Footer에 사업자 정보 없음
**파일**: `src/components/Footer.tsx` (또는 해당 Footer 컴포넌트)

**필요 내용**:
```typescript
<footer>
  <div className="business-info">
    <p>상호명: [회사명]</p>
    <p>대표자: [대표자명]</p>
    <p>사업자등록번호: [123-45-67890]</p>
    <p>통신판매업신고번호: [제2026-서울강남-12345호]</p>
    <p>주소: [사업장 주소]</p>
    <p>고객센터: 1234-5678</p>
    <p>이메일: support@jikguyeokgu.com</p>
  </div>
</footer>
```

**우선순위**: 🔴 필수 (전자상거래법 의무사항)

---

### 🔴 1-3. 통신판매업 신고

**필요 서류**:
- 사업자등록증 사본
- 도메인 등록증 (jikguyeokgu.com)
- 신분증 사본
- 사이트 URL

**신청 방법**:
1. 정부24 (www.gov.kr) 접속
2. "통신판매업 신고" 검색
3. 온라인 신청
4. 약 2주 소요

**비용**: 무료

**우선순위**: 🔴 필수 (법적 의무)

---

## 2. 1개월 이내 처리

### 🟡 2-1. 본인인증 API 연동

**현황**: Mock 데이터로 처리 중
**파일**: `src/app/api/verify/identity/route.ts`

**필요 서비스**: NICE 평가정보 또는 PASS 인증

#### NICE 평가정보 연동
```typescript
// src/lib/nice-auth.ts
export async function verifyIdentity(data: {
  name: string;
  phone: string;
  birthdate: string;
  gender: string;
}) {
  const apiKey = process.env.NICE_API_KEY;
  const apiUrl = process.env.NICE_API_URL;

  // NICE API 호출
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(data),
  });

  return response.json();
}
```

**비용**: 건당 300~500원
**가입**: https://www.niceapi.co.kr

**우선순위**: 🟡 중요 (판매자 인증 시 필요)

---

### 🟡 2-2. 사업자 번호 검증 API

**현황**: Mock 검증만 수행
**파일**: `src/app/api/verify/business/route.ts`

**API**: 국세청 사업자등록번호 조회 서비스 (무료)

#### 구현 예시
```typescript
// src/lib/business-verify.ts
export async function verifyBusinessNumber(businessNumber: string) {
  const apiKey = process.env.NTS_API_KEY;

  const response = await fetch(
    'https://api.odcloud.kr/api/nts-businessman/v1/status',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Infuser ${apiKey}`,
      },
      body: JSON.stringify({
        b_no: [businessNumber.replace(/-/g, '')],
      }),
    }
  );

  const result = await response.json();
  return result.data[0].b_stt_cd === '01'; // 01 = 계속사업자
}
```

**API 키 발급**: https://www.data.go.kr/data/15081808/openapi.do

**우선순위**: 🟡 중요 (판매자 등록 시 필수)

---

### 🟡 2-3. 정산 시스템 준비

**필요 작업**:
1. User 모델에 은행 계좌 필드 추가 ✅ (완료)
2. ShippingCompany 모델에 은행 계좌 필드 추가 ✅ (완료)
3. 정산 자동화 Cron Job 활성화
4. 관리자 정산 승인 페이지 테스트

**관련 파일**:
- `src/lib/cron/settlement.ts`
- `src/app/api/admin/settlements/route.ts`
- `src/app/api/seller/settlements/[yearMonth]/route.ts`

**우선순위**: 🟡 중요 (판매 시작 전 필수)

---

## 3. 3개월 이내 처리

### 🟢 3-1. 배송 추적 API 연동

**현황**: Mock 데이터 반환
**파일**: `src/lib/shipping-tracker.ts`

**필요 API**:
- SmartParcel (한국 택배 통합 API)
- SF Express (중국 배송)

#### SmartParcel 연동
```typescript
export async function trackShipment(
  carrier: string,
  trackingNumber: string
) {
  const apiKey = process.env.SMARTPARCEL_API_KEY;

  const response = await fetch(
    `https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${apiKey}&t_code=${carrier}&t_invoice=${trackingNumber}`
  );

  return response.json();
}
```

**비용**: 건당 10원
**가입**: https://www.sweettracker.co.kr

**우선순위**: 🟢 권장 (배송 시작 후)

---

### 🟢 3-2. 판매자 등급 시스템 완성

**현황**: sellerGrade 필드는 추가되었으나 배송일 비교 로직 미구현
**파일**: `src/lib/seller-grade-system.ts`

**필요 작업**:
```typescript
// TODO: 예상 배송일 vs 실제 배송일 비교 로직 추가
async function calculateOnTimeRate(sellerId: string) {
  const orders = await prisma.order.findMany({
    where: {
      sellerId,
      status: 'DELIVERED',
    },
    select: {
      estimatedDeliveryDate: true, // TODO: Order 모델에 추가 필요
      deliveredAt: true,
    },
  });

  const onTimeCount = orders.filter(order => {
    return order.deliveredAt <= order.estimatedDeliveryDate;
  }).length;

  return (onTimeCount / orders.length) * 100;
}
```

**우선순위**: 🟢 권장 (판매자 관리 강화)

---

### 🟢 3-3. 관리자 알림 시스템

**현황**: 고객 문의 시 관리자에게 알림 없음
**파일**: `src/app/api/support/route.ts`

**필요 작업**:

#### 이메일 알림 (Resend)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notifyAdminNewTicket(ticket: SupportTicket) {
  await resend.emails.send({
    from: 'system@jikguyeokgu.com',
    to: 'admin@jikguyeokgu.com',
    subject: `[고객문의] ${ticket.subject}`,
    html: `
      <h2>새로운 고객 문의</h2>
      <p><strong>문의자:</strong> ${ticket.name} (${ticket.email})</p>
      <p><strong>카테고리:</strong> ${ticket.category}</p>
      <p><strong>내용:</strong> ${ticket.content}</p>
    `,
  });
}
```

**비용**: Resend 무료 플랜 (월 3,000통)
**가입**: https://resend.com

**우선순위**: 🟢 권장 (고객 대응 강화)

---

## 4. 6개월 이내 처리

### 🟢 4-1. Sentry 에러 모니터링

**현황**: 에러 로깅만 콘솔 출력
**관련 파일**: 15개 파일에 TODO 있음

**필요 작업**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**환경변수**:
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn
SENTRY_AUTH_TOKEN=your-token
```

**우선순위**: 🟢 권장 (프로덕션 안정성)

---

### 🟢 4-2. 쿠폰 자동화 고도화

**현황**: 생일 쿠폰, 비활성 사용자 쿠폰 활성화됨 ✅
**파일**: `src/lib/coupon-automation.ts`

**추가 기능**:
- 장바구니 방치 알림 쿠폰
- 첫 구매 쿠폰
- VIP 회원 쿠폰

**우선순위**: 🟢 권장 (마케팅 강화)

---

### 🟢 4-3. 판매자 프로모션 시스템

**현황**: Promotion 모델 아직 미구현
**파일**: `src/lib/seller-promotion-system.ts`

**필요 작업**:
1. Promotion 모델 Prisma 스키마 추가
2. 판매자 프로모션 생성 API
3. 프로모션 적용 로직
4. 통계 추적

**우선순위**: 🟢 권장 (판매자 마케팅 도구)

---

## 📊 실행 우선순위

### 🔴 사업자 등록 직후 (1주일 이내)
1. ✅ SMS 발송 구현 (알리고 가입)
2. ✅ Footer 사업자 정보 표시
3. ✅ 통신판매업 신고

### 🟡 1개월 이내
4. ⬜ 본인 인증 API (NICE)
5. ⬜ 사업자 번호 검증 API (국세청)
6. ⬜ 정산 시스템 테스트

### 🟢 3개월 이내
7. ⬜ 배송 추적 API (SmartParcel)
8. ⬜ 판매자 등급 시스템 완성
9. ⬜ 관리자 알림 (Resend)

### 🟢 6개월 이내
10. ⬜ Sentry 연동
11. ⬜ 쿠폰 자동화 고도화
12. ⬜ 판매자 프로모션 시스템

---

## 💰 예상 비용

### 필수 비용
- 알리고 SMS: 월 5,500원~
- 통신판매업 신고: 무료

### 선택 비용
- NICE 본인인증: 건당 300~500원
- SmartParcel 배송 추적: 건당 10원
- Resend 이메일: 무료 (월 3,000통)
- Sentry: 무료 (월 5,000 에러)

**총 예상 비용**: 월 5,500원~ (SMS만) / 월 10,000원~ (전체)

---

**작성**: Claude Sonnet 4.5
**기준일**: 2026년 2월 26일
**상태**: 사업자 등록 전 준비 완료
