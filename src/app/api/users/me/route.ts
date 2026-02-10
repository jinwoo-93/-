import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { userProfileSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// 내 정보 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        phoneCountry: true,
        name: true,
        nickname: true,
        profileImage: true,
        userType: true,
        country: true,
        language: true,
        isPhoneVerified: true,
        isIdentityVerified: true,
        isBusinessVerified: true,
        hasExcellentBadge: true,
        totalSales: true,
        totalPurchases: true,
        averageRating: true,
        disputeRate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('User me GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 내 정보 수정 (PUT)
export async function PUT(request: NextRequest) {
  return PATCH(request);
}

// 내 정보 수정
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = userProfileSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    // 닉네임 중복 확인
    if (validated.data.nickname) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname: validated.data.nickname,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_NICKNAME', message: '이미 사용 중인 닉네임입니다.' } },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validated.data,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        nickname: true,
        profileImage: true,
        userType: true,
        country: true,
        language: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('User me PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
