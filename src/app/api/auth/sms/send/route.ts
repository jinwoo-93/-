import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationSMS, normalizePhoneNumber, detectCountry } from '@/lib/sms';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  phone: z.string().min(10, '전화번호가 너무 짧습니다.'),
  country: z.enum(['KR', 'CN']).optional(),
});

/**
 * SMS 인증 코드 발송
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 검증
    const validated = requestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validated.error.errors[0]?.message || '잘못된 요청입니다.',
          },
        },
        { status: 400 }
      );
    }

    const { phone, country } = validated.data;

    // 국가 감지
    const detectedCountry = country || detectCountry(phone);
    if (detectedCountry === 'UNKNOWN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_PHONE',
            message: '지원하지 않는 전화번호 형식입니다. 한국(+82) 또는 중국(+86) 번호만 사용 가능합니다.',
          },
        },
        { status: 400 }
      );
    }

    // 전화번호 정규화
    const normalizedPhone = normalizePhoneNumber(phone, detectedCountry);

    // SMS 발송
    const result = await sendVerificationSMS(normalizedPhone, detectedCountry);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SMS_SEND_FAILED',
            message: result.error || 'SMS 발송에 실패했습니다.',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        phone: normalizedPhone,
        country: detectedCountry,
        expiresIn: 300, // 5분
      },
    });
  } catch (error) {
    console.error('[SMS Send] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}
