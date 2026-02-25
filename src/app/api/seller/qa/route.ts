import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 판매자 상품 Q&A 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // 판매자의 상품 ID 목록 조회
    const sellerPosts = await prisma.post.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const postIds = sellerPosts.map((post) => post.id);

    if (postIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          qas: [],
          stats: {
            total: 0,
            pending: 0,
            answered: 0,
          },
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
      });
    }

    // Q&A 조회 조건
    const where: any = {
      postId: { in: postIds },
      status: { not: 'DELETED' },
    };

    if (status === 'pending') {
      where.status = 'PENDING';
    } else if (status === 'answered') {
      where.status = 'ANSWERED';
    }

    // Q&A 조회 및 총 개수
    const [qas, total, pendingCount, answeredCount] = await Promise.all([
      prisma.productQA.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productQA.count({ where }),
      prisma.productQA.count({
        where: {
          postId: { in: postIds },
          status: 'PENDING',
        },
      }),
      prisma.productQA.count({
        where: {
          postId: { in: postIds },
          status: 'ANSWERED',
        },
      }),
    ]);

    // 사용자 및 상품 정보 별도 조회
    const userIds = Array.from(new Set(qas.map((qa) => qa.userId)));
    const qaPostIds = Array.from(new Set(qas.map((qa) => qa.postId)));

    const [users, posts] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          nickname: true,
          profileImage: true,
          country: true,
        },
      }),
      prisma.post.findMany({
        where: { id: { in: qaPostIds } },
        select: {
          id: true,
          title: true,
          titleZh: true,
          images: true,
        },
      }),
    ]);

    // Map 생성
    const usersMap = new Map(users.map((u) => [u.id, u]));
    const postsMap = new Map(posts.map((p) => [p.id, p]));

    // Q&A에 사용자 및 상품 정보 결합
    const qasWithRelations = qas.map((qa) => ({
      ...qa,
      user: usersMap.get(qa.userId) || null,
      post: postsMap.get(qa.postId) || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        qas: qasWithRelations,
        stats: {
          total: pendingCount + answeredCount,
          pending: pendingCount,
          answered: answeredCount,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Seller QA GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
