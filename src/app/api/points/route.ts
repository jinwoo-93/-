import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 내 포인트 조회
 * GET /api/points
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

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
