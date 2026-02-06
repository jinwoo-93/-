import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

const VALID_TARGET_TYPES = ['POST', 'USER', 'REVIEW', 'CHAT'] as const;
const VALID_REASONS = [
  'SPAM',
  'FRAUD',
  'INAPPROPRIATE',
  'COUNTERFEIT',
  'HARASSMENT',
  'PROHIBITED_ITEM',
  'OTHER',
] as const;

/**
 * 신고 생성
 * POST /api/reports
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
    const { targetType, postId, targetUserId, reason, description, evidence } = body;

    // 필수 필드 검증
    if (!targetType || !reason) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '신고 대상과 사유는 필수입니다.' } },
        { status: 400 }
      );
    }

    // targetType 검증
    if (!VALID_TARGET_TYPES.includes(targetType)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '올바르지 않은 신고 대상입니다.' } },
        { status: 400 }
      );
    }

    // reason 검증
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '올바르지 않은 신고 사유입니다.' } },
        { status: 400 }
      );
    }

    // 신고 대상 검증
    if (targetType === 'POST' && !postId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '게시글 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    if (targetType === 'USER' && !targetUserId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '대상 사용자 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 게시글 신고 시 게시글 존재 확인
    if (postId) {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
          { status: 404 }
        );
      }

      // 자신의 게시글은 신고 불가
      if (post.userId === session.user.id) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: '자신의 게시글은 신고할 수 없습니다.' } },
          { status: 403 }
        );
      }
    }

    // 사용자 신고 시 사용자 존재 확인
    if (targetUserId) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
          { status: 404 }
        );
      }

      // 자신을 신고 불가
      if (targetUserId === session.user.id) {
        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: '자신을 신고할 수 없습니다.' } },
          { status: 403 }
        );
      }
    }

    // 동일 대상에 대해 이미 신고한 적이 있는지 확인 (중복 신고 방지)
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        targetType: targetType,
        ...(postId && { postId }),
        ...(targetUserId && { targetUserId }),
        status: { in: ['PENDING', 'REVIEWING'] }, // 처리 전인 신고만
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE', message: '이미 신고 접수가 되어 있습니다.' } },
        { status: 400 }
      );
    }

    // 신고 생성
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetType,
        postId: postId || null,
        targetUserId: targetUserId || null,
        reason,
        description: description || null,
        evidence: evidence || [],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        message:
          targetType === 'POST'
            ? '게시글이 신고되었습니다. 검토 후 조치하겠습니다.'
            : '신고가 접수되었습니다. 검토 후 조치하겠습니다.',
      },
    });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '신고 접수 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 내 신고 내역 조회
 * GET /api/reports
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
    const limit = parseInt(searchParams.get('limit') || '10');

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { reporterId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({
        where: { reporterId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '신고 내역 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
