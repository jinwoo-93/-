/**
 * SMS 인증 시스템
 * - 한국: CoolSMS
 * - 중국: 알리바바 클라우드 SMS
 */

import crypto from 'crypto';

// 인증 코드 저장소 (프로덕션에서는 Redis 사용 권장)
const verificationCodes = new Map<
  string,
  { code: string; expiresAt: number; attempts: number }
>();

// 인증 코드 설정
const CODE_LENGTH = 6;
const CODE_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const COOLDOWN_MINUTES = 1;

// 최근 요청 기록 (Rate limiting)
const recentRequests = new Map<string, number>();

/**
 * 6자리 인증 코드 생성
 */
export function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * 전화번호 정규화
 */
export function normalizePhoneNumber(phone: string, country: 'KR' | 'CN'): string {
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');

  if (country === 'KR') {
    // 한국 번호: 010-1234-5678 -> +82-10-1234-5678
    if (digits.startsWith('82')) {
      return `+${digits}`;
    }
    if (digits.startsWith('0')) {
      return `+82${digits.slice(1)}`;
    }
    return `+82${digits}`;
  }

  if (country === 'CN') {
    // 중국 번호: 13812345678 -> +86-138-1234-5678
    if (digits.startsWith('86')) {
      return `+${digits}`;
    }
    return `+86${digits}`;
  }

  return phone;
}

/**
 * 전화번호 국가 감지
 */
export function detectCountry(phone: string): 'KR' | 'CN' | 'UNKNOWN' {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('82') || digits.startsWith('010') || digits.startsWith('011')) {
    return 'KR';
  }

  if (digits.startsWith('86') || digits.startsWith('1')) {
    // 중국 휴대폰은 1로 시작 (13x, 14x, 15x, 17x, 18x, 19x)
    const mobilePrefix = digits.startsWith('86') ? digits.slice(2, 4) : digits.slice(0, 2);
    if (['13', '14', '15', '17', '18', '19'].includes(mobilePrefix)) {
      return 'CN';
    }
  }

  return 'UNKNOWN';
}

/**
 * Rate limiting 체크
 */
export function checkRateLimit(phone: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const lastRequest = recentRequests.get(phone);

  if (lastRequest) {
    const elapsed = now - lastRequest;
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;

    if (elapsed < cooldownMs) {
      return {
        allowed: false,
        waitSeconds: Math.ceil((cooldownMs - elapsed) / 1000),
      };
    }
  }

  return { allowed: true };
}

/**
 * 인증 코드 저장
 */
export function storeVerificationCode(phone: string, code: string): void {
  const normalizedPhone = phone.replace(/\D/g, '');
  const expiresAt = Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000;

  verificationCodes.set(normalizedPhone, {
    code,
    expiresAt,
    attempts: 0,
  });

  recentRequests.set(normalizedPhone, Date.now());

  // 만료된 코드 정리 (메모리 누수 방지)
  setTimeout(() => {
    verificationCodes.delete(normalizedPhone);
  }, CODE_EXPIRY_MINUTES * 60 * 1000 + 1000);
}

/**
 * 인증 코드 검증
 */
export function verifyCode(
  phone: string,
  code: string
): { success: boolean; error?: string } {
  const normalizedPhone = phone.replace(/\D/g, '');
  const stored = verificationCodes.get(normalizedPhone);

  if (!stored) {
    return { success: false, error: '인증 코드가 만료되었거나 존재하지 않습니다.' };
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(normalizedPhone);
    return { success: false, error: '인증 코드가 만료되었습니다.' };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    verificationCodes.delete(normalizedPhone);
    return { success: false, error: '인증 시도 횟수를 초과했습니다. 다시 요청해주세요.' };
  }

  if (stored.code !== code) {
    stored.attempts++;
    return {
      success: false,
      error: `인증 코드가 일치하지 않습니다. (${MAX_ATTEMPTS - stored.attempts}회 남음)`,
    };
  }

  // 성공 시 코드 삭제
  verificationCodes.delete(normalizedPhone);
  return { success: true };
}

/**
 * CoolSMS로 SMS 발송 (한국)
 */
export async function sendSMSViaCoolSMS(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const sender = process.env.COOLSMS_SENDER_NUMBER;

  if (!apiKey || !apiSecret || !sender) {
    console.error('[SMS] CoolSMS credentials not configured');
    return { success: false, error: 'SMS 서비스가 설정되지 않았습니다.' };
  }

  try {
    const timestamp = Date.now().toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(timestamp + salt)
      .digest('hex');

    const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({
        message: {
          to: phone.replace(/\D/g, ''),
          from: sender,
          text: `[직구역구] 인증번호는 [${code}]입니다. 5분 내에 입력해주세요.`,
        },
      }),
    });

    const result = await response.json();

    if (result.statusCode && result.statusCode !== '2000') {
      throw new Error(result.statusMessage || 'SMS 발송 실패');
    }

    return { success: true };
  } catch (error) {
    console.error('[SMS] CoolSMS error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS 발송에 실패했습니다.',
    };
  }
}

/**
 * 알리바바 클라우드 SMS 발송 (중국)
 */
export async function sendSMSViaAliyun(
  phone: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const signName = process.env.ALIYUN_SMS_SIGN_NAME;
  const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE;

  if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
    console.error('[SMS] Aliyun credentials not configured');
    return { success: false, error: '短信服务未配置' };
  }

  try {
    // 알리바바 클라우드 SMS API 호출
    const timestamp = new Date().toISOString().replace(/\.\d{3}/, '');
    const nonce = crypto.randomUUID();

    const params: Record<string, string> = {
      AccessKeyId: accessKeyId,
      Action: 'SendSms',
      Format: 'JSON',
      PhoneNumbers: phone.replace(/\D/g, '').replace(/^86/, ''),
      SignName: signName,
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: nonce,
      SignatureVersion: '1.0',
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code }),
      Timestamp: timestamp,
      Version: '2017-05-25',
    };

    // 서명 생성
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const stringToSign = `POST&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
    const signature = crypto
      .createHmac('sha1', `${accessKeySecret}&`)
      .update(stringToSign)
      .digest('base64');

    params.Signature = signature;

    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params).toString(),
    });

    const result = await response.json();

    if (result.Code !== 'OK') {
      throw new Error(result.Message || '短信发送失败');
    }

    return { success: true };
  } catch (error) {
    console.error('[SMS] Aliyun error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '短信发送失败',
    };
  }
}

/**
 * SMS 발송 (자동 국가 감지)
 */
export async function sendVerificationSMS(
  phone: string,
  country?: 'KR' | 'CN'
): Promise<{ success: boolean; error?: string }> {
  // Rate limiting 체크
  const rateLimit = checkRateLimit(phone);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `${rateLimit.waitSeconds}초 후에 다시 시도해주세요.`,
    };
  }

  // 국가 감지
  const detectedCountry = country || detectCountry(phone);
  if (detectedCountry === 'UNKNOWN') {
    return { success: false, error: '지원하지 않는 전화번호 형식입니다.' };
  }

  // 인증 코드 생성 및 저장
  const code = generateVerificationCode();
  storeVerificationCode(phone, code);

  // SMS 발송
  if (detectedCountry === 'KR') {
    return sendSMSViaCoolSMS(phone, code);
  } else {
    return sendSMSViaAliyun(phone, code);
  }
}
