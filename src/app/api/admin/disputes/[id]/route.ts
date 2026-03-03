import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 분쟁 상세 조회
export async function GET(
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

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (adminUser?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const disputeId = params.id;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                images: true,
                priceKRW: true,
              },
            },
            buyer: {
              select: {
                id: true,
                nickname: true,
                email: true,
                profileImage: true,
              },
            },
            seller: {
              select: {
                id: true,
                nickname: true,
                email: true,
                profileImage: true,
              },
            },
            shippingCompany: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        initiator: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '분쟁을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    console.error('Admin dispute detail GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 분쟁 해결 처리
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

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (adminUser?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const disputeId = params.id;
    const body = await request.json();
    const {
      status,
      buyerRefundRate,
      shippingCompanyLiable,
      compensationAmount,
      compensationType,
    } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (status === 'RESOLVED') {
      if (typeof buyerRefundRate === 'number') {
        updateData.buyerRefundRate = buyerRefundRate;
      }

      if (typeof shippingCompanyLiable === 'boolean') {
        updateData.shippingCompanyLiable = shippingCompanyLiable;

        if (shippingCompanyLiable) {
          updateData.compensationAmount = compensationAmount || 0;
          updateData.compensationType = compensationType;
        }
      }

      updateData.resolvedAt = new Date();
    }

    const updatedDispute = await prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalKRW: true,
          },
        },
      },
    });

    // 분쟁 해결 시 주문 상태 업데이트
    if (status === 'RESOLVED') {
      if (buyerRefundRate === 100) {
        // 전액 환불
        await prisma.order.update({
          where: { id: updatedDispute.orderId },
          data: { status: 'REFUNDED' },
        });
      } else if (buyerRefundRate === 0) {
        // 환불 없음 - 판매자 승
        await prisma.order.update({
          where: { id: updatedDispute.orderId },
          data: { status: 'CONFIRMED' },
        });
      } else {
        // 부분 환불
        await prisma.order.update({
          where: { id: updatedDispute.orderId },
          data: { status: 'REFUNDED' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedDispute,
      message: '분쟁이 처리되었습니다.',
    });
  } catch (error) {
    console.error('Admin dispute PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
