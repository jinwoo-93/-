import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 관리자 쿠폰 대량 발급
 * POST /api/admin/coupons/issue
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
    const { couponId, targetType, userIds, userType, country } = body;

    // 필수 필드 검증
    if (!couponId || !targetType) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '필수 항목을 입력해주세요.' },
        },
        { status: 400 }
      );
    }

    // 쿠폰 확인
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '쿠폰을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: { code: 'INACTIVE', message: '비활성화된 쿠폰입니다.' } },
        { status: 400 }
      );
    }

    // 대상 사용자 조회
    let targetUsers: string[] = [];

    if (targetType === 'specific' && userIds && Array.isArray(userIds)) {
      // 특정 사용자
      targetUsers = userIds;
    } else if (targetType === 'all') {
      // 전체 사용자
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      targetUsers = users.map((u) => u.id);
    } else if (targetType === 'filter') {
      // 조건별 필터
      const where: any = {};
      if (userType) where.userType = userType;
      if (country) where.country = country;

      const users = await prisma.user.findMany({
        where,
        select: { id: true },
      });
      targetUsers = users.map((u) => u.id);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '올바른 대상 유형을 선택해주세요.' },
        },
        { status: 400 }
      );
    }

    if (targetUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NO_USERS', message: '발급 대상 사용자가 없습니다.' },
        },
        { status: 400 }
      );
    }

    // 수량 제한 확인
    if (
      coupon.totalQuantity > 0 &&
      coupon.usedQuantity + targetUsers.length > coupon.totalQuantity
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'QUANTITY_EXCEEDED', message: '쿠폰 수량이 부족합니다.' },
        },
        { status: 400 }
      );
    }

    // 이미 보유한 사용자 제외
    const existingUserCoupons = await prisma.userCoupon.findMany({
      where: {
        couponId,
        userId: { in: targetUsers },
      },
      select: { userId: true },
    });

    const existingUserIds = new Set(existingUserCoupons.map((uc) => uc.userId));
    const newTargetUsers = targetUsers.filter((userId) => !existingUserIds.has(userId));

    if (newTargetUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ALL_OWNED', message: '모든 대상 사용자가 이미 해당 쿠폰을 보유하고 있습니다.' },
        },
        { status: 400 }
      );
    }

    // 대량 발급
    const userCouponsData = newTargetUsers.map((userId) => ({
      userId,
      couponId,
    }));

    await prisma.$transaction([
      prisma.userCoupon.createMany({
        data: userCouponsData,
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: { usedQuantity: { increment: newTargetUsers.length } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        issued: newTargetUsers.length,
        skipped: existingUserIds.size,
        total: targetUsers.length,
      },
    });
  } catch (error) {
    console.error('Admin issue coupons error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '발급 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
