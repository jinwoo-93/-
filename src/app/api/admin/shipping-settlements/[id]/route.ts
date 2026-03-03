import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 배송업체 정산 상세 조회
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

    const settlementId = params.id;

    const settlement = await prisma.shippingSettlement.findUnique({
      where: { id: settlementId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            nameZh: true,
            logo: true,
            bankName: true,
            accountNumber: true,
            accountHolder: true,
            user: {
              select: {
                id: true,
                nickname: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!settlement) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '정산 내역을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 해당 기간의 주문 조회
    const startDate = new Date(settlement.settlementYear, settlement.settlementMonthNum - 1, 1);
    const endDate = new Date(settlement.settlementYear, settlement.settlementMonthNum, 0, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        shippingCompanyId: settlement.companyId,
        status: { in: ['DELIVERED', 'CONFIRMED'] },
        deliveredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: { deliveredAt: 'desc' },
    });

    // 분쟁 조회
    const disputes = await prisma.dispute.findMany({
      where: {
        order: {
          shippingCompanyId: settlement.companyId,
        },
        shippingCompanyLiable: true,
        resolvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        settlement,
        orders,
        disputes,
      },
    });
  } catch (error) {
    console.error('Admin shipping settlement detail GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 배송업체 정산 처리 (승인/거부/지급완료)
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

    const settlementId = params.id;
    const body = await request.json();
    const { status, adminNote, rejectedReason } = body;

    if (!['PENDING', 'APPROVED', 'PAID', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: '올바르지 않은 상태입니다.' } },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.approvedBy = session.user.id;
    }

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    if (status === 'REJECTED') {
      updateData.rejectedAt = new Date();
      if (rejectedReason) {
        updateData.rejectedReason = rejectedReason;
      }
    }

    const updatedSettlement = await prisma.shippingSettlement.update({
      where: { id: settlementId },
      data: updateData,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSettlement,
      message: '배송사 정산 상태가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Admin shipping settlement PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
