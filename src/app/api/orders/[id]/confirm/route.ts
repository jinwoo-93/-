import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// 구매 확정
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
      include: {
        payment: true,
        seller: {
          select: {
            id: true,
            totalSales: true,
          },
        },
        post: {
          select: {
            id: true,
            salesCount: true,
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
        { success: false, error: { code: 'FORBIDDEN', message: '구매 확정 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    if (order.status !== 'DELIVERED' && order.status !== 'SHIPPING') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '배송 완료된 주문만 구매 확정할 수 있습니다.' } },
        { status: 400 }
      );
    }

    // 트랜잭션으로 주문 확정 및 정산 처리
    const [updatedOrder] = await prisma.$transaction([
      // 주문 상태 업데이트
      prisma.order.update({
        where: { id: params.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      }),
      // 결제 상태 업데이트 (에스크로 해제)
      prisma.payment.update({
        where: { orderId: params.id },
        data: {
          status: 'RELEASED',
          escrowReleasedAt: new Date(),
        },
      }),
      // 판매자 통계 업데이트
      prisma.user.update({
        where: { id: order.sellerId },
        data: {
          totalSales: { increment: 1 },
        },
      }),
      // 구매자 통계 업데이트
      prisma.user.update({
        where: { id: order.buyerId },
        data: {
          totalPurchases: { increment: 1 },
        },
      }),
      // 게시글 판매량 업데이트
      prisma.post.update({
        where: { id: order.postId },
        data: {
          salesCount: { increment: 1 },
        },
      }),
    ]);

    // 판매자에게 알림
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'PAYMENT',
        title: '구매가 확정되었습니다',
        message: `주문번호 ${order.orderNumber}의 구매가 확정되어 정산이 진행됩니다.`,
        link: `/orders/${params.id}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Order confirm error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
