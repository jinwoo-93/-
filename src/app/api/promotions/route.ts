import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

/**
 * GET /api/promotions
 * 판매자의 프로모션 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, apiLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
        },
        { status: 401 }
      );
    }

    // 판매자 권한 확인
    if (session.user.userType !== 'SELLER' && session.user.userType !== 'BOTH') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '판매자 권한이 필요합니다' },
        },
        { status: 403 }
      );
    }

    const promotions = await prisma.promotion.findMany({
      where: {
        sellerId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: promotions,
    });
  } catch (error) {
    console.error('GET /api/promotions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promotions
 * 프로모션 생성
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, apiLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
        },
        { status: 401 }
      );
    }

    // 판매자 권한 확인
    if (session.user.userType !== 'SELLER' && session.user.userType !== 'BOTH') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '판매자 권한이 필요합니다' },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // 유효성 검사
    if (!body.type || !body.title || !body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '필수 항목을 입력해주세요' },
        },
        { status: 400 }
      );
    }

    // 종료일이 시작일보다 이후인지 확인
    if (new Date(body.startDate) >= new Date(body.endDate)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '종료일은 시작일보다 이후여야 합니다' },
        },
        { status: 400 }
      );
    }

    // 타입별 필수 필드 검증
    if (body.type === 'DISCOUNT' && !body.discountRate && !body.discountAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '할인율 또는 할인 금액을 입력해주세요',
          },
        },
        { status: 400 }
      );
    }

    if (body.type === 'BUNDLE' && (!body.bundlePostIds || !body.bundlePrice)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '묶음 상품 ID와 가격을 입력해주세요',
          },
        },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        sellerId: session.user.id,
        type: body.type,
        title: body.title,
        titleZh: body.titleZh,
        description: body.description,
        descriptionZh: body.descriptionZh,
        discountRate: body.discountRate,
        discountAmount: body.discountAmount,
        minPurchase: body.minPurchase,
        bundlePostIds: body.bundlePostIds || [],
        bundlePrice: body.bundlePrice,
        targetPostIds: body.targetPostIds || [],
        categoryIds: body.categoryIds || [],
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error('POST /api/promotions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
