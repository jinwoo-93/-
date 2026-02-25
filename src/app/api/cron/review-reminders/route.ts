/**
 * Cron Job: 리뷰 작성 독려 알림
 * 매일 10:00 실행
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendReviewReminders } from '@/lib/review-reward-system';

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

    console.log('[Cron] Starting review reminder notifications...');

    const result = await sendReviewReminders();

    console.log(
      `[Cron] Review reminders sent: ${result.remindersSent} notifications`
    );

    return NextResponse.json({
      message: 'Review reminders sent successfully',
      ...result,
    });
  } catch (error) {
    console.error('[Cron] Error sending review reminders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
