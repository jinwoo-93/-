import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 위시리스트 목록 조회
 * GET /api/wishlist?page=1&limit=20
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 총 개수
    const total = await prisma.wishlist.count({
      where: { userId: session.user.id },
    });

    // 위시리스트 조회
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 상품 정보 조회
    const postIds = wishlistItems.map((item) => item.postId);
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds } },
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
        status: true,
        user: {
          select: {
            id: true,
            nickname: true,
            averageRating: true,
          },
        },
      },
    });

    // 위시리스트 순서대로 정렬
    const postsMap = new Map(posts.map((p) => [p.id, p]));
    const sortedPosts = wishlistItems
      .map((item) => ({
        ...postsMap.get(item.postId),
        wishlistId: item.id,
        addedAt: item.createdAt,
      }))
      .filter((p) => p.id); // 삭제된 상품 제외

    return NextResponse.json({
      success: true,
      data: {
        items: sortedPosts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '위시리스트 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 위시리스트에 추가
 * POST /api/wishlist
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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'postId가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '상품을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 자신의 상품은 찜 불가
    if (post.userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '자신의 상품은 찜할 수 없습니다.' } },
        { status: 403 }
      );
    }

    // 이미 찜한 상품인지 확인
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: '이미 찜한 상품입니다.' } },
        { status: 400 }
      );
    }

    // 위시리스트에 추가
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItem,
    });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '찜하기 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 위시리스트에서 삭제
 * DELETE /api/wishlist?postId=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'postId가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 삭제
    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: '찜 목록에서 삭제되었습니다.' },
    });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '삭제 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
