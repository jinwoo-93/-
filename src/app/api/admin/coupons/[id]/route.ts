import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 관리자 쿠폰 수정
 * PATCH /api/admin/coupons/[id]
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
    const {
      name,
      nameZh,
      discountValue,
      minOrderAmount,
      maxDiscount,
      totalQuantity,
      validUntil,
      isActive,
    } = body;

    // 쿠폰 존재 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '쿠폰을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 수정할 데이터 준비
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameZh !== undefined) updateData.nameZh = nameZh;
    if (discountValue !== undefined) updateData.discountValue = parseInt(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = parseInt(minOrderAmount);
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseInt(maxDiscount) : null;
    if (totalQuantity !== undefined) updateData.totalQuantity = parseInt(totalQuantity);
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil);
    if (isActive !== undefined) updateData.isActive = isActive;

    // 쿠폰 수정
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Admin update coupon error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '수정 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 관리자 쿠폰 삭제
 * DELETE /api/admin/coupons/[id]
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

    // 쿠폰 존재 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { userCoupons: true },
        },
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '쿠폰을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 발급된 쿠폰이 있으면 비활성화만 가능
    if (existingCoupon._count.userCoupons > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'HAS_USERS',
            message: '이미 발급된 쿠폰은 삭제할 수 없습니다. 비활성화만 가능합니다.',
          },
        },
        { status: 400 }
      );
    }

    // 쿠폰 삭제
    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { message: '쿠폰이 삭제되었습니다.' },
    });
  } catch (error) {
    console.error('Admin delete coupon error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '삭제 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
