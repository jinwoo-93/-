import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 배송 회사 리뷰 작성
 * POST /api/shipping/reviews
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      companyId,
      orderId,
      rating,
      deliverySpeed,
      packaging,
      communication,
      isDamaged,
      isLost,
      isOnTime,
      comment,
    } = body;

    // 필수 필드 검증
    if (!companyId || !rating || !deliverySpeed || !packaging || !communication) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 항목을 모두 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 평점 범위 검증 (1-5)
    const ratings = [rating, deliverySpeed, packaging, communication];
    if (ratings.some((r) => r < 1 || r > 5)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '평점은 1~5 사이여야 합니다.' } },
        { status: 400 }
      );
    }

    // 배송 회사 존재 확인
    const company = await prisma.shippingCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '배송 회사를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 주문 ID가 제공된 경우, 해당 주문의 배송 회사가 맞는지 확인
    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          buyerId: session.user.id,
          shippingCompanyId: companyId,
          status: 'CONFIRMED', // 구매 확정된 주문만
        },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ORDER', message: '해당 주문에 대한 리뷰를 작성할 수 없습니다.' } },
          { status: 400 }
        );
      }

      // 이미 해당 주문에 대한 배송 리뷰가 있는지 확인
      const existingReview = await prisma.shippingReview.findFirst({
        where: {
          companyId,
          userId: session.user.id,
          createdAt: {
            gte: new Date(order.createdAt.getTime() - 24 * 60 * 60 * 1000), // 주문 생성 시간 +-1일
            lte: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30일 이내
          },
        },
      });

      if (existingReview) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_REVIEW', message: '이미 리뷰를 작성하셨습니다.' } },
          { status: 400 }
        );
      }
    }

    // 리뷰 생성 및 통계 업데이트
    const [review] = await prisma.$transaction([
      // 리뷰 생성
      prisma.shippingReview.create({
        data: {
          companyId,
          userId: session.user.id,
          rating,
          deliverySpeed,
          packaging,
          communication,
          isDamaged: isDamaged || false,
          isLost: isLost || false,
          isOnTime: isOnTime !== false, // 기본값 true
          comment: comment || null,
        },
      }),
      // 배송 회사 통계 업데이트
      prisma.$executeRaw`
        UPDATE "ShippingCompany"
        SET
          "averageRating" = (
            SELECT AVG("rating")::numeric(2,1)
            FROM "ShippingReview"
            WHERE "companyId" = ${companyId}
          ),
          "damageRate" = (
            SELECT (COUNT(*) FILTER (WHERE "isDamaged" = true)::float / NULLIF(COUNT(*), 0) * 100)
            FROM "ShippingReview"
            WHERE "companyId" = ${companyId}
          ),
          "lossRate" = (
            SELECT (COUNT(*) FILTER (WHERE "isLost" = true)::float / NULLIF(COUNT(*), 0) * 100)
            FROM "ShippingReview"
            WHERE "companyId" = ${companyId}
          ),
          "onTimeRate" = (
            SELECT (COUNT(*) FILTER (WHERE "isOnTime" = true)::float / NULLIF(COUNT(*), 0) * 100)
            FROM "ShippingReview"
            WHERE "companyId" = ${companyId}
          ),
          "updatedAt" = NOW()
        WHERE "id" = ${companyId}
      `,
    ]);

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Shipping review creation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 작성 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 배송 회사 리뷰 목록 조회
 * GET /api/shipping/reviews?companyId=xxx&page=1&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'companyId가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 배송 회사 정보
    const company = await prisma.shippingCompany.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        nameZh: true,
        logo: true,
        averageRating: true,
        damageRate: true,
        lossRate: true,
        onTimeRate: true,
        totalShipments: true,
        hasExcellentBadge: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '배송 회사를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 리뷰 총 개수
    const total = await prisma.shippingReview.count({
      where: { companyId },
    });

    // 리뷰 목록
    const reviews = await prisma.shippingReview.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: false, // 이미 company 정보를 가져왔으므로 제외
      },
    });

    // 평점 분포 계산
    const ratingDistribution = await prisma.shippingReview.groupBy({
      by: ['rating'],
      where: { companyId },
      _count: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item.rating] = item._count.rating;
    });

    return NextResponse.json({
      success: true,
      data: {
        company,
        reviews,
        ratingDistribution: distribution,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Shipping reviews fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '리뷰 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
