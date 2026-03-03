import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 관리자 권한 확인 API
 * 소셜 로그인 후 관리자 권한 체크용
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        isAdmin: false,
        message: '로그인이 필요합니다.',
      });
    }

    const isAdmin = session.user.userType === 'ADMIN';

    return NextResponse.json({
      success: true,
      isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        userType: session.user.userType,
      },
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      {
        success: false,
        isAdmin: false,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
