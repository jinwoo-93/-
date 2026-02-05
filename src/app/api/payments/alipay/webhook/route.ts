import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyWebhookSignature, mapAlipayStatusToInternal } from '@/lib/payments/alipay';

/**
 * 알리페이 웹훅 처리
 * 결제 완료, 환불 등의 알림을 처리합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const params: Record<string, string> = {};

    // URL 인코딩된 파라미터 파싱
    text.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    console.log('[Alipay Webhook] Received:', params);

    // 서명 검증
    if (!verifyWebhookSignature(params)) {
      console.error('[Alipay Webhook] Invalid signature');
      return new NextResponse('fail', { status: 400 });
    }

    const {
      trade_status,
      out_trade_no,
      trade_no,
      total_amount,
      gmt_payment,
      refund_fee,
    } = params;

    // 주문 조회
    const order = await prisma.order.findFirst({
      where: { orderNumber: out_trade_no },
    });

    if (!order) {
      console.error('[Alipay Webhook] Order not found:', out_trade_no);
      return new NextResponse('success'); // 알리페이에는 성공 응답
    }

    switch (trade_status) {
      // 결제 완료
      case 'TRADE_SUCCESS':
      case 'TRADE_FINISHED': {
        // 결제 상태 업데이트
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: mapAlipayStatusToInternal(trade_status),
            transactionId: trade_no,
          },
        });

        // 주문 상태 업데이트 (이미 결제된 주문이 아닌 경우에만)
        if (order.status === 'PENDING_PAYMENT') {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'PAID',
              paidAt: gmt_payment ? new Date(gmt_payment) : new Date(),
            },
          });

          // 판매자에게 알림
          await prisma.notification.create({
            data: {
              userId: order.sellerId,
              type: 'PAYMENT',
              title: '新订单已支付',
              message: `订单 ${order.orderNumber} 已完成支付，请尽快发货。`,
              link: `/orders/${order.id}`,
            },
          });

          // 구매자에게 알림
          await prisma.notification.create({
            data: {
              userId: order.buyerId,
              type: 'PAYMENT',
              title: '支付成功',
              message: `订单 ${order.orderNumber} 支付成功，等待卖家发货。`,
              link: `/orders/${order.id}`,
            },
          });
        }
        break;
      }

      // 거래 종료 (환불 등)
      case 'TRADE_CLOSED': {
        await prisma.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: 'REFUNDED',
          },
        });

        // 환불인 경우
        if (refund_fee) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: 'REFUNDED',
            },
          });

          // 구매자에게 환불 알림
          await prisma.notification.create({
            data: {
              userId: order.buyerId,
              type: 'PAYMENT',
              title: '退款成功',
              message: `订单 ${order.orderNumber} 已退款 ¥${refund_fee}。`,
              link: `/orders/${order.id}`,
            },
          });
        }
        break;
      }

      default:
        console.log('[Alipay Webhook] Unhandled trade_status:', trade_status);
    }

    // 알리페이는 'success' 문자열을 반환해야 함
    return new NextResponse('success');
  } catch (error) {
    console.error('[Alipay Webhook] Error:', error);
    // 에러가 발생해도 success 반환 (알리페이가 재시도하지 않도록)
    return new NextResponse('success');
  }
}
