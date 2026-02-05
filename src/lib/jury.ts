import { prisma } from './db';
import { sendNotification } from './fcm';

const JURY_SIZE_PER_COUNTRY = 5; // 한국 5명 + 중국 5명 = 총 10명
const MIN_VOTES_FOR_RESOLUTION = 6; // 최소 6표 이상 시 결정
const VOTING_DEADLINE_HOURS = 72; // 72시간 내 투표

/**
 * 분쟁에 대한 배심원 선정
 * 한국인 5명, 중국인 5명을 무작위로 선정
 */
export async function selectJuryMembers(
  disputeId: string,
  excludeUserIds: string[]
): Promise<{ success: boolean; jurors: string[]; error?: string }> {
  try {
    // 한국 유저 중 랜덤 5명 선정
    const koreanUsers = await prisma.user.findMany({
      where: {
        country: 'KR',
        id: { notIn: excludeUserIds },
        // 최소 거래 이력이 있는 유저만 (신뢰도)
        OR: [
          { totalSales: { gte: 1 } },
          { totalPurchases: { gte: 1 } },
        ],
      },
      select: { id: true },
      take: 100, // 풀에서 선정
    });

    // 중국 유저 중 랜덤 5명 선정
    const chineseUsers = await prisma.user.findMany({
      where: {
        country: 'CN',
        id: { notIn: excludeUserIds },
        OR: [
          { totalSales: { gte: 1 } },
          { totalPurchases: { gte: 1 } },
        ],
      },
      select: { id: true },
      take: 100,
    });

    // 랜덤 셔플 및 선택
    const shuffledKorean = shuffleArray(koreanUsers.map((u) => u.id));
    const shuffledChinese = shuffleArray(chineseUsers.map((u) => u.id));

    const selectedKorean = shuffledKorean.slice(0, JURY_SIZE_PER_COUNTRY);
    const selectedChinese = shuffledChinese.slice(0, JURY_SIZE_PER_COUNTRY);

    if (selectedKorean.length < JURY_SIZE_PER_COUNTRY || selectedChinese.length < JURY_SIZE_PER_COUNTRY) {
      console.warn('[Jury] Not enough users for full jury');
      // 부족해도 진행 (최소 인원으로)
    }

    const jurors = [...selectedKorean, ...selectedChinese];

    // 배심원들에게 알림 발송
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: { orderNumber: true },
        },
      },
    });

    if (dispute) {
      await Promise.all(
        jurors.map((jurorId) =>
          sendNotification(
            jurorId,
            '분쟁 배심원으로 선정되었습니다',
            `주문 ${dispute.order.orderNumber}의 분쟁 해결에 참여해주세요. 72시간 내 투표해주세요.`,
            { type: 'DISPUTE', disputeId }
          )
        )
      );

      // DB에 알림도 생성
      await prisma.notification.createMany({
        data: jurors.map((jurorId) => ({
          userId: jurorId,
          type: 'DISPUTE' as const,
          title: '분쟁 배심원으로 선정되었습니다',
          message: `주문 ${dispute.order.orderNumber}의 분쟁 해결에 참여해주세요. 72시간 내 투표해주세요.`,
          link: `/disputes/${disputeId}/vote`,
        })),
      });
    }

    return { success: true, jurors };
  } catch (error) {
    console.error('[Jury] Failed to select jury members:', error);
    return { success: false, jurors: [], error: 'Failed to select jury' };
  }
}

/**
 * 배심원 투표 처리
 */
export async function submitJuryVote(
  disputeId: string,
  voterId: string,
  voteFor: 'BUYER' | 'SELLER',
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 이미 투표했는지 확인
    const existingVote = await prisma.disputeVote.findUnique({
      where: {
        disputeId_voterId: {
          disputeId,
          voterId,
        },
      },
    });

    if (existingVote) {
      return { success: false, error: '이미 투표하셨습니다.' };
    }

    // 분쟁 상태 확인
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      select: { status: true },
    });

    if (!dispute || dispute.status !== 'VOTING') {
      return { success: false, error: '투표할 수 없는 상태입니다.' };
    }

    // 투표 저장 및 카운트 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.disputeVote.create({
        data: {
          disputeId,
          voterId,
          voteFor,
          comment,
        },
      });

      // 투표 수 업데이트
      if (voteFor === 'BUYER') {
        await tx.dispute.update({
          where: { id: disputeId },
          data: { votesForBuyer: { increment: 1 } },
        });
      } else {
        await tx.dispute.update({
          where: { id: disputeId },
          data: { votesForSeller: { increment: 1 } },
        });
      }
    });

    // 투표 완료 후 자동 결정 체크
    await checkAndResolveDispute(disputeId);

    return { success: true };
  } catch (error) {
    console.error('[Jury] Failed to submit vote:', error);
    return { success: false, error: '투표 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 투표 결과 확인 및 분쟁 해결
 */
export async function checkAndResolveDispute(disputeId: string): Promise<void> {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!dispute || dispute.status !== 'VOTING') {
      return;
    }

    const totalVotes = dispute.votesForBuyer + dispute.votesForSeller;

    // 최소 투표 수 미달 시 대기
    if (totalVotes < MIN_VOTES_FOR_RESOLUTION) {
      return;
    }

    // 환불 비율 계산 (구매자 지지 비율)
    const buyerRefundRate = Math.round((dispute.votesForBuyer / totalVotes) * 100);

    // 분쟁 해결 처리
    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: 'RESOLVED',
          buyerRefundRate,
          resolvedAt: new Date(),
        },
      });

      // 주문 상태 업데이트
      if (buyerRefundRate >= 50) {
        // 구매자 우세 - 환불 처리
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: 'REFUNDED' },
        });

        if (dispute.order.payment) {
          await tx.payment.update({
            where: { id: dispute.order.payment.id },
            data: { status: 'REFUNDED' },
          });
        }
      } else {
        // 판매자 우세 - 구매 확정
        await tx.order.update({
          where: { id: dispute.orderId },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        if (dispute.order.payment) {
          await tx.payment.update({
            where: { id: dispute.order.payment.id },
            data: {
              status: 'RELEASED',
              escrowReleasedAt: new Date(),
            },
          });
        }
      }
    });

    // 양측에 결과 알림
    const resultMessage =
      buyerRefundRate >= 50
        ? `분쟁이 해결되었습니다. 구매자 ${buyerRefundRate}% 지지로 환불 처리됩니다.`
        : `분쟁이 해결되었습니다. 판매자 ${100 - buyerRefundRate}% 지지로 구매가 확정됩니다.`;

    await Promise.all([
      sendNotification(dispute.order.buyerId, '분쟁 해결 완료', resultMessage, {
        type: 'DISPUTE',
        disputeId,
      }),
      sendNotification(dispute.order.sellerId, '분쟁 해결 완료', resultMessage, {
        type: 'DISPUTE',
        disputeId,
      }),
    ]);

    await prisma.notification.createMany({
      data: [
        {
          userId: dispute.order.buyerId,
          type: 'DISPUTE',
          title: '분쟁 해결 완료',
          message: resultMessage,
          link: `/disputes/${disputeId}`,
        },
        {
          userId: dispute.order.sellerId,
          type: 'DISPUTE',
          title: '분쟁 해결 완료',
          message: resultMessage,
          link: `/disputes/${disputeId}`,
        },
      ],
    });

    console.log(`[Jury] Dispute ${disputeId} resolved. Buyer refund rate: ${buyerRefundRate}%`);
  } catch (error) {
    console.error('[Jury] Failed to resolve dispute:', error);
  }
}

/**
 * 투표 마감 체크 (Cron Job에서 호출)
 */
export async function processExpiredVotings(): Promise<{
  processed: number;
  resolved: number;
}> {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() - VOTING_DEADLINE_HOURS);

  // 72시간 지난 VOTING 상태 분쟁 조회
  const expiredDisputes = await prisma.dispute.findMany({
    where: {
      status: 'VOTING',
      updatedAt: { lte: deadline },
    },
    include: {
      order: {
        include: { payment: true },
      },
    },
  });

  let resolved = 0;

  for (const dispute of expiredDisputes) {
    const totalVotes = dispute.votesForBuyer + dispute.votesForSeller;

    if (totalVotes === 0) {
      // 투표가 전혀 없으면 무효 처리 (관리자 개입 필요)
      await prisma.dispute.update({
        where: { id: dispute.id },
        data: { status: 'OPEN' }, // 다시 열린 상태로
      });
      continue;
    }

    // 현재 투표 결과로 결정
    const buyerRefundRate = Math.round((dispute.votesForBuyer / totalVotes) * 100);

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: 'RESOLVED',
          buyerRefundRate,
          resolvedAt: new Date(),
        },
      });

      if (buyerRefundRate >= 50) {
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: 'REFUNDED' },
        });

        if (dispute.order.payment) {
          await tx.payment.update({
            where: { id: dispute.order.payment.id },
            data: { status: 'REFUNDED' },
          });
        }
      } else {
        await tx.order.update({
          where: { id: dispute.orderId },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        if (dispute.order.payment) {
          await tx.payment.update({
            where: { id: dispute.order.payment.id },
            data: {
              status: 'RELEASED',
              escrowReleasedAt: new Date(),
            },
          });
        }
      }
    });

    resolved++;
  }

  return { processed: expiredDisputes.length, resolved };
}

// 유틸리티: 배열 셔플
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
