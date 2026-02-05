/**
 * 알리페이 결제 연동 라이브러리
 * https://global.alipay.com/docs/
 *
 * 국제 결제용 알리페이 글로벌 (Alipay+) 사용
 */

import crypto from 'crypto';

const ALIPAY_GATEWAY = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do';
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID || '';
const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY || '';
const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY || '';

interface AlipayOrderRequest {
  outTradeNo: string;      // 주문번호
  totalAmount: string;     // 금액 (CNY)
  subject: string;         // 상품명
  body?: string;           // 상품 설명
  returnUrl: string;       // 결제 완료 후 리다이렉트 URL
  notifyUrl: string;       // 웹훅 URL
}

interface AlipayOrderResponse {
  code: string;
  msg: string;
  outTradeNo: string;
  tradeNo: string;
  totalAmount: string;
  sellerId: string;
}

interface AlipayQueryResponse {
  code: string;
  msg: string;
  tradeNo: string;
  outTradeNo: string;
  buyerLogonId: string;
  tradeStatus: string;
  totalAmount: string;
}

interface AlipayRefundRequest {
  tradeNo?: string;
  outTradeNo?: string;
  refundAmount: string;
  refundReason?: string;
  outRequestNo: string;
}

/**
 * RSA2 서명 생성
 */
function signWithRSA2(content: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(content, 'utf8');

  // PEM 형식으로 변환
  const privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${ALIPAY_PRIVATE_KEY}\n-----END RSA PRIVATE KEY-----`;

  return sign.sign(privateKey, 'base64');
}

/**
 * RSA2 서명 검증
 */
function verifyWithRSA2(content: string, signature: string): boolean {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(content, 'utf8');

  const publicKey = `-----BEGIN PUBLIC KEY-----\n${ALIPAY_PUBLIC_KEY}\n-----END PUBLIC KEY-----`;

  return verify.verify(publicKey, signature, 'base64');
}

/**
 * 파라미터 정렬 및 문자열 생성
 */
function buildSortedQueryString(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
}

/**
 * API 요청용 공통 파라미터 생성
 */
function getCommonParams(method: string): Record<string, string> {
  return {
    app_id: ALIPAY_APP_ID,
    method,
    format: 'JSON',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    version: '1.0',
  };
}

/**
 * PC 웹 결제 생성 (Form POST 방식)
 */
export function createWebPayment(request: AlipayOrderRequest): string {
  const method = 'alipay.trade.page.pay';

  const bizContent = {
    out_trade_no: request.outTradeNo,
    total_amount: request.totalAmount,
    subject: request.subject,
    body: request.body || request.subject,
    product_code: 'FAST_INSTANT_TRADE_PAY',
  };

  const params: Record<string, string> = {
    ...getCommonParams(method),
    return_url: request.returnUrl,
    notify_url: request.notifyUrl,
    biz_content: JSON.stringify(bizContent),
  };

  // 서명 생성
  const signContent = buildSortedQueryString(params);
  params.sign = signWithRSA2(signContent);

  // Form HTML 생성
  const formInputs = Object.entries(params)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`)
    .join('\n');

  return `
    <form id="alipay-form" action="${ALIPAY_GATEWAY}" method="POST">
      ${formInputs}
    </form>
    <script>document.getElementById('alipay-form').submit();</script>
  `;
}

/**
 * 모바일 웹 결제 생성
 */
export function createWapPayment(request: AlipayOrderRequest): string {
  const method = 'alipay.trade.wap.pay';

  const bizContent = {
    out_trade_no: request.outTradeNo,
    total_amount: request.totalAmount,
    subject: request.subject,
    body: request.body || request.subject,
    product_code: 'QUICK_WAP_WAY',
  };

  const params: Record<string, string> = {
    ...getCommonParams(method),
    return_url: request.returnUrl,
    notify_url: request.notifyUrl,
    biz_content: JSON.stringify(bizContent),
  };

  // 서명 생성
  const signContent = buildSortedQueryString(params);
  params.sign = signWithRSA2(signContent);

  // URL 생성
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${ALIPAY_GATEWAY}?${queryString}`;
}

/**
 * 결제 상태 조회
 */
export async function queryPayment(outTradeNo: string): Promise<AlipayQueryResponse> {
  const method = 'alipay.trade.query';

  const bizContent = {
    out_trade_no: outTradeNo,
  };

  const params: Record<string, string> = {
    ...getCommonParams(method),
    biz_content: JSON.stringify(bizContent),
  };

  // 서명 생성
  const signContent = buildSortedQueryString(params);
  params.sign = signWithRSA2(signContent);

  const response = await fetch(`${ALIPAY_GATEWAY}?${new URLSearchParams(params)}`, {
    method: 'GET',
  });

  const result = await response.json();
  return result.alipay_trade_query_response;
}

/**
 * 환불 요청
 */
export async function refundPayment(request: AlipayRefundRequest): Promise<any> {
  const method = 'alipay.trade.refund';

  const bizContent = {
    trade_no: request.tradeNo,
    out_trade_no: request.outTradeNo,
    refund_amount: request.refundAmount,
    refund_reason: request.refundReason,
    out_request_no: request.outRequestNo,
  };

  const params: Record<string, string> = {
    ...getCommonParams(method),
    biz_content: JSON.stringify(bizContent),
  };

  // 서명 생성
  const signContent = buildSortedQueryString(params);
  params.sign = signWithRSA2(signContent);

  const response = await fetch(`${ALIPAY_GATEWAY}?${new URLSearchParams(params)}`, {
    method: 'GET',
  });

  const result = await response.json();
  return result.alipay_trade_refund_response;
}

/**
 * 웹훅 서명 검증
 */
export function verifyWebhookSignature(params: Record<string, string>): boolean {
  const sign = params.sign;
  const signType = params.sign_type;

  if (!sign || signType !== 'RSA2') {
    return false;
  }

  // sign, sign_type 제외한 파라미터로 검증
  const filteredParams = { ...params };
  delete filteredParams.sign;
  delete filteredParams.sign_type;

  const content = buildSortedQueryString(filteredParams);
  return verifyWithRSA2(content, sign);
}

/**
 * 알리페이 결제 상태 매핑
 */
export function mapAlipayStatusToInternal(
  status: string
): 'PENDING' | 'ESCROW_HELD' | 'COMPLETED' | 'FAILED' | 'REFUNDED' {
  switch (status) {
    case 'WAIT_BUYER_PAY':
      return 'PENDING';
    case 'TRADE_SUCCESS':
    case 'TRADE_FINISHED':
      return 'ESCROW_HELD';
    case 'TRADE_CLOSED':
      return 'FAILED';
    default:
      return 'PENDING';
  }
}

/**
 * HTML 이스케이프
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export type { AlipayOrderRequest, AlipayOrderResponse, AlipayQueryResponse, AlipayRefundRequest };
