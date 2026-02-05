import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_REPLY', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
});

// 관리자용 문의 상세 조회 (GET)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.id || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

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

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('[Admin Support] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 문의 상태 업데이트 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const body = await request.json();

    if (!session?.user?.id || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const validatedData = updateTicketSchema.parse(body);

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...validatedData,
        resolvedAt: validatedData.status === 'RESOLVED' || validatedData.status === 'CLOSED'
          ? new Date()
          : undefined,
      },
    });

    // 상태 변경 알림
    if (validatedData.status && ticket.userId) {
      const statusMessages: Record<string, string> = {
        IN_PROGRESS: '문의가 처리 중입니다.',
        RESOLVED: '문의가 해결되었습니다.',
        CLOSED: '문의가 종료되었습니다.',
      };

      if (statusMessages[validatedData.status]) {
        await prisma.notification.create({
          data: {
            userId: ticket.userId,
            type: 'SUPPORT',
            title: statusMessages[validatedData.status],
            message: `[${ticket.subject}] ${statusMessages[validatedData.status]}`,
            link: `/help/tickets/${id}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: ticket,
      message: '문의 상태가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('[Admin Support] PATCH error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력 값이 올바르지 않습니다.' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
