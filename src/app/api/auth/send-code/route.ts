import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiRateLimits } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '전화번호를 입력해주세요.' },
        },
        { status: 400 }
      );
    }

    // Rate limiting: 1분에 1회
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const { success: rateLimitSuccess } = await apiRateLimits.sms.limit(`sms:${ip}`);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '너무 많은 요청입니다. 1분 후 다시 시도해주세요.' },
        },
        { status: 429 }
      );
    }

    // 인증 코드 생성 (6자리)
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 기존 인증 코드 삭제
    await prisma.verificationCode.deleteMany({
      where: { phone },
    });

    // 새 인증 코드 저장 (5분 유효)
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // TODO: 실제 SMS 발송 로직 구현
    // await sendSMS(phone, `[직구역구] 인증번호: ${code}`);

    console.log(`[DEV] Verification code for ${phone}: ${code}`);

    return NextResponse.json({
      success: true,
      message: '인증번호가 발송되었습니다.',
      // 개발 환경에서만 코드 노출
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: '인증번호 발송 중 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
