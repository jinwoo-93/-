import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 사용자 언어 설정 변경
 * PATCH /api/users/me/language
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language } = body;

    // TODO: Prisma Language enum에 'EN' 추가 필요
    if (!['KO', 'ZH', 'EN'].includes(language)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '지원하지 않는 언어입니다.' },
        },
        { status: 400 }
      );
    }

    // 사용자 언어 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        language: language as 'KO' | 'ZH', // TODO: 'EN' 추가 후 수정
      },
      select: {
        id: true,
        language: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('User language PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
