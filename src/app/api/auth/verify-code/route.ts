import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '전화번호와 인증번호를 입력해주세요.' },
        },
        { status: 400 }
      );
    }

    // 저장된 인증 코드 조회
    const verification = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      // 개발 환경에서 테스트 코드 허용
      if (process.env.NODE_ENV === 'development' && code === '123456') {
        return NextResponse.json({
          success: true,
          message: '인증이 완료되었습니다.',
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: { message: '인증번호가 일치하지 않거나 만료되었습니다.' },
        },
        { status: 400 }
      );
    }

    // 인증 성공 시 코드 삭제
    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      success: true,
      message: '인증이 완료되었습니다.',
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: '인증 중 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
