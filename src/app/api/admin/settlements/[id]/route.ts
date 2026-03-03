import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 정산 상세 조회
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

    const settlement = await prisma.sellerSettlement.findUnique({
      where: { id: settlementId },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            email: true,
            profileImage: true,
            country: true,
            phone: true,
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
    const orders = await prisma.order.findMany({
      where: {
        sellerId: settlement.sellerId,
        status: { in: ['DELIVERED', 'CONFIRMED'] },
        paidAt: {
          gte: settlement.startDate,
          lte: settlement.endDate,
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
      },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        settlement,
        orders,
      },
    });
  } catch (error) {
    console.error('Admin settlement detail GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 정산 처리 (승인/거부/지급완료)
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
    const { status, adminNote } = body;

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

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    const updatedSettlement = await prisma.sellerSettlement.update({
      where: { id: settlementId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSettlement,
      message: '정산 상태가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Admin settlement PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
