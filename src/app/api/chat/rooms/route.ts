import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserChatRooms, getOrCreateChatRoom } from '@/lib/chat';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRoomSchema = z.object({
  partnerId: z.string().min(1, '상대방 ID가 필요합니다.'),
  orderId: z.string().optional(),
});

/**
 * 채팅방 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const { rooms, total } = await getUserChatRooms(session.user.id, page, limit);

    return NextResponse.json({
      success: true,
      data: rooms,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Chat rooms API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 채팅방 생성
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
    const validated = createRoomSchema.safeParse(body);

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

    const { partnerId, orderId } = validated.data;

    // 자기 자신과 채팅 불가
    if (partnerId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PARTNER', message: '자기 자신과 채팅할 수 없습니다.' } },
        { status: 400 }
      );
    }

    const { roomId, isNew } = await getOrCreateChatRoom(session.user.id, partnerId, orderId);

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        isNew,
      },
    }, { status: isNew ? 201 : 200 });
  } catch (error) {
    console.error('Create chat room API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
