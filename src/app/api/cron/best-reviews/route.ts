/**
 * Cron Job: 이달의 베스트 리뷰 선정
 * 매월 1일 00:00 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { selectMonthlyBestReviews } from '@/lib/review-reward-system';

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

    console.log('[Cron] Starting monthly best review selection...');

    const result = await selectMonthlyBestReviews();

    console.log(
      `[Cron] Best review selection completed: ${result.selectedCount} reviews selected`
    );

    return NextResponse.json({
      message: 'Best reviews selected successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Cron] Error selecting best reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
