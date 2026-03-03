import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    // 주문 상세 조회
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            mainImage: true,
            images: true,
          },
        },
        shippingCompany: {
          select: {
            id: true,
            name: true,
            nameZh: true,
            logo: true,
          },
        },
        payment: true,
        dispute: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '주문 조회에 실패했습니다.' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber, shippingCompanyId } = body;

    // 업데이트 데이터 구성
    const updateData: any = {};

    if (status) {
      updateData.status = status;

      // 상태별 타임스탬프 업데이트
      if (status === 'SHIPPED' && !updateData.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      } else if (status === 'CONFIRMED') {
        updateData.confirmedAt = new Date();
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    if (shippingCompanyId !== undefined) {
      updateData.shippingCompanyId = shippingCompanyId;
    }

    // 주문 업데이트
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            mainImage: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '주문 수정에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
