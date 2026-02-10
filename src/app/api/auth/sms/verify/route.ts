import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { verifyCode } from '@/lib/sms';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  phone: z.string().min(10, '전화번호가 너무 짧습니다.'),
  code: z.string().length(6, '인증 코드는 6자리입니다.'),
});

/**
 * SMS 인증 코드 확인
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

    const { phone, code } = validated.data;

    // 인증 코드 검증
    const result = verifyCode(phone, code);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: result.error || '인증에 실패했습니다.',
          },
        },
        { status: 400 }
      );
    }

    // 로그인된 사용자인 경우 전화번호 업데이트
    const session = await auth();
    if (session?.user?.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          phone: phone.replace(/\D/g, ''),
          phoneVerified: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        phone: phone.replace(/\D/g, ''),
      },
    });
  } catch (error) {
    console.error('[SMS Verify] Error:', error);
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
