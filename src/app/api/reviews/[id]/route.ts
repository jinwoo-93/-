import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 리뷰 상세 조회
 * GET /api/reviews/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
        reviewee: {
          select: {
            id: true,
            name: true,
            nickname: true,
            profileImage: true,
          },
        },
        order: {
          select: {
            id: true,
            post: {
              select: {
                id: true,
                title: true,
                titleZh: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '리뷰를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 수정
 * PATCH /api/reviews/[id]
 *
 * 수정 가능 조건:
 * - 작성자 본인만 수정 가능
 * - 작성 후 7일 이내만 수정 가능
 * - 평점은 수정 불가 (댓글, 이미지만 수정 가능)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '리뷰를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 작성자 확인
    if (review.reviewerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '본인의 리뷰만 수정할 수 있습니다.' } },
        { status: 403 }
      );
    }

    // 7일 이내 확인
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (review.createdAt < sevenDaysAgo) {
      return NextResponse.json(
        { success: false, error: { code: 'EXPIRED', message: '리뷰 작성 후 7일이 지나 수정할 수 없습니다.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { comment, images } = body;

    // 수정 가능한 필드만 업데이트 (평점은 수정 불가)
    const updateData: Record<string, unknown> = {};
    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.length > 1000) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: '댓글은 1000자 이내여야 합니다.' } },
          { status: 400 }
        );
      }
      updateData.comment = comment;
    }
    if (images !== undefined) {
      if (!Array.isArray(images) || images.length > 5) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: '이미지는 최대 5개까지 첨부 가능합니다.' } },
          { status: 400 }
        );
      }
      updateData.images = images;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '수정할 내용이 없습니다.' } },
        { status: 400 }
      );
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 수정 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 삭제
 * DELETE /api/reviews/[id]
 *
 * 삭제 가능 조건:
 * - 작성자 본인만 삭제 가능
 * - 삭제 시 판매자 평점 재계산
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '리뷰를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 작성자 확인
    if (review.reviewerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '본인의 리뷰만 삭제할 수 있습니다.' } },
        { status: 403 }
      );
    }

    const revieweeId = review.revieweeId;

    // 트랜잭션으로 리뷰 삭제 및 평점 재계산
    await prisma.$transaction(async (tx) => {
      // 리뷰 삭제
      await tx.review.delete({
        where: { id: params.id },
      });

      // 판매자 평점 재계산
      const remainingReviews = await tx.review.findMany({
        where: { revieweeId },
        select: { rating: true },
      });

      let newAvgRating = 0;
      if (remainingReviews.length > 0) {
        newAvgRating =
          remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length;
        newAvgRating = Math.round(newAvgRating * 10) / 10;
      }

      await tx.user.update({
        where: { id: revieweeId },
        data: { averageRating: newAvgRating },
      });
    });

    return NextResponse.json({
      success: true,
      data: { message: '리뷰가 삭제되었습니다.' },
    });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 삭제 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
