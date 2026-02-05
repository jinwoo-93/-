import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createWebPayment, createWapPayment } from '@/lib/payments/alipay';

/**
 * 알리페이 결제 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, platform = 'web' } = body;

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
        { success: false, error: { code: 'NOT_FOUND', message: '订单不存在' } },
        { status: 404 }
      );
    }

    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '没有支付权限' } },
        { status: 403 }
      );
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '该订单已支付' } },
        { status: 400 }
      );
    }

    // 결제 레코드 생성
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: 'ALIPAY',
        paymentGateway: 'alipay',
        amountKRW: order.totalKRW,
        amountCNY: order.totalCNY,
        currency: 'CNY',
        status: 'PENDING',
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const paymentRequest = {
      outTradeNo: order.orderNumber,
      totalAmount: order.totalCNY.toFixed(2),
      subject: order.post.titleZh || order.post.title,
      returnUrl: `${baseUrl}/payment/alipay/return?orderId=${orderId}`,
      notifyUrl: `${baseUrl}/api/payments/alipay/webhook`,
    };

    // 플랫폼에 따라 다른 결제 방식 사용
    let paymentData: string;
    if (platform === 'wap' || platform === 'mobile') {
      paymentData = createWapPayment(paymentRequest);
      return NextResponse.json({
        success: true,
        data: {
          type: 'redirect',
          paymentUrl: paymentData,
          paymentId: payment.id,
        },
      });
    } else {
      paymentData = createWebPayment(paymentRequest);
      return NextResponse.json({
        success: true,
        data: {
          type: 'form',
          formHtml: paymentData,
          paymentId: payment.id,
        },
      });
    }
  } catch (error) {
    console.error('Alipay payment create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
