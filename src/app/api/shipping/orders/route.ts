import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 배송업체의 주문 목록 조회
export async function GET(request: NextRequest) {
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

    // 배송업체 사용자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (user?.userType !== 'SHIPPING') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: '배송업체 권한이 필요합니다.' },
        },
        { status: 403 }
      );
    }

    // 해당 배송업체 정보 조회
    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!shippingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '등록된 배송업체가 없습니다.' },
        },
        { status: 404 }
      );
    }

    // 해당 배송업체에 배정된 주문 조회
    const orders = await prisma.order.findMany({
      where: {
        shippingCompanyId: shippingCompany.id,
        status: {
          in: ['PAID', 'SHIPPING', 'DELIVERED', 'CONFIRMED'],
        },
      },
      select: {
        id: true,
        orderNumber: true,
        quantity: true,
        totalKRW: true,
        totalCNY: true,
        status: true,
        trackingNumber: true,
        shippingAddress: true,
        createdAt: true,
        paidAt: true,
        shippedAt: true,
        deliveredAt: true,
        buyer: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Shipping orders GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
