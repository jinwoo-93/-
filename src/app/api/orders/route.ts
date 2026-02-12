import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { orderCreateSchema } from '@/lib/validations';
import { generateOrderNumber, calculatePlatformFee } from '@/lib/utils';
import { calculateShippingFee } from '@/lib/shipping';
import { FEE_RATES } from '@/lib/constants';
import { OrderStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer'; // buyer or seller
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      ...(role === 'buyer'
        ? { buyerId: session.user.id }
        : { sellerId: session.user.id }),
      ...(status && { status: status as OrderStatus }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              titleZh: true,
              images: true,
            },
          },
          buyer: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
            },
          },
          seller: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
            },
          },
          shippingCompany: {
            select: {
              id: true,
              name: true,
              nameZh: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 주문 생성
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
    const validated = orderCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { postId, quantity, shippingAddress, shippingCompanyId } = validated.data;

    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            isBusinessVerified: true,
          },
        },
      },
    });

    if (!post || post.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '상품을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (post.quantity < quantity) {
      return NextResponse.json(
        { success: false, error: { code: 'INSUFFICIENT_QUANTITY', message: '재고가 부족합니다.' } },
        { status: 400 }
      );
    }

    if (post.userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'SELF_PURCHASE', message: '자신의 상품은 구매할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 수수료 계산
    const feeRate = post.user.isBusinessVerified ? FEE_RATES.BUSINESS : FEE_RATES.REGULAR;
    const itemPriceKRW = post.priceKRW * quantity;
    const itemPriceCNY = post.priceCNY * quantity;

    // 배송비 계산 (배송 방향 + 수량 기반 무게 + 배송사 요금)
    const direction = post.tradeDirection as 'KR_TO_CN' | 'CN_TO_KR';
    const estimatedWeight = 1 * quantity; // 기본 무게 1kg/개 (Post에 weight 필드 없으므로)

    let companyPricePerKg: number | undefined;
    let companyMinimumFee: number | undefined;

    if (shippingCompanyId) {
      const company = await prisma.shippingCompany.findUnique({
        where: { id: shippingCompanyId },
        select: { pricePerKg: true, minimumFee: true },
      });
      if (company) {
        companyPricePerKg = company.pricePerKg ?? undefined;
        companyMinimumFee = company.minimumFee ?? undefined;
      }
    }

    const shippingResult = calculateShippingFee(
      { weight: estimatedWeight, direction },
      companyPricePerKg,
      companyMinimumFee
    );
    const shippingFeeKRW = shippingResult.feeKRW;
    const shippingFeeCNY = shippingResult.feeCNY;

    const platformFeeKRW = calculatePlatformFee(itemPriceKRW, post.user.isBusinessVerified);
    const platformFeeCNY = calculatePlatformFee(itemPriceCNY, post.user.isBusinessVerified);
    const totalKRW = itemPriceKRW + shippingFeeKRW + platformFeeKRW;
    const totalCNY = itemPriceCNY + shippingFeeCNY + platformFeeCNY;

    // 주문 생성
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        postId,
        buyerId: session.user.id,
        sellerId: post.userId,
        quantity,
        itemPriceKRW,
        itemPriceCNY,
        shippingFeeKRW,
        shippingFeeCNY,
        platformFeeKRW,
        platformFeeCNY,
        totalKRW,
        totalCNY,
        feeRate,
        shippingCompanyId,
        shippingAddress,
        status: 'PENDING_PAYMENT',
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            titleZh: true,
            images: true,
          },
        },
      },
    });

    // 재고 감소
    await prisma.post.update({
      where: { id: postId },
      data: {
        quantity: { decrement: quantity },
        ...(post.quantity - quantity <= 0 && { status: 'SOLD_OUT' }),
      },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
