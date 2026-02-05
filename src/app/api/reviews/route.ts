import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { reviewCreateSchema } from '@/lib/validations';

// 리뷰 작성
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
    const validated = reviewCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.' } },
        { status: 400 }
      );
    }

    const { orderId, rating, comment, images } = validated.data;

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

    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '리뷰 작성 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    if (order.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '구매 확정 후에만 리뷰를 작성할 수 있습니다.' } },
        { status: 400 }
      );
    }

    // 이미 리뷰 작성했는지 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId_reviewerId: {
          orderId,
          reviewerId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: '이미 리뷰를 작성했습니다.' } },
        { status: 400 }
      );
    }

    // 리뷰 생성
    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: session.user.id,
        revieweeId: order.sellerId,
        rating,
        comment,
        images: images || [],
      },
    });

    // 판매자 평점 업데이트
    const sellerReviews = await prisma.review.findMany({
      where: { revieweeId: order.sellerId },
      select: { rating: true },
    });

    const avgRating =
      sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;

    await prisma.user.update({
      where: { id: order.sellerId },
      data: { averageRating: Math.round(avgRating * 10) / 10 },
    });

    // 판매자에게 알림
    await prisma.notification.create({
      data: {
        userId: order.sellerId,
        type: 'REVIEW',
        title: '새 리뷰가 등록되었습니다',
        message: `${rating}점 리뷰가 등록되었습니다.`,
        link: `/mypage/reviews`,
      },
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
