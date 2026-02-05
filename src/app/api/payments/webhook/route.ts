import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature missing' } },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // 결제 상태 업데이트
          await prisma.payment.updateMany({
            where: { orderId },
            data: {
              status: 'ESCROW_HELD',
              transactionId: paymentIntent.id,
            },
          });

          // 주문 상태 업데이트
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          // 판매자에게 알림
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { sellerId: true, orderNumber: true },
          });

          if (order) {
            await prisma.notification.create({
              data: {
                userId: order.sellerId,
                type: 'PAYMENT',
                title: '새 주문이 결제되었습니다',
                message: `주문번호 ${order.orderNumber}의 결제가 완료되었습니다. 상품을 발송해주세요.`,
                link: `/orders/${orderId}`,
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          await prisma.payment.updateMany({
            where: { orderId },
            data: {
              status: 'FAILED',
              transactionId: paymentIntent.id,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
