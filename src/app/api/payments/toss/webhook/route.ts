import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getPayment,
  mapTossStatusToInternal,
  mapTossMethodToInternal,
} from '@/lib/payments/toss';

/**
 * 토스페이먼츠 웹훅
 * 가상계좌 입금 완료 등의 이벤트를 처리합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, data } = body;

    console.log('[Toss Webhook] Event:', eventType, data);

    switch (eventType) {
      // 가상계좌 입금 완료
      case 'DEPOSIT_CALLBACK': {
        const { orderId, status, secret } = data;

        // Webhook Secret 검증
        if (secret !== process.env.TOSS_WEBHOOK_SECRET) {
          return NextResponse.json(
            { success: false, error: 'Invalid webhook secret' },
            { status: 401 }
          );
        }

        if (status === 'DONE') {
          // 주문 조회
          const order = await prisma.order.findFirst({
            where: { orderNumber: orderId },
          });

          if (order) {
            // 결제 상태 업데이트
            await prisma.payment.updateMany({
              where: { orderId: order.id },
              data: {
                status: 'ESCROW_HELD',
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
                message: `주문번호 ${order.orderNumber}의 입금이 확인되었습니다. 상품을 발송해주세요.`,
                link: `/orders/${order.id}`,
              },
            });

            // 구매자에게 알림
            await prisma.notification.create({
              data: {
                userId: order.buyerId,
                type: 'PAYMENT',
                title: '입금이 확인되었습니다',
                message: `주문번호 ${order.orderNumber}의 입금이 확인되었습니다.`,
                link: `/orders/${order.id}`,
              },
            });
          }
        }
        break;
      }

      // 결제 취소/환불
      case 'PAYMENT_STATUS_CHANGED': {
        const { paymentKey, status } = data;

        if (status === 'CANCELED' || status === 'PARTIAL_CANCELED') {
          // 결제 정보 조회
          const tossPayment = await getPayment(paymentKey);

          const payment = await prisma.payment.findFirst({
            where: { transactionId: paymentKey },
            include: { order: true },
          });

          if (payment) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: mapTossStatusToInternal(status),
              },
            });

            // 주문 상태도 업데이트
            if (status === 'CANCELED') {
              await prisma.order.update({
                where: { id: payment.orderId },
                data: {
                  status: 'REFUNDED',
                },
              });
            }
          }
        }
        break;
      }

      default:
        console.log(`[Toss Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Toss Webhook] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
