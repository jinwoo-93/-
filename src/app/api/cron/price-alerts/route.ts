/**
 * Cron Job: 가격 변동 알림
 * 6시간마다 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPriceChanges } from '@/lib/wishlist-service';

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

    console.log('[Cron] Starting price change check...');

    const result = await checkPriceChanges();

    console.log(
      `[Cron] Price change check completed: ${result.notifiedCount} notifications sent`
    );

    return NextResponse.json({
      message: 'Price alerts processed successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Cron] Error checking price changes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
