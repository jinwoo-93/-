import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 광고 슬롯 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 다음 주의 시작일과 종료일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const slot = await prisma.adSlot.findUnique({
      where: { id: params.slotId },
      include: {
        category: {
          select: {
            id: true,
            nameKo: true,
            nameZh: true,
          },
        },
        bids: {
          where: {
            status: 'PENDING',
            weekEnd: { gte: new Date() },
          },
          orderBy: { bidAmount: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '광고 슬롯을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    const slotWithInfo = {
      ...slot,
      currentHighestBid: slot.bids.length > 0 ? slot.bids[0].bidAmount : null,
      minimumBid: (slot as any).minimumBid || 10000,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    };

    return NextResponse.json({ success: true, data: slotWithInfo });
  } catch (error) {
    console.error('Ad slot GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
