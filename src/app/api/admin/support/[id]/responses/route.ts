import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 관리자 답변 생성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();

    if (!session?.user?.id || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '답변 내용을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 티켓 존재 확인
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '문의를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 답변 생성
    const response = await prisma.supportResponse.create({
      data: {
        ticketId: id,
        content: content.trim(),
        isAdmin: true,
        responderId: session.user.id,
      },
    });

    // 티켓 상태를 'WAITING_REPLY'로 변경
    await prisma.supportTicket.update({
      where: { id },
      data: {
        status: 'WAITING_REPLY',
        updatedAt: new Date(),
      },
    });

    // 고객에게 알림 전송
    if (ticket.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SUPPORT',
          title: '문의에 답변이 등록되었습니다',
          message: `[${ticket.subject}] 관리자가 답변을 등록했습니다.`,
          link: `/help/tickets/${id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: response,
      message: '답변이 등록되었습니다.',
    });
  } catch (error) {
    console.error('[Admin Support Response] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
