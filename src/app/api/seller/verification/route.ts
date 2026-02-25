import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// 판매자 인증 정보 조회
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        country: true,
        isIdentityVerified: true,
        identityVerifiedAt: true,
        isBusinessVerified: true,
        businessVerifiedAt: true,
        businessNumber: true,
        businessName: true,
        businessLicenseUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    // TODO: User 모델에 은행 계좌 필드 추가 필요 (bankName, accountNumber, accountHolder)
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        bankName: null,
        accountNumber: null,
        accountHolder: null,
      },
    });
  } catch (error) {
    console.error('Verification GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}

// 판매자 인증 정보 업데이트
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      verificationType, // 'identity' | 'business'
      businessNumber,
      businessName,
      businessLicenseUrl,
      bankName,
      accountNumber,
      accountHolder,
    } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { country: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' },
        },
        { status: 404 }
      );
    }

    // 인증 유형에 따라 처리
    if (verificationType === 'identity') {
      // 신분 인증 (향후 OCR 등으로 확장 가능)
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          isIdentityVerified: true,
          identityVerifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: '신분 인증이 완료되었습니다.',
      });
    } else if (verificationType === 'business') {
      // 사업자 인증
      if (!businessNumber || !businessName) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: '사업자 정보를 모두 입력해주세요.',
            },
          },
          { status: 400 }
        );
      }

      // 한국과 중국의 사업자번호 형식 검증
      if (user.country === 'KR') {
        // 한국 사업자등록번호: 000-00-00000 (10자리)
        const krPattern = /^\d{3}-\d{2}-\d{5}$/;
        if (!krPattern.test(businessNumber)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: '올바른 사업자등록번호 형식이 아닙니다. (000-00-00000)',
              },
            },
            { status: 400 }
          );
        }
      } else if (user.country === 'CN') {
        // 중국 통일사회신용코드: 18자리
        const cnPattern = /^[0-9A-Z]{18}$/;
        if (!cnPattern.test(businessNumber)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: '正确的统一社会信用代码格式（18位）',
              },
            },
            { status: 400 }
          );
        }
      }

      // TODO: User 모델에 은행 계좌 필드 추가 필요 (bankName, accountNumber, accountHolder)
      // 현재는 계좌 정보를 저장할 수 없음
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          businessNumber,
          businessName,
          businessLicenseUrl: businessLicenseUrl || null,
          isBusinessVerified: true,
          businessVerifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message:
          user.country === 'KR'
            ? '사업자 인증이 완료되었습니다.'
            : '企业认证已完成',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '잘못된 인증 유형입니다.' },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verification POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
      },
      { status: 500 }
    );
  }
}
