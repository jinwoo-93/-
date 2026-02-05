import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// 주문 상세 조회
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            images: true,
            description: true,
            descriptionZh: true,
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            country: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            country: true,
            hasExcellentBadge: true,
            isBusinessVerified: true,
          },
        },
        shippingCompany: true,
        payment: true,
        dispute: true,
        reviews: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 권한 확인 (구매자, 판매자, 관리자만 조회 가능)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (
      order.buyerId !== session.user.id &&
      order.sellerId !== session.user.id &&
      user?.userType !== 'ADMIN'
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Order GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
