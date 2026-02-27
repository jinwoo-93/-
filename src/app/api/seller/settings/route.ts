import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 판매자 설정 조회
export async function GET(request: NextRequest) {
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nickname: true,
        profileImage: true,
        businessNumber: true,
        businessName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    // TODO: User 모델에 다음 필드 추가 필요:
    // - introduction (판매자 소개)
    // - notificationEmail, notificationOrder, notificationSettlement (알림 설정)
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        introduction: null,
        notificationEmail: true,
        notificationOrder: true,
        notificationSettlement: true,
      }
    });
  } catch (error) {
    console.error('Seller settings GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}

// 판매자 설정 수정
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
    const { nickname, bankName, accountNumber, accountHolder } = body;

    // TODO: User 모델에 다음 필드 추가 필요:
    // - introduction (판매자 소개)
    // - notificationEmail, notificationOrder, notificationSettlement (알림 설정)

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(nickname && { nickname }),
        ...(bankName && { bankName }),
        ...(accountNumber && { accountNumber }),
        ...(accountHolder && { accountHolder }),
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Seller settings PATCH error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
