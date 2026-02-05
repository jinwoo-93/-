import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 문의 생성 스키마
const createTicketSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50),
  phone: z.string().optional(),
  category: z.enum(['ORDER', 'SHIPPING', 'REFUND', 'ACCOUNT', 'TECHNICAL', 'REPORT', 'SUGGESTION', 'OTHER']),
  subject: z.string().min(1).max(200),
  content: z.string().min(10).max(5000),
  orderId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// 문의 목록 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);

    // 내 문의 목록 조회 (로그인 사용자)
    if (session?.user?.id) {
      const tickets = await prisma.supportTicket.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        data: tickets,
      });
    }

    // 비회원은 이메일로 조회
    const email = searchParams.get('email');
    const ticketId = searchParams.get('ticketId');

    if (email && ticketId) {
      const ticket = await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          email: email,
        },
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
    }

    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Support] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 문의 생성 (POST)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const validatedData = createTicketSchema.parse(body);

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.user?.id || null,
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone,
        category: validatedData.category,
        subject: validatedData.subject,
        content: validatedData.content,
        orderId: validatedData.orderId,
        attachments: validatedData.attachments || [],
        status: 'OPEN',
        priority: 'NORMAL',
      },
    });

    // 알림 생성 (관리자용)
    // TODO: 관리자에게 알림 발송

    return NextResponse.json({
      success: true,
      data: ticket,
      message: '문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
    });
  } catch (error) {
    console.error('[Support] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력 값이 올바르지 않습니다.', details: error.errors } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
