import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 특정 월 정산 내역 + 사용자 정보 조회 (PDF 생성용)
export async function GET(
  request: NextRequest,
  { params }: { params: { yearMonth: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    // yearMonth 파싱 (예: "2024-01")
    const [year, month] = params.yearMonth.split('-').map(Number);

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '잘못된 연월 형식입니다.' },
        },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        nickname: true,
        businessName: true,
        businessNumber: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    // TODO: User 모델에 은행 계좌 필드 추가 필요 (bankName, accountNumber, accountHolder)
    const userInfo = {
      ...user,
      bankName: null,
      accountNumber: null,
      accountHolder: null,
    };

    // 해당 월의 주문 조회
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const orders = await prisma.order.findMany({
      where: {
        sellerId: session.user.id,
        status: {
          in: ['CONFIRMED', 'DELIVERED'],
        },
        confirmedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalKRW: true,
        platformFeeKRW: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalKRW, 0);
    const platformFee = orders.reduce((sum, order) => sum + order.platformFeeKRW, 0);
    const netAmount = totalRevenue - platformFee;

    // 정산 상태 결정
    const currentDate = new Date();
    const settlementDate = new Date(year, month, 15); // 익월 15일 지급
    let status: 'pending' | 'confirmed' | 'paid' = 'pending';

    if (currentDate >= settlementDate) {
      status = 'paid';
    } else if (currentDate >= endDate) {
      status = 'confirmed';
    }

    return NextResponse.json({
      success: true,
      data: {
        settlement: {
          year,
          month,
          totalRevenue,
          totalOrders: orders.length,
          platformFee,
          netAmount,
          status,
        },
        userInfo,
      },
    });
  } catch (error) {
    console.error('Settlement detail GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
