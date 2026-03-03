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
    const status = searchParams.get('status');
    const placement = searchParams.get('placement');

    // 필터 조건 구성
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (placement) {
      where.placement = placement;
    }

    // 광고 목록 조회
    const ads = await prisma.advertisement.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error('Failed to fetch ads:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '광고 목록 조회에 실패했습니다.' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const {
      title,
      titleZh,
      description,
      imageUrl,
      linkUrl,
      placement,
      startDate,
      endDate,
      budget,
      targetCountry,
      targetUserType,
    } = body;

    // 유효성 검사
    if (!title || !imageUrl || !linkUrl || !placement || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '필수 항목을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 광고 생성
    const ad = await prisma.advertisement.create({
      data: {
        title,
        titleZh,
        description,
        imageUrl,
        linkUrl,
        placement,
        status: 'DRAFT',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        targetCountry,
        targetUserType,
      },
    });

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error('Failed to create ad:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '광고 생성에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
