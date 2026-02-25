import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getWeChatPay } from '@/lib/wechat-pay';

export const dynamic = 'force-dynamic';

// WeChat Pay 결제 완료 콜백
export async function POST(request: NextRequest) {
  try {
    const xml = await request.text();

    const wechatPay = getWeChatPay();
    const result = await wechatPay.verifyCallback(xml);

    if (!result.success || !result.orderId) {
      // 실패 응답
      const errorXml = `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${result.error}]]></return_msg></xml>`;
      return new NextResponse(errorXml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 주문 조회
    const order = await prisma.order.findUnique({
      where: { id: result.orderId },
      include: {
        post: {
          select: { userId: true, title: true },
        },
      },
    });

    if (!order) {
      const errorXml = `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Order not found]]></return_msg></xml>`;
      return new NextResponse(errorXml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 이미 처리된 결제인지 확인
    if (order.status === 'PAID') {
      const successXml = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
      return new NextResponse(successXml, {
        headers: { 'Content-Type': 'application/xml' },
      });
    }

    // 트랜잭션으로 주문 상태 업데이트
    await prisma.$transaction(async (tx) => {
      // 주문 결제 완료
      await tx.order.update({
        where: { id: result.orderId },
        data: {
          paidAt: new Date(),
          status: 'PAID',
        },
      });

      // 구매자에게 알림
      await tx.notification.create({
        data: {
          userId: order.buyerId,
          type: 'SYSTEM',
          title: '결제 완료',
          message: `"${order.post.title}" 주문의 결제가 완료되었습니다.`,
          link: `/orders/${order.id}`,
        },
      });

      // 판매자에게 알림
      await tx.notification.create({
        data: {
          userId: order.post.userId,
          type: 'ORDER',
          title: '신규 주문',
          message: `"${order.post.title}" 상품에 새로운 주문이 들어왔습니다.`,
          link: `/seller/orders/${order.id}`,
        },
      });

      // 상품 판매 수 증가 (재고는 별도 관리)
      // TODO: Post 모델에 stock 필드 추가 필요
    });

    // 성공 응답
    const successXml = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
    return new NextResponse(successXml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('WeChat Pay callback error:', error);

    const errorXml = `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Internal error]]></return_msg></xml>`;
    return new NextResponse(errorXml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
