import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/disputes/active - 진행 중인 분쟁 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    const disputes = await prisma.dispute.findMany({
      where: {
        status: 'VOTING',
      },
      include: {
        order: {
          include: {
            buyer: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
            seller: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Calculate vote percentages and abstentions
    const disputesWithStats = disputes.map((dispute) => {
      const totalVotes = dispute.votesForBuyer + dispute.votesForSeller;
      const buyerPercent = totalVotes > 0 ? (dispute.votesForBuyer / totalVotes) * 100 : 50;
      const sellerPercent = totalVotes > 0 ? (dispute.votesForSeller / totalVotes) * 100 : 50;

      return {
        id: dispute.id,
        reason: dispute.reason,
        description: dispute.description,
        votesForBuyer: dispute.votesForBuyer,
        votesForSeller: dispute.votesForSeller,
        buyerPercent: Math.round(buyerPercent),
        sellerPercent: Math.round(sellerPercent),
        totalVotes,
        createdAt: dispute.createdAt,
        order: {
          id: dispute.order.id,
          orderNumber: dispute.order.orderNumber,
          buyer: dispute.order.buyer,
          seller: dispute.order.seller,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: disputesWithStats,
    });
  } catch (error) {
    console.error('Failed to fetch active disputes:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch active disputes',
        },
      },
      { status: 500 }
    );
  }
}
