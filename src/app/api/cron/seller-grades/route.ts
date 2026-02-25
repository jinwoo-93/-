/**
 * Cron Job: 판매자 등급 갱신
 * 매주 일요일 02:00 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateSellerGrades } from '@/lib/seller-grade-system';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Vercel Cron 인증 확인
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting seller grade update...');

    const result = await updateSellerGrades();

    console.log(
      `[Cron] Seller grade update completed: ${result.updatedCount} updated, ${result.upgradedCount} upgraded`
    );

    return NextResponse.json({
      message: 'Seller grades updated successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Cron] Error updating seller grades:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
