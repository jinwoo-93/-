import { prisma } from '@/lib/db';

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
