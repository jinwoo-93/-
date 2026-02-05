import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// 내 입찰 내역 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const bids = await prisma.adBid.findMany({
      where: { userId: session.user.id },
      include: {
        slot: {
          include: {
            category: {
              select: {
                id: true,
                nameKo: true,
                nameZh: true,
              },
            },
            bids: {
              where: { status: 'PENDING' },
              orderBy: { bidAmount: 'desc' },
              take: 1,
            },
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 현재 최고 입찰가 추가
    const bidsWithSlotInfo = bids.map((bid) => ({
      id: bid.id,
      amount: bid.bidAmount,
      status: bid.status,
      createdAt: bid.createdAt.toISOString(),
      slot: {
        id: bid.slot.id,
        name: bid.slot.name,
        type: bid.slot.slotType,
        weekStart: bid.weekStart.toISOString(),
        weekEnd: bid.weekEnd.toISOString(),
        currentHighestBid: bid.slot.bids.length > 0 ? bid.slot.bids[0].bidAmount : null,
      },
      post: bid.post,
    }));

    return NextResponse.json({ success: true, data: bidsWithSlotInfo });
  } catch (error) {
    console.error('My bids GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
