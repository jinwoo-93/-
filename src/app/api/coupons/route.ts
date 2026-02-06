import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 내 쿠폰 목록 조회
 * GET /api/coupons
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'available';

    const where: any = {
      userId: session.user.id,
    };

    if (status === 'available') {
      where.status = 'AVAILABLE';
      where.coupon = {
        isActive: true,
        validUntil: { gte: new Date() },
      };
    } else if (status === 'used') {
      where.status = 'USED';
    } else if (status === 'expired') {
      where.OR = [
        { status: 'EXPIRED' },
        {
          status: 'AVAILABLE',
          coupon: { validUntil: { lt: new Date() } },
        },
      ];
    }

    const userCoupons = await prisma.userCoupon.findMany({
      where,
      include: {
        coupon: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: userCoupons,
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 쿠폰 등록 (코드 입력)
 * POST /api/coupons
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '쿠폰 코드를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 쿠폰 조회
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '유효하지 않은 쿠폰 코드입니다.' } },
        { status: 404 }
      );
    }

    // 유효성 검사
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'INACTIVE', message: '비활성화된 쿠폰입니다.' } },
        { status: 400 }
      );
    }

    if (new Date() < coupon.validFrom) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_STARTED', message: '아직 사용 기간이 아닙니다.' } },
        { status: 400 }
      );
    }

    if (new Date() > coupon.validUntil) {
      return NextResponse.json(
        { success: false, error: { code: 'EXPIRED', message: '사용 기간이 만료된 쿠폰입니다.' } },
        { status: 400 }
      );
    }

    if (coupon.totalQuantity > 0 && coupon.usedQuantity >= coupon.totalQuantity) {
      return NextResponse.json(
        { success: false, error: { code: 'SOLD_OUT', message: '소진된 쿠폰입니다.' } },
        { status: 400 }
      );
    }

    // 이미 보유 확인
    const existingCoupon = await prisma.userCoupon.findUnique({
      where: {
        userId_couponId: {
          userId: session.user.id,
          couponId: coupon.id,
        },
      },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_OWNED', message: '이미 보유중인 쿠폰입니다.' } },
        { status: 400 }
      );
    }

    // 쿠폰 발급
    const [userCoupon] = await prisma.$transaction([
      prisma.userCoupon.create({
        data: {
          userId: session.user.id,
          couponId: coupon.id,
        },
        include: {
          coupon: true,
        },
      }),
      prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedQuantity: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: userCoupon,
    });
  } catch (error) {
    console.error('Register coupon error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '쿠폰 등록 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
