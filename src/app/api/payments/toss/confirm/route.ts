import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import {
  confirmPayment,
  mapTossStatusToInternal,
  mapTossMethodToInternal,
} from '@/lib/payments/toss';

/**
 * 토스페이먼츠 결제 승인
 * 클라이언트에서 결제 완료 후 호출됩니다.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 정보가 누락되었습니다.' } },
        { status: 400 }
      );
    }

    // 주문 조회 (orderNumber로 조회)
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderId },
      include: {
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '결제 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 금액 검증
    if (Math.round(order.totalKRW) !== amount) {
      return NextResponse.json(
        { success: false, error: { code: 'AMOUNT_MISMATCH', message: '결제 금액이 일치하지 않습니다.' } },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 승인 요청
    const tossResponse = await confirmPayment({
      paymentKey,
      orderId,
      amount,
    });

    // 결제 상태 업데이트
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: {
        status: mapTossStatusToInternal(tossResponse.status),
        paymentMethod: mapTossMethodToInternal(tossResponse.method),
        transactionId: tossResponse.paymentKey,
      },
    });

    // 주문 상태 업데이트
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // 판매자에게 알림
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'PAYMENT',
        title: '새 주문이 결제되었습니다',
        message: `주문번호 ${order.orderNumber}의 결제가 완료되었습니다. 상품을 발송해주세요.`,
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentKey: tossResponse.paymentKey,
        status: tossResponse.status,
        method: tossResponse.method,
        amount: tossResponse.totalAmount,
        approvedAt: tossResponse.approvedAt,
        receipt: tossResponse.receipt?.url,
      },
    });
  } catch (error) {
    console.error('Toss payment confirm error:', error);

    const message = error instanceof Error ? error.message : '결제 승인에 실패했습니다.';

    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_FAILED', message } },
      { status: 500 }
    );
  }
}
