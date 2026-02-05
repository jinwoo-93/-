import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 현재 최고 입찰가 조회 API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slotId: string } }
) {
  try {
    const { slotId } = params;

    // 현재 주의 시작일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 현재 주의 최고 입찰 조회
    const highestBid = await prisma.adBid.findFirst({
      where: {
        slotId,
        status: 'PENDING',
        weekStart: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
      orderBy: {
        bidAmount: 'desc',
      },
      select: {
        bidAmount: true,
        createdAt: true,
      },
    });

    // 입찰 수 조회
    const bidCount = await prisma.adBid.count({
      where: {
        slotId,
        status: 'PENDING',
        weekStart: {
          gte: weekStart,
          lt: weekEnd,
        },
      },
    });

    // 슬롯 정보 조회
    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
      include: {
        category: {
          select: {
            id: true,
            nameKo: true,
            nameZh: true,
          },
        },
      },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '슬롯을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        slotId,
        category: slot.category,
        slotType: slot.slotType,
        position: slot.position,
        currentHighestBid: highestBid?.bidAmount || 0,
        bidCount,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Current bid API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
