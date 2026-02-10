import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const responseSchema = z.object({
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string()).optional(),
});

// 문의 응답 추가 (POST)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const validatedData = responseSchema.parse(body);

    // 문의 존재 확인
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '문의를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 권한 확인 (본인 또는 관리자)
    const isOwner = ticket.userId === session.user.id;
    const isAdmin = session.user.userType === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 응답 생성 및 상태 업데이트
    const [response] = await prisma.$transaction([
      prisma.supportResponse.create({
        data: {
          ticketId: id,
          responderId: session.user.id,
          isAdmin: isAdmin,
          content: validatedData.content,
          attachments: validatedData.attachments || [],
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: isAdmin ? 'WAITING_REPLY' : 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      }),
    ]);

    // 알림 생성
    if (isAdmin && ticket.userId) {
      await prisma.notification.create({
        data: {
          userId: ticket.userId,
          type: 'SUPPORT',
          title: '문의 답변이 등록되었습니다',
          message: `[${ticket.subject}] 문의에 대한 답변이 등록되었습니다.`,
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
    console.error('[Support Response] POST error:', error);

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
