// SMS 발송 라이브러리
// TODO: 실제 SMS 서비스 연동 필요 (예: NHN Cloud, Aligo 등)

type Country = 'KR' | 'CN' | 'UNKNOWN';

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// 인증 코드 저장소 (실제 서비스에서는 Redis 등 사용)
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>();

/**
 * SMS 발송 함수
 * 현재는 개발용 stub으로 구현되어 있습니다.
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS] To: ${to}, Message: ${message}`);
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  // TODO: 실제 SMS API 연동
  console.log(`[SMS] Would send to ${to}: ${message}`);
  return { success: true, messageId: 'stub-' + Date.now() };
}

/**
 * 인증번호 생성 함수
 */
export function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

/**
 * 국가 감지 함수
 */
export function detectCountry(phone: string): Country {
  const cleaned = phone.replace(/\D/g, '');

  // 국제 번호 형식
  if (cleaned.startsWith('82')) return 'KR';
  if (cleaned.startsWith('86')) return 'CN';

  // 국내 형식 (한국: 010, 중국: 1로 시작)
  if (cleaned.startsWith('010') || cleaned.startsWith('011')) return 'KR';
  if (cleaned.startsWith('1') && cleaned.length === 11) return 'CN';

  // 0으로 시작하면 한국으로 추정
  if (cleaned.startsWith('0')) return 'KR';

  return 'UNKNOWN';
}

/**
 * 전화번호 정규화
 */
export function normalizePhoneNumber(phone: string, country: Country): string {
  const cleaned = phone.replace(/\D/g, '');

  if (country === 'KR') {
    // 한국 번호 정규화
    if (cleaned.startsWith('82')) {
      return '+82' + cleaned.slice(2);
    }
    if (cleaned.startsWith('0')) {
      return '+82' + cleaned.slice(1);
    }
    return '+82' + cleaned;
  }

  if (country === 'CN') {
    // 중국 번호 정규화
    if (cleaned.startsWith('86')) {
      return '+86' + cleaned.slice(2);
    }
    return '+86' + cleaned;
  }

  return cleaned;
}

/**
 * 인증 SMS 발송
 */
export async function sendVerificationSMS(
  phone: string,
  country: Country
): Promise<SMSResult> {
  const code = generateVerificationCode();

  // 인증 코드 저장 (5분 유효)
  verificationCodes.set(phone, {
    code,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // 메시지 생성
  const message = country === 'CN'
    ? `[直购易购] 您的验证码是 ${code}。有效期5分钟。`
    : `[직구역구] 인증번호는 ${code}입니다. 5분 내에 입력해주세요.`;

  // SMS 발송
  const result = await sendSMS(phone, message);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS] Verification code for ${phone}: ${code}`);
  }

  return result;
}

/**
 * 인증 코드 검증
 */
export function verifyCode(phone: string, code: string): { success: boolean; error?: string } {
  const normalizedPhone = normalizePhoneNumber(phone, detectCountry(phone));
  const stored = verificationCodes.get(normalizedPhone) || verificationCodes.get(phone);

  if (!stored) {
    // 개발 환경에서는 항상 성공
    if (process.env.NODE_ENV !== 'production') {
      return { success: true };
    }
    return { success: false, error: '인증 코드가 존재하지 않습니다.' };
  }

  if (new Date() > stored.expiresAt) {
    verificationCodes.delete(normalizedPhone);
    verificationCodes.delete(phone);
    return { success: false, error: '인증 코드가 만료되었습니다.' };
  }

  if (stored.code !== code) {
    return { success: false, error: '인증 코드가 일치하지 않습니다.' };
  }

  // 인증 성공 시 코드 삭제
  verificationCodes.delete(normalizedPhone);
  verificationCodes.delete(phone);

  return { success: true };
}
