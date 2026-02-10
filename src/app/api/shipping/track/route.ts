import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';
import { trackShipment, SHIPPING_CARRIERS, CarrierCode } from '@/lib/shipping';

export const dynamic = 'force-dynamic';

/**
 * 배송 추적 조회
 * GET /api/shipping/track?trackingNumber=xxx&carrier=CJ
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const carrier = searchParams.get('carrier') as CarrierCode | null;

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '운송장 번호가 필요합니다.' } },
        { status: 400 }
      );
    }

    const result = await trackShipment(trackingNumber, carrier || undefined);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    console.error('Shipping track error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '배송 추적 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 주문의 배송 추적 조회
 * POST /api/shipping/track
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '주문 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingCompany: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 권한 확인 (구매자 또는 판매자만)
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 운송장 번호 확인
    if (!order.trackingNumber) {
      return NextResponse.json({
        success: true,
        data: {
          hasTracking: false,
          message: '아직 배송 정보가 등록되지 않았습니다.',
        },
      });
    }

    // 배송 추적
    const result = await trackShipment(order.trackingNumber);

    return NextResponse.json({
      success: true,
      data: {
        hasTracking: true,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          trackingNumber: order.trackingNumber,
          shippingCompany: order.shippingCompany ? {
            name: order.shippingCompany.name,
            nameZh: order.shippingCompany.nameZh,
          } : null,
        },
        tracking: result,
      },
    });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '배송 추적 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
