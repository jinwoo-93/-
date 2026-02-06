import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 구매대행 요청 목록 조회
 * GET /api/purchase-requests
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const myRequests = searchParams.get('my') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const session = await auth();
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = 'OPEN';
    }

    if (myRequests && session?.user?.id) {
      where.requesterId = session.user.id;
    }

    const [requests, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: {
          offers: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseRequest.count({ where }),
    ]);

    // 요청자 정보 조회
    const requesterIds = Array.from(new Set(requests.map((r) => r.requesterId)));
    const users = await prisma.user.findMany({
      where: { id: { in: requesterIds } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    const usersMap = new Map(users.map((u) => [u.id, u]));

    const data = requests.map((req) => ({
      ...req,
      requester: usersMap.get(req.requesterId),
      offerCount: req.offers.length,
      offers: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        requests: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get purchase requests error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 구매대행 요청 생성
 * POST /api/purchase-requests
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
    const {
      productName,
      productNameZh,
      productUrl,
      productImage,
      estimatedPrice,
      quantity,
      description,
      descriptionZh,
      maxBudget,
      deadline,
    } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '상품명을 입력해주세요.' } },
        { status: 400 }
      );
    }

    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        requesterId: session.user.id,
        productName,
        productNameZh,
        productUrl,
        productImage,
        estimatedPrice,
        quantity: quantity || 1,
        description,
        descriptionZh,
        maxBudget,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: purchaseRequest,
    });
  } catch (error) {
    console.error('Create purchase request error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '요청 생성 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
