import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 자동 구매 확정 기간 (14일)
const AUTO_CONFIRM_DAYS = 14;

/**
 * 에스크로 자동 정산 API (Cron Job)
 * 배송 완료 후 14일이 경과한 주문을 자동으로 구매 확정 처리합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 확인
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const autoConfirmDeadline = new Date(now.getTime() - AUTO_CONFIRM_DAYS * 24 * 60 * 60 * 1000);

    // 자동 확정 대상 주문 조회
    // 조건: DELIVERED 상태이고, deliveredAt이 14일 이전인 주문
    const ordersToConfirm = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: {
          lte: autoConfirmDeadline,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            isBusinessVerified: true,
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
        payment: true,
      },
    });

    if (ordersToConfirm.length === 0) {
      return NextResponse.json({
        success: true,
        message: '자동 확정할 주문이 없습니다.',
        data: { confirmedCount: 0 },
      });
    }

    const results: {
      orderId: string;
      orderNumber: string;
      status: 'success' | 'failed';
      error?: string;
    }[] = [];

    // 각 주문에 대해 자동 확정 처리
    for (const order of ordersToConfirm) {
      try {
        await processAutoConfirm(order);
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'success',
        });
      } catch (error) {
        console.error(`Failed to auto-confirm order ${order.id}:`, error);
        results.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    console.log(`[Auto Confirm] Processed ${ordersToConfirm.length} orders. Success: ${successCount}, Failed: ${failedCount}`);

    return NextResponse.json({
      success: true,
      message: `${successCount}건의 주문이 자동 확정되었습니다.`,
      data: {
        total: ordersToConfirm.length,
        confirmedCount: successCount,
        failedCount,
        results,
      },
    });
  } catch (error) {
    console.error('[Auto Confirm] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 개별 주문 자동 확정 처리
 */
async function processAutoConfirm(order: any) {
  // 수수료 계산
  // 사업자 인증: 3%, 일반: 5%
  const feeRate = order.seller.isBusinessVerified ? 0.03 : 0.05;
  const escrowAmount = order.totalKRW;
  const platformFee = Math.round(escrowAmount * feeRate);
  const settlementAmount = escrowAmount - platformFee;

  // 트랜잭션으로 처리
  await prisma.$transaction(async (tx) => {
    // 1. 주문 상태를 CONFIRMED로 변경
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // 2. 결제 상태 업데이트 (에스크로 해제)
    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: 'RELEASED',
          escrowReleasedAt: new Date(),
        },
      });
    }

    // 3. 판매자 통계 업데이트
    await tx.user.update({
      where: { id: order.sellerId },
      data: {
        totalSales: { increment: 1 },
      },
    });

    // 4. 구매자 통계 업데이트
    await tx.user.update({
      where: { id: order.buyerId },
      data: {
        totalPurchases: { increment: 1 },
      },
    });

    // 5. 구매자에게 자동 확정 알림
    await tx.notification.create({
      data: {
        userId: order.buyerId,
        type: 'ORDER',
        title: '자동 구매 확정',
        message: `주문번호 ${order.orderNumber}이(가) 자동으로 구매 확정되었습니다.`,
        link: `/orders/${order.id}`,
      },
    });

    // 6. 판매자에게 정산 알림
    await tx.notification.create({
      data: {
        userId: order.sellerId,
        type: 'PAYMENT',
        title: '정산 완료',
        message: `주문번호 ${order.orderNumber}의 정산금 ₩${settlementAmount.toLocaleString()}이 지급되었습니다. (수수료: ₩${platformFee.toLocaleString()})`,
        link: `/mypage/sales`,
      },
    });
  });

  console.log(
    `[Auto Confirm] Order ${order.orderNumber} confirmed. ` +
    `Settlement: ₩${settlementAmount.toLocaleString()}, Fee: ₩${platformFee.toLocaleString()}`
  );
}

// POST 메서드도 지원 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}
