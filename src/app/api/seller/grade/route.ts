import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSellerGradeInfo } from '@/lib/seller-grade-system';

export const dynamic = 'force-dynamic';

/**
 * 판매자 등급 정보 조회
 * GET /api/seller/grade
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' },
        },
        { status: 401 }
      );
    }

    const gradeInfo = await getSellerGradeInfo(session.user.id);

    return NextResponse.json({
      success: true,
      data: gradeInfo,
    });
  } catch (error) {
    console.error('Seller grade GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
