import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { sendMessage } from '@/lib/chat';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const directMessageSchema = z.object({
  receiverId: z.string().min(1, '수신자 ID가 필요합니다.'),
  content: z.string().min(1, '메시지 내용이 필요합니다.').max(2000, '메시지는 2000자 이내로 작성해주세요.'),
  images: z.array(z.string().url()).max(5, '이미지는 최대 5개까지 첨부할 수 있습니다.').optional(),
  orderId: z.string().optional(),
});

/**
 * 직접 메시지 전송 API
 * 채팅방이 없으면 자동 생성 후 메시지 전송
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = directMessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다.',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { receiverId, content, images, orderId } = validated.data;

    // 자기 자신에게 메시지 불가
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_RECEIVER', message: '자기 자신에게 메시지를 보낼 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 수신자 존재 확인
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, nickname: true },
    });

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: { code: 'RECEIVER_NOT_FOUND', message: '수신자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 메시지 전송 (채팅방 자동 생성)
    const result = await sendMessage(
      session.user.id,
      receiverId,
      content,
      images || [],
      orderId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'SEND_ERROR', message: result.error || '메시지 전송에 실패했습니다.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.message,
    }, { status: 201 });
  } catch (error) {
    console.error('Direct message API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
