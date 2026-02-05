import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { saveFcmToken } from '@/lib/fcm';
import { z } from 'zod';

const fcmTokenSchema = z.object({
  token: z.string().min(1, 'FCM 토큰이 필요합니다.'),
});

/**
 * FCM 토큰 등록/업데이트 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = fcmTokenSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '잘못된 요청입니다.',
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { token } = validated.data;

    const success = await saveFcmToken(session.user.id, token);

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'SAVE_ERROR', message: 'FCM 토큰 저장에 실패했습니다.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FCM 토큰이 등록되었습니다.',
    });
  } catch (error) {
    console.error('FCM token API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * FCM 토큰 삭제 API (로그아웃 시)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 토큰을 null로 설정하여 삭제
    const success = await saveFcmToken(session.user.id, '');

    return NextResponse.json({
      success: true,
      message: 'FCM 토큰이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('FCM token delete API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
