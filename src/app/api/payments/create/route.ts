import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// 결제 생성
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
    const { orderId, paymentMethod, currency } = body;

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        post: {
          select: {
            title: true,
            titleZh: true,
          },
        },
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

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '이미 결제가 완료된 주문입니다.' } },
        { status: 400 }
      );
    }

    // 결제 금액 결정
    const amount = currency === 'CNY' ? order.totalCNY : order.totalKRW;
    const stripeCurrency = currency === 'CNY' ? 'cny' : 'krw';

    // Stripe PaymentIntent 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * (currency === 'CNY' ? 100 : 1)), // CNY는 센트 단위
      currency: stripeCurrency,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      description: `Order ${order.orderNumber} - ${order.post.title}`,
    });

    // 결제 레코드 생성
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        paymentGateway: 'stripe',
        amountKRW: order.totalKRW,
        amountCNY: order.totalCNY,
        currency: currency || 'KRW',
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        amount,
        currency,
      },
    });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
