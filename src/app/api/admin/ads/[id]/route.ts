import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    // 광고 조회
    const ad = await prisma.advertisement.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '광고를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error('Failed to fetch ad:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '광고 조회에 실패했습니다.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 광고 업데이트
    const ad = await prisma.advertisement.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error('Failed to update ad:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '광고 수정에 실패했습니다.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    // 광고 삭제
    await prisma.advertisement.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '광고가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Failed to delete ad:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '광고 삭제에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
