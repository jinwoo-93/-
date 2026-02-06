import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

/**
 * 알림 설정 조회
 * GET /api/notifications/settings
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 알림 설정 조회 (없으면 기본값으로 생성)
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Notification settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '알림 설정 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 알림 설정 업데이트
 * PATCH /api/notifications/settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 허용된 필드만 추출
    const allowedFields = [
      'pushEnabled',
      'pushOrder',
      'pushPayment',
      'pushShipping',
      'pushChat',
      'pushReview',
      'pushDispute',
      'pushMarketing',
      'emailEnabled',
      'emailOrder',
      'emailPayment',
      'emailShipping',
      'emailReview',
      'emailDispute',
      'emailMarketing',
      'doNotDisturbStart',
      'doNotDisturbEnd',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // 시간 필드는 형식 검증
        if (field === 'doNotDisturbStart' || field === 'doNotDisturbEnd') {
          if (body[field] !== null) {
            const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
            if (!timeRegex.test(body[field])) {
              return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', message: '시간 형식이 올바르지 않습니다. (예: 22:00)' } },
                { status: 400 }
              );
            }
          }
          updateData[field] = body[field];
        } else if (typeof body[field] === 'boolean') {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '업데이트할 설정이 없습니다.' } },
        { status: 400 }
      );
    }

    // 알림 설정 업데이트 (upsert 사용)
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '알림 설정 업데이트 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 모든 알림 켜기/끄기 (일괄 토글)
 * PUT /api/notifications/settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { type, enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'enabled 값은 boolean이어야 합니다.' } },
        { status: 400 }
      );
    }

    let updateData: Record<string, boolean> = {};

    if (type === 'push') {
      // 모든 푸시 알림 토글
      updateData = {
        pushEnabled: enabled,
        pushOrder: enabled,
        pushPayment: enabled,
        pushShipping: enabled,
        pushChat: enabled,
        pushReview: enabled,
        pushDispute: enabled,
        pushMarketing: enabled,
      };
    } else if (type === 'email') {
      // 모든 이메일 알림 토글
      updateData = {
        emailEnabled: enabled,
        emailOrder: enabled,
        emailPayment: enabled,
        emailShipping: enabled,
        emailReview: enabled,
        emailDispute: enabled,
        emailMarketing: enabled,
      };
    } else if (type === 'all') {
      // 모든 알림 토글
      updateData = {
        pushEnabled: enabled,
        pushOrder: enabled,
        pushPayment: enabled,
        pushShipping: enabled,
        pushChat: enabled,
        pushReview: enabled,
        pushDispute: enabled,
        pushMarketing: enabled,
        emailEnabled: enabled,
        emailOrder: enabled,
        emailPayment: enabled,
        emailShipping: enabled,
        emailReview: enabled,
        emailDispute: enabled,
        emailMarketing: enabled,
      };
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'type은 push, email, all 중 하나여야 합니다.' } },
        { status: 400 }
      );
    }

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Notification settings bulk update error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '알림 설정 업데이트 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
