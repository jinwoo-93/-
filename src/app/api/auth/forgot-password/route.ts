import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes, createHash } from 'crypto';
import { sendSMS } from '@/lib/sms';

/**
 * 비밀번호 재설정 요청 (인증번호 발송)
 * POST /api/auth/forgot-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, phoneCountry = 'KR' } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '휴대폰 번호를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await prisma.user.findFirst({
      where: {
        phone,
        phoneCountry,
      },
      select: { id: true, phone: true },
    });

    if (!user) {
      // 보안을 위해 사용자 존재 여부를 알려주지 않음
      return NextResponse.json({
        success: true,
        data: { message: '등록된 휴대폰 번호인 경우 인증번호가 발송됩니다.' },
      });
    }

    // 인증번호 생성 (6자리)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 토큰 생성 (나중에 인증번호 검증시 사용)
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    // 기존 토큰 삭제
    await prisma.verificationToken.deleteMany({
      where: { identifier: phone },
    });

    // 새 토큰 저장 (10분 유효)
    await prisma.verificationToken.create({
      data: {
        identifier: phone,
        token: tokenHash,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10분
      },
    });

    // SMS 발송
    const fullPhone = phoneCountry === 'CN' ? `+86${phone}` : `+82${phone}`;
    const message = phoneCountry === 'CN'
      ? `[直购易购] 您的验证码是 ${verificationCode}。有效期10分钟。`
      : `[직구역구] 인증번호는 ${verificationCode}입니다. 10분 내에 입력해주세요.`;

    try {
      await sendSMS(fullPhone, message);
    } catch (smsError) {
      console.error('SMS send error:', smsError);
      // 개발 환경에서는 콘솔에 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('Verification code:', verificationCode);
      }
    }

    // 인증번호를 토큰에 포함 (개발 환경에서만)
    const responseData: any = {
      message: '인증번호가 발송되었습니다.',
      token,
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.code = verificationCode;
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
