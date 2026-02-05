import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 판매자의 최근 주문 조회
 * GET /api/seller/orders/recent?limit=5
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const orders = await prisma.order.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalKRW: true,
        totalCNY: true,
        createdAt: true,
        buyer: {
          select: {
            nickname: true,
            profileImage: true,
          },
        },
        post: {
          select: {
            title: true,
            titleZh: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Seller recent orders error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '주문 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
