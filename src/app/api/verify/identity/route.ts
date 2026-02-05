import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 본인 인증 요청
 * POST /api/verify/identity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, birthDate, idNumber, documentImage } = body;

    // 필수 값 검증
    if (!name || !birthDate || !idNumber) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '모든 필수 정보를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 이미 인증된 사용자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isIdentityVerified: true },
    });

    if (user?.isIdentityVerified) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_VERIFIED', message: '이미 본인 인증이 완료되었습니다.' } },
        { status: 400 }
      );
    }

    // 인증 요청 저장 (실제로는 외부 본인인증 API 연동)
    // 개발 환경에서는 바로 인증 처리
    if (process.env.NODE_ENV === 'development') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isIdentityVerified: true,
          identityVerifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: '본인 인증이 완료되었습니다.' },
      });
    }

    // 프로덕션 환경에서는 외부 API 연동 필요
    // TODO: 실제 본인인증 API 연동 (NICE, 패스 등)
    return NextResponse.json({
      success: true,
      data: {
        message: '인증 요청이 접수되었습니다. 잠시 후 인증이 완료됩니다.',
        verificationId: `VRF_${Date.now()}`,
      },
    });
  } catch (error) {
    console.error('Identity verification error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '인증 처리 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 본인 인증 상태 조회
 * GET /api/verify/identity
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isIdentityVerified: true,
        identityVerifiedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isVerified: user?.isIdentityVerified || false,
        verifiedAt: user?.identityVerifiedAt,
      },
    });
  } catch (error) {
    console.error('Identity status check error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상태 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
