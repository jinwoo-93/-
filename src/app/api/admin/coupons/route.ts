import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 관리자 쿠폰 목록 조회
 * GET /api/admin/coupons
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 필터 조건
    const where: any = {};

    if (status === 'active') {
      where.isActive = true;
      where.validUntil = { gte: new Date() };
    } else if (status === 'expired') {
      where.validUntil = { lt: new Date() };
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // 쿠폰 목록 조회
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: {
          _count: {
            select: { userCoupons: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        coupons: coupons.map((c) => ({
          ...c,
          issuedCount: c._count.userCoupons,
        })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Admin get coupons error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 관리자 쿠폰 생성
 * POST /api/admin/coupons
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
    const {
      code,
      name,
      nameZh,
      discountType,
      discountValue,
      minOrderAmount = 0,
      maxDiscount,
      totalQuantity = 0,
      validFrom,
      validUntil,
      usageLimit = 1,
      categoryId,
      sellerId,
      tradeDirection,
    } = body;

    // 필수 필드 검증
    if (!code || !name || !discountType || !discountValue || !validUntil) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '필수 항목을 입력해주세요.' },
        },
        { status: 400 }
      );
    }

    // 쿠폰 코드 중복 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: '이미 사용 중인 쿠폰 코드입니다.' } },
        { status: 400 }
      );
    }

    // 쿠폰 생성
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        name,
        nameZh,
        discountType,
        discountValue: parseInt(discountValue),
        minOrderAmount: parseInt(minOrderAmount),
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        totalQuantity: parseInt(totalQuantity),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: new Date(validUntil),
        usageLimit: parseInt(usageLimit),
        categoryId,
        sellerId,
        tradeDirection,
      },
    });

    return NextResponse.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '생성 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
