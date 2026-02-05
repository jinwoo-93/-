import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { disputeVoteSchema } from '@/lib/validations';
import { submitJuryVote, checkAndResolveDispute } from '@/lib/jury';

/**
 * 분쟁 투표 제출
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { id: disputeId } = params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            sellerId: true,
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '분쟁을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 분쟁 당사자는 투표 불가
    if (
      dispute.order.buyerId === session.user.id ||
      dispute.order.sellerId === session.user.id ||
      dispute.initiatorId === session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '분쟁 당사자는 투표할 수 없습니다.' } },
        { status: 403 }
      );
    }

    // 투표 진행 중인 분쟁만 투표 가능
    if (dispute.status !== 'VOTING') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '현재 투표를 받을 수 없는 상태입니다.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = disputeVoteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { voteFor, comment } = validated.data;

    // Jury 시스템을 통한 투표 처리
    const result = await submitJuryVote(disputeId, session.user.id, voteFor, comment);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VOTE_ERROR', message: result.error || '투표 처리에 실패했습니다.' } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '투표가 완료되었습니다. 감사합니다.',
    }, { status: 201 });
  } catch (error) {
    console.error('Dispute vote error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 분쟁 투표 현황 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { id: disputeId } = params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            sellerId: true,
            orderNumber: true,
          },
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                nickname: true,
                country: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '분쟁을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 내가 투표했는지 확인
    const myVote = dispute.votes.find((v) => v.voterId === session.user.id);

    // 국가별 투표 집계
    const votesByCountry = {
      KR: { forBuyer: 0, forSeller: 0 },
      CN: { forBuyer: 0, forSeller: 0 },
    };

    dispute.votes.forEach((vote) => {
      const country = vote.voter.country as 'KR' | 'CN';
      if (vote.voteFor === 'BUYER') {
        votesByCountry[country].forBuyer++;
      } else {
        votesByCountry[country].forSeller++;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        status: dispute.status,
        votesForBuyer: dispute.votesForBuyer,
        votesForSeller: dispute.votesForSeller,
        totalVotes: dispute.votesForBuyer + dispute.votesForSeller,
        votesByCountry,
        myVote: myVote
          ? {
              voteFor: myVote.voteFor,
              comment: myVote.comment,
              votedAt: myVote.createdAt,
            }
          : null,
        buyerRefundRate: dispute.buyerRefundRate,
        resolvedAt: dispute.resolvedAt,
      },
    });
  } catch (error) {
    console.error('Vote status API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
