import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 주간 광고 입찰 마감 및 당첨자 선정 API (Cron Job)
 * 매주 월요일 오전 10시 KST (UTC 1시)에 실행
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Job 인증 확인
    const authHeader = request.headers.get('authorization');

    if (process.env.NODE_ENV === 'production') {
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 현재 주의 시작일과 종료일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() + diffToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 7);

    // 이번 주에 마감되는 PENDING 상태의 입찰 조회
    const pendingBids = await prisma.adBid.findMany({
      where: {
        status: 'PENDING',
        weekStart: {
          gte: currentWeekStart,
          lt: currentWeekEnd,
        },
      },
      include: {
        slot: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        bidAmount: 'desc',
      },
    });

    if (pendingBids.length === 0) {
      return NextResponse.json({
        success: true,
        message: '처리할 입찰이 없습니다.',
        data: { processedSlots: 0, totalBids: 0 },
      });
    }

    // 슬롯별로 그룹화
    const bidsBySlot = new Map<string, typeof pendingBids>();

    for (const bid of pendingBids) {
      const slotId = bid.slotId;
      if (!bidsBySlot.has(slotId)) {
        bidsBySlot.set(slotId, []);
      }
      bidsBySlot.get(slotId)!.push(bid);
    }

    const results: {
      slotId: string;
      slotName: string;
      winners: { position: number; userId: string; nickname: string; amount: number }[];
      losers: { userId: string; nickname: string; amount: number }[];
    }[] = [];

    // 각 슬롯별로 당첨자 선정
    for (const [slotId, bids] of Array.from(bidsBySlot)) {
      const slot = bids[0].slot;

      // 입찰가 높은 순으로 정렬 (이미 정렬됨)
      const sortedBids = bids;

      const winners: typeof results[0]['winners'] = [];
      const losers: typeof results[0]['losers'] = [];

      await prisma.$transaction(async (tx) => {
        // 상위 3명 당첨
        for (let i = 0; i < sortedBids.length; i++) {
          const bid = sortedBids[i];

          if (i < 3) {
            // 당첨자
            const position = i + 1;

            await tx.adBid.update({
              where: { id: bid.id },
              data: {
                status: 'WON',
                isWinner: true,
                winPosition: position,
              },
            });

            winners.push({
              position,
              userId: bid.userId,
              nickname: bid.user.nickname || '익명',
              amount: bid.bidAmount,
            });

            // 당첨 알림 발송
            await tx.notification.create({
              data: {
                userId: bid.userId,
                type: 'SYSTEM',
                title: '광고 낙찰 알림',
                message: `${slot.category.nameKo} 카테고리 ${position}위 광고에 낙찰되었습니다. (₩${bid.bidAmount.toLocaleString()})`,
                link: '/mypage/ads',
              },
            });
          } else {
            // 탈락자 - 환불 처리
            await tx.adBid.update({
              where: { id: bid.id },
              data: {
                status: 'REFUNDED',
                isWinner: false,
              },
            });

            losers.push({
              userId: bid.userId,
              nickname: bid.user.nickname || '익명',
              amount: bid.bidAmount,
            });

            // 탈락 알림 발송
            await tx.notification.create({
              data: {
                userId: bid.userId,
                type: 'SYSTEM',
                title: '광고 입찰 결과',
                message: `${slot.category.nameKo} 카테고리 광고 입찰에 낙찰되지 않았습니다. 입찰금 ₩${bid.bidAmount.toLocaleString()}이 환불됩니다.`,
                link: '/mypage/ads',
              },
            });
          }
        }
      });

      results.push({
        slotId,
        slotName: `${slot.category.nameKo} - ${slot.slotType}`,
        winners,
        losers,
      });
    }

    console.log(`[Weekly Close] Processed ${bidsBySlot.size} slots, ${pendingBids.length} bids`);

    return NextResponse.json({
      success: true,
      message: '주간 광고 입찰이 마감되었습니다.',
      data: {
        processedSlots: bidsBySlot.size,
        totalBids: pendingBids.length,
        results,
      },
    });
  } catch (error) {
    console.error('[Weekly Close] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '서버 오류가 발생했습니다.',
        },
      },
      { status: 500 }
    );
  }
}

// POST 메서드도 지원 (수동 트리거용)
export async function POST(request: NextRequest) {
  return GET(request);
}
