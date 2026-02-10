import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 상품 Q&A 목록 조회
 * GET /api/posts/[id]/qa
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const postId = params.id;
    const session = await auth();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';

    const skip = (page - 1) * limit;

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 조건 설정
    const where: any = {
      postId,
      status: { not: 'DELETED' },
    };

    // 비공개 문의는 본인 또는 판매자만 볼 수 있음
    if (session?.user?.id) {
      // 로그인한 경우: 공개 문의 + 본인 문의 + (판매자라면 모든 비공개 문의)
      if (session.user.id === post.userId) {
        // 판매자는 모든 문의 조회 가능
      } else {
        // 구매자는 공개 문의 + 본인 비공개 문의만
        where.OR = [
          { isPrivate: false },
          { userId: session.user.id },
        ];
      }
    } else {
      // 비로그인은 공개 문의만
      where.isPrivate = false;
    }

    if (status === 'pending') {
      where.status = 'PENDING';
    } else if (status === 'answered') {
      where.status = 'ANSWERED';
    }

    const [qas, total] = await Promise.all([
      prisma.productQA.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productQA.count({ where }),
    ]);

    // 사용자 정보 조회
    const userIds = Array.from(new Set([...qas.map((q) => q.userId), ...qas.map((q) => q.answeredBy).filter(Boolean)]));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        hasExcellentBadge: true,
        isBusinessVerified: true,
      },
    });

    const usersMap = new Map(users.map((u) => [u.id, u]));

    const data = qas.map((qa) => ({
      ...qa,
      user: usersMap.get(qa.userId) || null,
      answerer: qa.answeredBy ? usersMap.get(qa.answeredBy) : null,
      // 비공개 문의의 경우 일부 정보 마스킹
      question: qa.isPrivate && session?.user?.id !== qa.userId && session?.user?.id !== post.userId
        ? '비공개 문의입니다.'
        : qa.question,
      answer: qa.isPrivate && session?.user?.id !== qa.userId && session?.user?.id !== post.userId
        ? qa.answer ? '비공개 답변입니다.' : null
        : qa.answer,
    }));

    return NextResponse.json({
      success: true,
      data: {
        qas: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get Q&A error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 상품 Q&A 등록
 * POST /api/posts/[id]/qa
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const postId = params.id;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question, questionZh, isPrivate = false } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '질문 내용을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true, title: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // Q&A 생성
    const qa = await prisma.productQA.create({
      data: {
        postId,
        userId: session.user.id,
        question: question.trim(),
        questionZh: questionZh?.trim() || null,
        isPrivate,
      },
    });

    // 판매자에게 알림 생성
    try {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: 'SYSTEM',
          title: '새 상품 문의',
          message: `"${post.title}" 상품에 새 문의가 등록되었습니다.`,
          link: `/posts/${postId}?tab=qa`,
        },
      });
    } catch (notificationError) {
      console.error('Failed to create Q&A notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: qa,
    });
  } catch (error) {
    console.error('Create Q&A error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '등록 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
