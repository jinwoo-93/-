import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 내 포인트 조회
 * GET /api/points
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 포인트 정보 조회 (없으면 생성)
    let userPoint = await prisma.userPoint.findUnique({
      where: { userId: session.user.id },
    });

    if (!userPoint) {
      userPoint = await prisma.userPoint.create({
        data: { userId: session.user.id },
      });
    }

    // 히스토리 조회
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
      prisma.pointHistory.findMany({
        where: { userPointId: userPoint.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointHistory.count({
        where: { userPointId: userPoint.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balance: userPoint.balance,
        totalEarned: userPoint.totalEarned,
        totalUsed: userPoint.totalUsed,
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get points error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 포인트 적립 유틸 함수
export async function addPoints(
  userId: string,
  amount: number,
  type: string,
  description: string,
  descriptionZh?: string,
  relatedId?: { orderId?: string; disputeId?: string; couponId?: string },
  expiresAt?: Date
) {
  // 포인트 정보 조회 (없으면 생성)
  let userPoint = await prisma.userPoint.findUnique({
    where: { userId },
  });

  if (!userPoint) {
    userPoint = await prisma.userPoint.create({
      data: { userId },
    });
  }

  const newBalance = userPoint.balance + amount;

  // 트랜잭션으로 포인트 업데이트
  const [updatedPoint] = await prisma.$transaction([
    prisma.userPoint.update({
      where: { id: userPoint.id },
      data: {
        balance: newBalance,
        totalEarned: amount > 0 ? { increment: amount } : undefined,
        totalUsed: amount < 0 ? { increment: Math.abs(amount) } : undefined,
      },
    }),
    prisma.pointHistory.create({
      data: {
        userPointId: userPoint.id,
        type: type as any,
        amount,
        balance: newBalance,
        description,
        descriptionZh,
        orderId: relatedId?.orderId,
        disputeId: relatedId?.disputeId,
        couponId: relatedId?.couponId,
        expiresAt,
      },
    }),
  ]);

  return updatedPoint;
}

// 포인트 사용 유틸 함수
export async function usePoints(
  userId: string,
  amount: number,
  description: string,
  descriptionZh?: string,
  orderId?: string
) {
  const userPoint = await prisma.userPoint.findUnique({
    where: { userId },
  });

  if (!userPoint || userPoint.balance < amount) {
    throw new Error('포인트가 부족합니다.');
  }

  return addPoints(
    userId,
    -amount,
    'ORDER_USE',
    description,
    descriptionZh,
    { orderId }
  );
}
