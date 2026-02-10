import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 문의 상세 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '문의를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 본인 확인 (로그인 사용자) 또는 관리자
    const isOwner = session?.user?.id && ticket.userId === session.user.id;
    const isAdmin = session?.user?.userType === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('[Support] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
