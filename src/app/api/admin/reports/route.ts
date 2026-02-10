import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 관리자 권한 확인 헬퍼 (실제 구현에서는 더 정교하게)
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  // 간단한 예시: 특정 이메일 도메인이 관리자
  return user?.email?.endsWith('@admin.jikguyeokgu.com') || false;
}

/**
 * 신고 목록 조회 (관리자)
 * GET /api/admin/reports
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
    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, REVIEWING, RESOLVED, DISMISSED
    const targetType = searchParams.get('targetType'); // POST, USER, REVIEW, CHAT
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    // 통계
    const stats = await prisma.report.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const statusStats: Record<string, number> = {
      PENDING: 0,
      REVIEWING: 0,
      RESOLVED: 0,
      DISMISSED: 0,
    };
    stats.forEach((s) => {
      statusStats[s.status] = s._count.status;
    });

    return NextResponse.json({
      success: true,
      data: {
        reports,
        stats: statusStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Admin reports fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '신고 목록 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 신고 처리 (관리자)
 * PATCH /api/admin/reports
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    if (!(await isAdmin(session.user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { reportId, status, resolution, action } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'reportId와 status는 필수입니다.' } },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '신고를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 트랜잭션으로 신고 처리 및 조치 수행
    await prisma.$transaction(async (tx) => {
      // 신고 상태 업데이트
      await tx.report.update({
        where: { id: reportId },
        data: {
          status,
          resolution: resolution || null,
          handledBy: session.user!.id,
          handledAt: new Date(),
        },
      });

      // 추가 조치 수행
      if (status === 'RESOLVED' && action) {
        if (action === 'HIDE_POST' && report.postId) {
          // 게시글 숨김 처리
          await tx.post.update({
            where: { id: report.postId },
            data: { status: 'HIDDEN' },
          });
        } else if (action === 'DELETE_POST' && report.postId) {
          // 게시글 삭제 처리
          await tx.post.update({
            where: { id: report.postId },
            data: { status: 'DELETED' },
          });
        } else if (action === 'WARN_USER' && report.targetUserId) {
          // 사용자 경고 (알림 생성)
          await tx.notification.create({
            data: {
              userId: report.targetUserId,
              type: 'SYSTEM',
              title: '커뮤니티 가이드라인 위반 경고',
              message: '회원님의 활동이 커뮤니티 가이드라인에 위배되어 경고 조치되었습니다.',
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { message: '신고가 처리되었습니다.' },
    });
  } catch (error) {
    console.error('Admin report handling error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '신고 처리 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
