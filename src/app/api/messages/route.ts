import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { messageCreateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// 메시지 전송
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
    const validated = messageCreateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.' } },
        { status: 400 }
      );
    }

    const { receiverId, content, images } = validated.data;

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
    });

    if (!receiver) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        images: images || [],
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
      },
    });

    // 수신자에게 알림 생성
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'SYSTEM',
        title: '새 메시지가 도착했습니다',
        message: `${message.sender.nickname}님이 메시지를 보냈습니다.`,
        link: `/messages/${session.user.id}`,
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 대화 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 최근 대화 상대 목록 조회
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (partner_id)
        partner_id,
        content,
        created_at,
        is_read
      FROM (
        SELECT
          CASE
            WHEN sender_id = ${session.user.id} THEN receiver_id
            ELSE sender_id
          END as partner_id,
          content,
          created_at,
          is_read
        FROM "Message"
        WHERE sender_id = ${session.user.id} OR receiver_id = ${session.user.id}
        ORDER BY created_at DESC
      ) as messages
      ORDER BY partner_id, created_at DESC
    `;

    // 파트너 정보 조회
    const partnerIds = (conversations as any[]).map((c) => c.partner_id);
    const partners = await prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
      },
    });

    const result = (conversations as any[]).map((conv) => ({
      ...conv,
      partner: partners.find((p) => p.id === conv.partner_id),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
