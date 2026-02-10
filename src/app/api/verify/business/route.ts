import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 사업자 인증 요청
 * POST /api/verify/business
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessNumber,      // 사업자등록번호
      businessName,        // 상호명
      representativeName,  // 대표자명
      businessType,        // 업종
      businessItem,        // 업태
      businessAddress,     // 사업장 주소
      documentImage,       // 사업자등록증 이미지
    } = body;

    // 필수 값 검증
    if (!businessNumber || !businessName || !representativeName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '필수 사업자 정보를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 사업자등록번호 형식 검증 (10자리 숫자)
    const cleanBusinessNumber = businessNumber.replace(/-/g, '');
    if (!/^\d{10}$/.test(cleanBusinessNumber)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '올바른 사업자등록번호를 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 이미 인증된 사용자인지 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBusinessVerified: true },
    });

    if (user?.isBusinessVerified) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_VERIFIED', message: '이미 사업자 인증이 완료되었습니다.' } },
        { status: 400 }
      );
    }

    // 개발 환경에서는 바로 인증 처리
    if (process.env.NODE_ENV === 'development') {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isBusinessVerified: true,
          businessVerifiedAt: new Date(),
          businessNumber: cleanBusinessNumber,
          businessName,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: '사업자 인증이 완료되었습니다.' },
      });
    }

    // 프로덕션: 국세청 사업자등록 상태조회 API 연동
    // TODO: 실제 국세청 API 연동
    try {
      // 임시: 간단한 사업자번호 유효성 검사 알고리즘
      const isValidBusinessNumber = validateBusinessNumber(cleanBusinessNumber);

      if (!isValidBusinessNumber) {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_BUSINESS_NUMBER', message: '유효하지 않은 사업자등록번호입니다.' } },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isBusinessVerified: true,
          businessVerifiedAt: new Date(),
          businessNumber: cleanBusinessNumber,
          businessName,
        },
      });

      return NextResponse.json({
        success: true,
        data: { message: '사업자 인증이 완료되었습니다.' },
      });
    } catch (apiError) {
      console.error('Business verification API error:', apiError);
      return NextResponse.json(
        { success: false, error: { code: 'API_ERROR', message: '사업자 인증 API 오류가 발생했습니다.' } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Business verification error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '인증 처리 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 사업자 인증 상태 조회
 * GET /api/verify/business
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isBusinessVerified: true,
        businessVerifiedAt: true,
        businessNumber: true,
        businessName: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isVerified: user?.isBusinessVerified || false,
        verifiedAt: user?.businessVerifiedAt,
        businessNumber: user?.businessNumber,
        businessName: user?.businessName,
      },
    });
  } catch (error) {
    console.error('Business status check error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '상태 조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 사업자등록번호 유효성 검사 (체크섬)
 * https://kim-oriental.tistory.com/32
 */
function validateBusinessNumber(num: string): boolean {
  if (num.length !== 10) return false;

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(num[i]) * weights[i];
  }

  sum += Math.floor((parseInt(num[8]) * 5) / 10);
  const checksum = (10 - (sum % 10)) % 10;

  return checksum === parseInt(num[9]);
}
