import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 구매대행 제안 등록
 * POST /api/purchase-requests/[id]/offers
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const requestId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 요청 확인
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id: requestId },
    });

    if (!purchaseRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '요청을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (purchaseRequest.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '더 이상 제안을 받지 않는 요청입니다.' } },
        { status: 400 }
      );
    }

    // 본인 요청에는 제안 불가
    if (purchaseRequest.requesterId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '본인 요청에는 제안할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 이미 제안했는지 확인
    const existingOffer = await prisma.purchaseOffer.findUnique({
      where: {
        requestId_sellerId: {
          requestId,
          sellerId: session.user.id,
        },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: '이미 제안한 요청입니다.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      priceKRW,
      priceCNY,
      shippingFeeKRW,
      shippingFeeCNY,
      estimatedDays,
      message,
      messageZh,
    } = body;

    if (!priceKRW || !estimatedDays) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '가격과 예상 소요일을 입력해주세요.' } },
        { status: 400 }
      );
    }

    const offer = await prisma.purchaseOffer.create({
      data: {
        requestId,
        sellerId: session.user.id,
        priceKRW,
        priceCNY: priceCNY || priceKRW / 185,
        shippingFeeKRW: shippingFeeKRW || 0,
        shippingFeeCNY: shippingFeeCNY || (shippingFeeKRW || 0) / 185,
        estimatedDays,
        message,
        messageZh,
      },
    });

    // 요청자에게 알림
    try {
      await prisma.notification.create({
        data: {
          userId: purchaseRequest.requesterId,
          type: 'SYSTEM',
          title: '새 구매대행 제안',
          message: `"${purchaseRequest.productName}" 요청에 새 제안이 등록되었습니다.`,
          link: `/purchase-requests/${requestId}`,
        },
      });
    } catch (notificationError) {
      console.error('Failed to create offer notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error('Create purchase offer error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '제안 등록 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
