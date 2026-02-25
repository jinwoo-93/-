import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  issueSignupCoupon,
  issueFirstOrderCoupon,
  issueReviewCoupon,
} from '@/lib/coupon-automation';

export const dynamic = 'force-dynamic';

/**
 * 쿠폰 자동 발급 트리거 API
 * POST /api/coupons/auto-issue
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { trigger, metadata } = body;

    if (!trigger) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '트리거 타입이 필요합니다.' },
        },
        { status: 400 }
      );
    }

    let result;

    // 트리거별 처리
    switch (trigger) {
      case 'SIGNUP':
        result = await issueSignupCoupon(session.user.id);
        break;

      case 'FIRST_ORDER':
        if (!metadata?.orderAmount) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'VALIDATION_ERROR', message: '주문 금액이 필요합니다.' },
            },
            { status: 400 }
          );
        }
        result = await issueFirstOrderCoupon(session.user.id, metadata.orderAmount);
        break;

      case 'REVIEW_WRITTEN':
        if (!metadata?.reviewId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: 'VALIDATION_ERROR', message: '리뷰 ID가 필요합니다.' },
            },
            { status: 400 }
          );
        }
        result = await issueReviewCoupon(session.user.id, metadata.reviewId);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: { code: 'VALIDATION_ERROR', message: '지원하지 않는 트리거입니다.' },
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        couponsIssued: result.couponsIssued,
        couponIds: result.couponIds,
      },
    });
  } catch (error) {
    console.error('Auto issue coupon POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
