import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 필터 조건 구성
    const where: any = {};

    if (category) {
      where.category = category;
    }

    // 설정 목록 조회
    const settings = await prisma.systemSetting.findMany({
      where,
      orderBy: {
        key: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '설정 조회에 실패했습니다.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { key, value, category, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'key와 value는 필수입니다.' } },
        { status: 400 }
      );
    }

    // 설정 저장 (upsert)
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value,
        updatedBy: session.user.id,
      },
      create: {
        key,
        value,
        category: category || 'PLATFORM',
        description,
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error('Failed to update setting:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '설정 저장에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
