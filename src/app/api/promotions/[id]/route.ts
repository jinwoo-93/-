import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

/**
 * GET /api/promotions/[id]
 * 프로모션 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '프로모션을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    // 권한 확인 (판매자 본인만)
    if (promotion.sellerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '권한이 없습니다' },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error('GET /api/promotions/[id] error:', error);
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
 * PATCH /api/promotions/[id]
 * 프로모션 수정 (활성화/비활성화 포함)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '프로모션을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (promotion.sellerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '권한이 없습니다' },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updatedPromotion = await prisma.promotion.update({
      where: {
        id: params.id,
      },
      data: {
        ...(body.type && { type: body.type }),
        ...(body.title && { title: body.title }),
        ...(body.titleZh !== undefined && { titleZh: body.titleZh }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.descriptionZh !== undefined && { descriptionZh: body.descriptionZh }),
        ...(body.discountRate !== undefined && { discountRate: body.discountRate }),
        ...(body.discountAmount !== undefined && { discountAmount: body.discountAmount }),
        ...(body.minPurchase !== undefined && { minPurchase: body.minPurchase }),
        ...(body.bundlePostIds !== undefined && { bundlePostIds: body.bundlePostIds }),
        ...(body.bundlePrice !== undefined && { bundlePrice: body.bundlePrice }),
        ...(body.targetPostIds !== undefined && { targetPostIds: body.targetPostIds }),
        ...(body.categoryIds !== undefined && { categoryIds: body.categoryIds }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPromotion,
    });
  } catch (error) {
    console.error('PATCH /api/promotions/[id] error:', error);
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
 * DELETE /api/promotions/[id]
 * 프로모션 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!promotion) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '프로모션을 찾을 수 없습니다' },
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (promotion.sellerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '권한이 없습니다' },
        },
        { status: 403 }
      );
    }

    await prisma.promotion.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: '프로모션이 삭제되었습니다' },
    });
  } catch (error) {
    console.error('DELETE /api/promotions/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
