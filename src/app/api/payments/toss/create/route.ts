import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 토스페이먼츠 결제 준비
 * 클라이언트에서 결제창을 띄우기 위한 정보를 반환합니다.
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
    const { orderId, paymentMethod } = body;

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
        buyer: {
          select: {
            email: true,
            name: true,
            phone: true,
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

    // 결제 레코드 생성
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: paymentMethod || 'CREDIT_CARD',
        paymentGateway: 'toss',
        amountKRW: order.totalKRW,
        amountCNY: order.totalCNY,
        currency: 'KRW',
        status: 'PENDING',
      },
    });

    // 토스페이먼츠 결제 정보 반환
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: order.orderNumber, // 토스페이먼츠용 주문 ID
        orderName: order.post.title,
        amount: Math.round(order.totalKRW),
        customerEmail: order.buyer.email || undefined,
        customerName: order.buyer.name || undefined,
        customerMobilePhone: order.buyer.phone || undefined,
        successUrl: `${baseUrl}/payment/success?orderId=${orderId}`,
        failUrl: `${baseUrl}/payment/fail?orderId=${orderId}`,
        clientKey: process.env.TOSS_CLIENT_KEY,
      },
    });
  } catch (error) {
    console.error('Toss payment create error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
