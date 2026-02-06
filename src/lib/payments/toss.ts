/**
 * 토스페이먼츠 결제 연동 라이브러리
 * https://docs.tosspayments.com/
 */

const TOSS_API_URL = 'https://api.tosspayments.com/v1';
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

interface TossPaymentRequest {
  orderId: string;
  orderName: string;
  amount: number;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerMobilePhone?: string;
}

interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

interface TossPaymentResponse {
  paymentKey: string;
  orderId: string;
  orderName: string;
  status: string;
  method: string;
  totalAmount: number;
  balanceAmount: number;
  approvedAt: string;
  receipt: {
    url: string;
  };
  card?: {
    company: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    useCardPoint: boolean;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
  };
  virtualAccount?: {
    accountNumber: string;
    accountType: string;
    bank: string;
    customerName: string;
    dueDate: string;
    expired: boolean;
    settlementStatus: string;
  };
  transfer?: {
    bank: string;
    settlementStatus: string;
  };
  easyPay?: {
    provider: string;
    amount: number;
    discountAmount: number;
  };
}

interface TossCancelRequest {
  cancelReason: string;
  cancelAmount?: number;
}

/**
 * Base64 인코딩된 Authorization 헤더 생성
 */
function getAuthorizationHeader(): string {
  const encodedKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  return `Basic ${encodedKey}`;
}

/**
 * 결제 승인 요청
 */
export async function confirmPayment(
  request: TossPaymentConfirmRequest
): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/confirm`, {
    method: 'POST',
    headers: {
      Authorization: getAuthorizationHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 승인에 실패했습니다.');
  }

  return response.json();
}

/**
 * 결제 조회
 */
export async function getPayment(paymentKey: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}`, {
    method: 'GET',
    headers: {
      Authorization: getAuthorizationHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 결제 조회 (주문번호로)
 */
export async function getPaymentByOrderId(orderId: string): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/orders/${orderId}`, {
    method: 'GET',
    headers: {
      Authorization: getAuthorizationHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 결제 취소
 */
export async function cancelPayment(
  paymentKey: string,
  request: TossCancelRequest
): Promise<TossPaymentResponse> {
  const response = await fetch(`${TOSS_API_URL}/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: getAuthorizationHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '결제 취소에 실패했습니다.');
  }

  return response.json();
}

/**
 * 가상계좌 환불 (입금 전 취소)
 */
export async function refundVirtualAccount(
  paymentKey: string,
  request: TossCancelRequest & {
    refundReceiveAccount: {
      bank: string;
      accountNumber: string;
      holderName: string;
    };
  }
): Promise<TossPaymentResponse> {
  return cancelPayment(paymentKey, request);
}

/**
 * 결제 상태 매핑
 */
export function mapTossStatusToInternal(
  status: string
): 'PENDING' | 'ESCROW_HELD' | 'COMPLETED' | 'FAILED' | 'REFUNDED' {
  switch (status) {
    case 'READY':
    case 'IN_PROGRESS':
      return 'PENDING';
    case 'DONE':
      return 'ESCROW_HELD';
    case 'CANCELED':
    case 'PARTIAL_CANCELED':
      return 'REFUNDED';
    case 'ABORTED':
    case 'EXPIRED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

/**
 * 결제 수단 매핑 (Prisma PaymentMethod enum에 맞춤)
 */
export function mapTossMethodToInternal(
  method: string
): 'CREDIT_CARD' | 'NAVER_PAY' | 'KAKAO_PAY' | 'PAYPAL' {
  switch (method) {
    case '카드':
    case '계좌이체':
    case '가상계좌':
    case '휴대폰':
      return 'CREDIT_CARD';
    case '간편결제':
      // 간편결제는 네이버페이, 카카오페이 등을 포함할 수 있음
      // 기본값으로 CREDIT_CARD 반환
      return 'CREDIT_CARD';
    default:
      return 'CREDIT_CARD';
  }
}

export type { TossPaymentRequest, TossPaymentConfirmRequest, TossPaymentResponse, TossCancelRequest };
