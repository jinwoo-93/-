import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { disputeCreateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// 분쟁 생성
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
    const validated = disputeCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { orderId, reason, description, evidence } = validated.data;

    // 주문 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        sellerId: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 구매자 또는 판매자만 분쟁 신청 가능
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '분쟁 신청 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 배송 중 또는 배송 완료 상태에서만 분쟁 가능
    if (!['SHIPPING', 'DELIVERED'].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '현재 주문 상태에서는 분쟁을 신청할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 기존 분쟁 확인
    const existingDispute = await prisma.dispute.findUnique({
      where: { orderId },
    });

    if (existingDispute) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: '이미 분쟁이 진행 중입니다.' } },
        { status: 400 }
      );
    }

    // 분쟁 생성 및 주문 상태 변경
    const [dispute] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          orderId,
          initiatorId: session.user.id,
          reason,
          description,
          evidence,
          status: 'OPEN',
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPUTED' },
      }),
    ]);

    // 상대방에게 알림
    const opponentId = session.user.id === order.buyerId ? order.sellerId : order.buyerId;
    await prisma.notification.create({
      data: {
        userId: opponentId,
        type: 'DISPUTE',
        title: '분쟁이 접수되었습니다',
        message: `주문에 대한 분쟁이 접수되었습니다. 사유: ${reason}`,
        link: `/disputes/${dispute.id}`,
      },
    });

    return NextResponse.json({ success: true, data: dispute }, { status: 201 });
  } catch (error) {
    console.error('Disputes POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
