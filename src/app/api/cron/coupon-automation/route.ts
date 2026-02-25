import { NextRequest, NextResponse } from 'next/server';
import {
  issueBirthdayCoupons,
  issueCartAbandonCoupons,
  issueInactiveUserCoupons,
  notifyExpiringCoupons,
} from '@/lib/coupon-automation';

export const dynamic = 'force-dynamic';

/**
 * 쿠폰 자동 발급 Cron Job
 * 매일 실행: 생일 쿠폰, 장바구니 포기 쿠폰, 휴면 사용자 쿠폰, 만료 임박 알림
 *
 * Vercel Cron 설정 예시 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/coupon-automation",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Cron Job 인증 (Vercel Cron은 CRON_SECRET 헤더 사용)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' },
        },
        { status: 401 }
      );
    }

    console.log('[Cron] Starting coupon automation tasks...');

    const startTime = Date.now();

    // 병렬 실행
    const [birthday, cartAbandon, inactiveUser, expiringNotif] = await Promise.allSettled([
      issueBirthdayCoupons(),
      issueCartAbandonCoupons(),
      issueInactiveUserCoupons(),
      notifyExpiringCoupons(),
    ]);

    const duration = Date.now() - startTime;

    // 결과 집계
    const results = {
      birthday: birthday.status === 'fulfilled' ? birthday.value : { success: false },
      cartAbandon: cartAbandon.status === 'fulfilled' ? cartAbandon.value : { success: false },
      inactiveUser:
        inactiveUser.status === 'fulfilled' ? inactiveUser.value : { success: false },
      expiringNotif:
        expiringNotif.status === 'fulfilled' ? expiringNotif.value : { success: false },
    };

    console.log(`[Cron] Coupon automation completed in ${duration}ms:`, results);

    return NextResponse.json({
      success: true,
      data: {
        duration,
        results,
      },
    });
  } catch (error) {
    console.error('[Cron] Coupon automation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
