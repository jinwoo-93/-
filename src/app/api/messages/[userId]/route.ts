import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 특정 사용자와의 대화 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const partnerId = params.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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

    // 읽지 않은 메시지 읽음 처리
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    // 파트너 정보
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        hasExcellentBadge: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        partner,
      },
    });
  } catch (error) {
    console.error('Messages userId GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
