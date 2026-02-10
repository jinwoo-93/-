import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { postCreateSchema, postFilterSchema } from '@/lib/validations';
import { translatePost } from '@/lib/translation';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {
      category: searchParams.get('category') || undefined,
      direction: searchParams.get('direction') as 'KR_TO_CN' | 'CN_TO_KR' | undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      sort: searchParams.get('sort') as 'latest' | 'sales' | 'rating' | 'price_asc' | 'price_desc' | undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      search: searchParams.get('search') || undefined,
    };

    const validated = postFilterSchema.safeParse(params);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '잘못된 요청입니다.' } },
        { status: 400 }
      );
    }

    const { category, direction, minPrice, maxPrice, sort, page, limit, search } = validated.data;

    const where: Prisma.PostWhereInput = {
      status: 'ACTIVE',
      ...(category && { category: { slug: category } }),
      ...(direction && { tradeDirection: direction }),
      ...(minPrice && { priceKRW: { gte: minPrice } }),
      ...(maxPrice && { priceKRW: { lte: maxPrice } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { titleZh: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.PostOrderByWithRelationInput = (() => {
      switch (sort) {
        case 'sales':
          return { salesCount: 'desc' };
        case 'rating':
          return { user: { averageRating: 'desc' } };
        case 'price_asc':
          return { priceKRW: 'asc' };
        case 'price_desc':
          return { priceKRW: 'desc' };
        default:
          return { createdAt: 'desc' };
      }
    })();

    const currentPage = page || 1;
    const currentLimit = limit || 20;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip: (currentPage - 1) * currentLimit,
        take: currentLimit,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              profileImage: true,
              averageRating: true,
              hasExcellentBadge: true,
              isBusinessVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              nameKo: true,
              nameZh: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      meta: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 게시글 작성
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
    const validated = postCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { title, description, categoryId, priceKRW, quantity, images, postType } = validated.data;

    // 환율 조회
    const exchangeRate = await prisma.exchangeRate.findUnique({
      where: { fromCurrency_toCurrency: { fromCurrency: 'KRW', toCurrency: 'CNY' } },
    });

    const priceCNY = priceKRW * (exchangeRate?.rate || 0.0054);

    // 사용자 국가로 거래 방향 결정
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { country: true },
    });

    const tradeDirection = user?.country === 'KR' ? 'KR_TO_CN' : 'CN_TO_KR';

    // 한국어 제목/설명을 중국어로 자동 번역
    const { titleZh, descriptionZh } = await translatePost(title, description);

    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        postType,
        tradeDirection,
        title,
        titleZh,
        description,
        descriptionZh,
        categoryId,
        priceKRW,
        priceCNY,
        quantity,
        images,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
