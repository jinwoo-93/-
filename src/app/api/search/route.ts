import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * 통합 검색 API
 * - 상품 검색 (제목, 설명)
 * - 카테고리 필터
 * - 가격 범위 필터
 * - 정렬 옵션
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 검색 파라미터
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const direction = searchParams.get('direction'); // KR_TO_CN, CN_TO_KR
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'recent'; // recent, price_low, price_high, popular
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // WHERE 조건 구성
    const where: Prisma.PostWhereInput = {
      status: 'ACTIVE',
    };

    // 키워드 검색 (제목, 설명, 중국어 제목/설명)
    if (query.trim()) {
      const searchTerms = query.trim().split(/\s+/);
      where.OR = searchTerms.flatMap((term) => [
        { title: { contains: term, mode: 'insensitive' } },
        { titleZh: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { descriptionZh: { contains: term, mode: 'insensitive' } },
      ]);
    }

    // 카테고리 필터
    if (category) {
      where.categoryId = category;
    }

    // 거래 방향 필터
    if (direction) {
      where.tradeDirection = direction as any;
    }

    // 가격 범위 필터
    if (minPrice || maxPrice) {
      where.priceKRW = {};
      if (minPrice) {
        where.priceKRW.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.priceKRW.lte = parseFloat(maxPrice);
      }
    }

    // 정렬 옵션
    let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_low':
        orderBy = { priceKRW: 'asc' };
        break;
      case 'price_high':
        orderBy = { priceKRW: 'desc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 총 개수 조회
    const total = await prisma.post.count({ where });

    // 게시글 조회
    const posts = await prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
        tradeDirection: true,
        status: true,
        viewCount: true,
        salesCount: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            nameKo: true,
            nameZh: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            averageRating: true,
          },
        },
      },
    });

    // 검색어 저장 (통계용, 빈 검색어 제외)
    if (query.trim()) {
      try {
        await prisma.searchHistory.create({
          data: {
            keyword: query.trim().toLowerCase(),
            resultCount: total,
          },
        });
      } catch (e) {
        // 검색 기록 저장 실패해도 검색 결과는 반환
        console.error('Failed to save search history:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        query,
        filters: {
          category,
          direction,
          minPrice,
          maxPrice,
          sort,
        },
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '검색 중 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 인기 검색어 조회
 */
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (type === 'popular') {
      // 최근 7일 인기 검색어
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const popularKeywords = await prisma.searchHistory.groupBy({
        by: ['keyword'],
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        _count: { keyword: true },
        orderBy: { _count: { keyword: 'desc' } },
        take: 10,
      });

      return NextResponse.json({
        success: true,
        data: popularKeywords.map((item) => ({
          keyword: item.keyword,
          count: item._count.keyword,
        })),
      });
    }

    if (type === 'suggestions') {
      const { query } = await request.json();

      if (!query || query.length < 2) {
        return NextResponse.json({ success: true, data: [] });
      }

      // 검색어 자동완성 (최근 검색어 + 상품 제목 기반)
      const suggestions = await prisma.post.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { titleZh: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: { title: true, titleZh: true },
        take: 5,
        distinct: ['title'],
      });

      return NextResponse.json({
        success: true,
        data: suggestions.map((s) => s.title),
      });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
