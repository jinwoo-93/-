import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 구매대행 요청 상세 조회
 * GET /api/purchase-requests/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const requestId = params.id;

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
      include: {
        offers: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '요청을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 요청자 정보
    const requester = await prisma.user.findUnique({
      where: { id: purchaseRequest.requesterId },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    // 제안자 정보
    const sellerIds = Array.from(new Set(purchaseRequest.offers.map((o) => o.sellerId)));
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        hasExcellentBadge: true,
        isBusinessVerified: true,
        averageRating: true,
        totalSales: true,
      },
    });

    const sellersMap = new Map(sellers.map((s) => [s.id, s]));

    return NextResponse.json({
      success: true,
      data: {
        ...purchaseRequest,
        requester,
        offers: purchaseRequest.offers.map((offer) => ({
          ...offer,
          seller: sellersMap.get(offer.sellerId),
        })),
      },
    });
  } catch (error) {
    console.error('Get purchase request error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 구매대행 요청 상태 변경
 * PATCH /api/purchase-requests/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const requestId = params.id;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '요청을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (purchaseRequest.requesterId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, offerId } = body;

    const updateData: any = {};

    switch (action) {
      case 'cancel':
        updateData.status = 'CANCELLED';
        break;
      case 'selectOffer':
        if (!offerId) {
          return NextResponse.json(
            { success: false, error: { code: 'VALIDATION_ERROR', message: '제안 ID가 필요합니다.' } },
            { status: 400 }
          );
        }

        // 제안 수락
        await prisma.$transaction([
          prisma.purchaseOffer.update({
            where: { id: offerId },
            data: { status: 'ACCEPTED' },
          }),
          prisma.purchaseOffer.updateMany({
            where: {
              requestId,
              id: { not: offerId },
            },
            data: { status: 'REJECTED' },
          }),
        ]);

        updateData.status = 'IN_PROGRESS';
        updateData.selectedOfferId = offerId;
        break;
      case 'complete':
        updateData.status = 'COMPLETED';
        break;
    }

    const updatedRequest = await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error('Update purchase request error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '업데이트 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
