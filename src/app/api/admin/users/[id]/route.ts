import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 회원 상세 정보 조회
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

    const userId = params.id;

    // 회원 상세 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            ordersAsBuyer: true,
            ordersAsSeller: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '회원을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 최근 주문 (구매자로서)
    const recentBuyerOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 최근 주문 (판매자로서)
    const recentSellerOrders = await prisma.order.findMany({
      where: { sellerId: userId },
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
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 최근 게시물
    const recentPosts = await prisma.post.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        priceKRW: true,
        priceCNY: true,
        status: true,
        images: true,
        createdAt: true,
      },
    });

    // 총 거래 금액 (구매)
    const totalPurchaseAmount = await prisma.order.aggregate({
      where: {
        buyerId: userId,
        status: { in: ['DELIVERED', 'CONFIRMED'] },
      },
      _sum: {
        totalKRW: true,
        totalCNY: true,
      },
    });

    // 총 거래 금액 (판매)
    const totalSalesAmount = await prisma.order.aggregate({
      where: {
        sellerId: userId,
        status: { in: ['DELIVERED', 'CONFIRMED'] },
      },
      _sum: {
        totalKRW: true,
        totalCNY: true,
      },
    });

    // 신고 받은 횟수 (TODO: Report 모델 구현 후 추가)
    const reportCount = 0;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...user,
          // 비밀번호는 제외
          password: undefined,
        },
        statistics: {
          totalPurchases: user._count.ordersAsBuyer,
          totalSales: user._count.ordersAsSeller,
          totalPosts: user._count.posts,
          totalMessages: 0, // TODO: Message 모델 구현 후 추가
          totalPurchaseAmountKRW: totalPurchaseAmount._sum.totalKRW || 0,
          totalPurchaseAmountCNY: totalPurchaseAmount._sum.totalCNY || 0,
          totalSalesAmountKRW: totalSalesAmount._sum.totalKRW || 0,
          totalSalesAmountCNY: totalSalesAmount._sum.totalCNY || 0,
          reportCount,
        },
        recentActivities: {
          buyerOrders: recentBuyerOrders,
          sellerOrders: recentSellerOrders,
          posts: recentPosts,
        },
      },
    });
  } catch (error) {
    console.error('Admin user detail GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 회원 정보 수정 (관리자용)
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

    const userId = params.id;
    const body = await request.json();

    const {
      isBusinessVerified,
      hasExcellentBadge,
      userType,
    } = body;

    const updateData: any = {};

    if (typeof isBusinessVerified === 'boolean') {
      updateData.isBusinessVerified = isBusinessVerified;
    }

    if (typeof hasExcellentBadge === 'boolean') {
      updateData.hasExcellentBadge = hasExcellentBadge;
    }

    if (userType && ['BUYER', 'SELLER', 'ADMIN'].includes(userType)) {
      updateData.userType = userType;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nickname: true,
        isBusinessVerified: true,
        hasExcellentBadge: true,
        userType: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: '회원 정보가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Admin user PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 회원 삭제 (관리자용 - 소프트 삭제)
export async function DELETE(
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

    const userId = params.id;

    // 본인 계정은 삭제 불가
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: '본인 계정은 삭제할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 계정 삭제 (실제 삭제)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: '회원이 비활성화되었습니다.',
    });
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
