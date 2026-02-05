import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { orderShipSchema } from '@/lib/validations';

// 발송 처리
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { sellerId: true, status: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (order.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '발송 처리 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    if (order.status !== 'PAID') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '결제 완료된 주문만 발송할 수 있습니다.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = orderShipSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { trackingNumber, shippingCompanyId, preShipPhotos } = validated.data;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        trackingNumber,
        shippingCompanyId,
        preShipPhotos,
        status: 'SHIPPING',
        shippedAt: new Date(),
      },
      include: {
        shippingCompany: {
          select: {
            id: true,
            name: true,
            nameZh: true,
          },
        },
      },
    });

    // 구매자에게 알림 생성
    await prisma.notification.create({
      data: {
        userId: updatedOrder.buyerId,
        type: 'SHIPPING',
        title: '상품이 발송되었습니다',
        message: `주문번호 ${updatedOrder.orderNumber}의 상품이 발송되었습니다. 운송장: ${trackingNumber}`,
        link: `/orders/${params.id}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Order ship error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
