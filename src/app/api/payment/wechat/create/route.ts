import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getWeChatPay } from '@/lib/wechat-pay';

export const dynamic = 'force-dynamic';

// WeChat Pay 결제 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, tradeType = 'NATIVE', openId } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '주문 ID가 필요합니다.' },
        },
        { status: 400 }
      );
    }

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        post: {
          select: { title: true, titleZh: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    // 권한 확인 (본인 주문만)
    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '권한이 없습니다.' },
        },
        { status: 403 }
      );
    }

    // 이미 결제된 주문인지 확인
    if (order.status === 'PAID' || order.status === 'CONFIRMED' || order.status === 'DELIVERED') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '이미 결제된 주문입니다.' },
        },
        { status: 400 }
      );
    }

    // 위챗페이 결제 생성
    const wechatPay = getWeChatPay();

    // CNY로 변환 (위챗페이는 분 단위, 1元 = 100分)
    const amountInCents = Math.round(order.totalCNY * 100);

    const notifyUrl = `${process.env.NEXTAUTH_URL}/api/payment/wechat/callback`;

    const result = await wechatPay.createOrder({
      orderId: order.id,
      amount: amountInCents,
      description: order.post.titleZh || order.post.title,
      userId: session.user.id,
      openId: openId, // JSAPI 결제 시 필요
      notifyUrl,
      tradeType: tradeType,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'PAYMENT_ERROR', message: result.error || '결제 생성 실패' },
        },
        { status: 500 }
      );
    }

    // 결제 정보는 별도 테이블 또는 메타데이터로 관리
    // Order 모델에 paymentMethod 필드 추가 필요 (TODO)

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.totalCNY,
        tradeType,
        ...result,
      },
    });
  } catch (error) {
    console.error('WeChat Pay create error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
