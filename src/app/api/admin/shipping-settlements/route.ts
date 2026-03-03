import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 배송업체 정산 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (adminUser?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (period) {
      const [year, month] = period.split('-').map(Number);
      where.settlementYear = year;
      where.settlementMonthNum = month;
    }

    const [settlements, total, stats] = await Promise.all([
      prisma.shippingSettlement.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameZh: true,
              logo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.shippingSettlement.count({ where }),
      prisma.shippingSettlement.aggregate({
        where: { status: 'PENDING' },
        _sum: {
          finalAmount: true,
          platformFee: true,
        },
        _count: true,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settlements,
        stats: {
          totalPending: stats._sum.finalAmount || 0,
          totalPlatformFee: stats._sum.platformFee || 0,
          pendingCount: stats._count,
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Admin shipping settlements GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 배송업체 정산 자동 생성
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (adminUser?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { period } = body; // "2024-01" 형식

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: '올바른 기간 형식이 아닙니다. (예: 2024-01)' } },
        { status: 400 }
      );
    }

    const [year, month] = period.split('-').map(Number);
    const settlementMonth = new Date(year, month - 1, 1);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 해당 기간의 모든 배송업체 찾기
    const companies = await prisma.shippingCompany.findMany({
      where: {
        isVerified: true,
        orders: {
          some: {
            status: { in: ['DELIVERED', 'CONFIRMED'] },
            deliveredAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        bankName: true,
        accountNumber: true,
        accountHolder: true,
      },
    });

    const createdSettlements = [];

    for (const company of companies) {
      // 이미 정산이 생성되어 있는지 확인
      const existing = await prisma.shippingSettlement.findUnique({
        where: {
          companyId_settlementYear_settlementMonthNum: {
            companyId: company.id,
            settlementYear: year,
            settlementMonthNum: month,
          },
        },
      });

      if (existing) {
        continue; // 이미 생성됨
      }

      // 해당 기간의 주문 조회
      const orders = await prisma.order.findMany({
        where: {
          shippingCompanyId: company.id,
          status: { in: ['DELIVERED', 'CONFIRMED'] },
          deliveredAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalShipments = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.shippingFeeKRW, 0);

      // 분쟁에서 배송사 책임 건수 조회
      const disputes = await prisma.dispute.findMany({
        where: {
          order: {
            shippingCompanyId: company.id,
          },
          shippingCompanyLiable: true,
          resolvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const damageDisputes = disputes.filter(d => d.compensationType === 'DAMAGE');
      const lossDisputes = disputes.filter(d => d.compensationType === 'LOSS');

      const damageDeductions = damageDisputes.reduce((sum, d) => sum + (d.compensationAmount || 0), 0);
      const lossDeductions = lossDisputes.reduce((sum, d) => sum + (d.compensationAmount || 0), 0);

      const platformFeeRate = 0.05; // 5%
      const platformFee = Math.floor(totalRevenue * platformFeeRate);

      const grossAmount = totalRevenue;
      const netAmount = grossAmount - damageDeductions - lossDeductions;
      const finalAmount = netAmount - platformFee;

      const settlement = await prisma.shippingSettlement.create({
        data: {
          companyId: company.id,
          settlementMonth,
          settlementYear: year,
          settlementMonthNum: month,
          totalShipments,
          totalRevenue,
          damageDeductions,
          damageCount: damageDisputes.length,
          lossDeductions,
          lossCount: lossDisputes.length,
          platformFee,
          platformFeeRate,
          grossAmount,
          netAmount,
          finalAmount,
          status: 'PENDING',
        },
      });

      createdSettlements.push(settlement);
    }

    return NextResponse.json({
      success: true,
      data: {
        created: createdSettlements.length,
        settlements: createdSettlements,
      },
      message: `${createdSettlements.length}건의 배송사 정산이 생성되었습니다.`,
    });
  } catch (error) {
    console.error('Admin shipping settlements POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
