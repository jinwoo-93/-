/**
 * 배송업체 월별 정산 크론잡
 * Phase 13-6: 월별 정산 자동화
 *
 * 실행 주기: 매월 1일 00:00 (KST)
 *
 * 사용 방법:
 * 1. Vercel Cron Jobs 설정
 * 2. vercel.json에 cron 설정 추가:
 *    {
 *      "crons": [{
 *        "path": "/api/cron/settlements",
 *        "schedule": "0 0 1 * *"
 *      }]
 *    }
 * 3. API 라우트에서 이 함수 호출
 */

import { prisma } from '@/lib/db';

export interface SettlementResult {
  success: boolean;
  processedCount: number;
  totalAmount: number;
  errors: string[];
}

/**
 * 배송업체 월별 정산 처리
 * 매월 1일에 실행되어 전월 배송 내역을 정산
 */
export async function processMonthlySettlements(): Promise<SettlementResult> {
  const result: SettlementResult = {
    success: true,
    processedCount: 0,
    totalAmount: 0,
    errors: [],
  };

  try {
    // 전월 계산 (이번달 1일 - 1일 = 전월 말일)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const settlementYear = lastMonth.getFullYear();
    const settlementMonth = lastMonth.getMonth() + 1;

    console.log(`[Settlement] Processing for ${settlementYear}-${settlementMonth}`);

    // 승인된 모든 배송업체 조회
    const companies = await prisma.shippingCompany.findMany({
      where: { isVerified: true },
    });

    for (const company of companies) {
      try {
        // 해당 월의 배송 완료 주문 조회
        const orders = await prisma.order.findMany({
          where: {
            shippingCompanyId: company.id,
            status: { in: ['DELIVERED', 'CONFIRMED'] },
            deliveredAt: {
              gte: new Date(settlementYear, settlementMonth - 1, 1),
              lt: new Date(settlementYear, settlementMonth, 1),
            },
          },
          select: {
            id: true,
            totalKRW: true,
            shippingFeeKRW: true,
          },
        });

        if (orders.length === 0) {
          console.log(`[Settlement] No orders for ${company.name}, skipping`);
          continue;
        }

        // 통계 계산
        const totalShipments = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.shippingFeeKRW || 0), 0);

        // 공제 내역 조회 (파손/분실)
        // TODO: 실제 파손/분실 기록이 있다면 여기서 조회

        const damageDeductions = 0; // 파손 공제액
        const damageCount = 0;
        const lossDeductions = 0; // 분실 공제액
        const lossCount = 0;

        // 수수료 계산 (5%)
        const platformFee = Math.floor(totalRevenue * 0.05);
        const platformFeeRate = 0.05;

        // 최종 정산액
        const grossAmount = totalRevenue;
        const netAmount = grossAmount - damageDeductions - lossDeductions;
        const finalAmount = netAmount - platformFee;

        // 정산 기록 생성
        const settlement = await prisma.shippingSettlement.create({
          data: {
            companyId: company.id,
            settlementMonth: new Date(settlementYear, settlementMonth - 1, 1),
            settlementYear,
            settlementMonthNum: settlementMonth,
            totalShipments,
            totalRevenue,
            damageDeductions,
            damageCount,
            lossDeductions,
            lossCount,
            platformFee,
            platformFeeRate,
            grossAmount,
            netAmount,
            finalAmount,
            status: 'PENDING',
          },
        });

        console.log(
          `[Settlement] Created for ${company.name}: ₩${finalAmount.toLocaleString()}`
        );

        result.processedCount++;
        result.totalAmount += finalAmount;
      } catch (error) {
        console.error(`[Settlement] Error processing ${company.name}:`, error);
        result.errors.push(`${company.name}: ${error}`);
        result.success = false;
      }
    }

    console.log(
      `[Settlement] Completed: ${result.processedCount} companies, ₩${result.totalAmount.toLocaleString()}`
    );
  } catch (error) {
    console.error('[Settlement] Fatal error:', error);
    result.success = false;
    result.errors.push(`Fatal error: ${error}`);
  }

  return result;
}

/**
 * 정산 승인 처리
 * 관리자가 정산을 승인하면 호출
 */
export async function approveSettlement(settlementId: string, adminId: string): Promise<boolean> {
  try {
    await prisma.shippingSettlement.update({
      where: { id: settlementId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    console.log(`[Settlement] Approved: ${settlementId}`);
    return true;
  } catch (error) {
    console.error('[Settlement] Approval error:', error);
    return false;
  }
}

/**
 * 정산 지급 완료 처리
 * 실제 송금 후 호출
 */
export async function markSettlementPaid(settlementId: string): Promise<boolean> {
  try {
    await prisma.shippingSettlement.update({
      where: { id: settlementId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    console.log(`[Settlement] Paid: ${settlementId}`);
    return true;
  } catch (error) {
    console.error('[Settlement] Payment mark error:', error);
    return false;
  }
}
