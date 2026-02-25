import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// 배송업체 등록 스키마
const shippingCompanySchema = z.object({
  name: z.string().min(2, '회사명은 2자 이상이어야 합니다.'),
  nameZh: z.string().min(2, '中文名称至少2个字符'),
  logo: z.string().url('로고 URL이 유효하지 않습니다.').optional(),
  description: z.string().optional(),
  businessLicenseUrl: z.string().url('사업자등록증 URL이 유효하지 않습니다.'),
  serviceRoutes: z.array(
    z.object({
      from: z.enum(['KR', 'CN']),
      to: z.enum(['KR', 'CN']),
    })
  ).min(1, '최소 1개 이상의 서비스 노선이 필요합니다.'),
  pricePerKg: z.number().int().min(0, '가격은 0 이상이어야 합니다.').optional(),
  minimumFee: z.number().int().min(0, '최소 배송비는 0 이상이어야 합니다.').optional(),
  depositAmount: z.number().int().min(1000000, '보증금은 최소 100만원 이상이어야 합니다.').default(1000000),
  apiProvider: z.string().optional(),
  apiKey: z.string().optional(),
});

/**
 * 배송업체 등록
 * POST /api/shipping/register
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

    // UserType 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true, shippingCompany: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (user.userType !== 'SHIPPING') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '배송업체 회원만 등록할 수 있습니다.' } },
        { status: 403 }
      );
    }

    // 이미 등록된 배송업체가 있는지 확인
    if (user.shippingCompany) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_EXISTS', message: '이미 배송업체를 등록하셨습니다.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = shippingCompanySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const {
      name,
      nameZh,
      logo,
      description,
      businessLicenseUrl,
      serviceRoutes,
      pricePerKg,
      minimumFee,
      depositAmount,
      apiProvider,
      apiKey,
    } = validated.data;

    // 배송업체 등록
    const shippingCompany = await prisma.shippingCompany.create({
      data: {
        userId: session.user.id,
        name,
        nameZh,
        logo,
        description,
        businessLicenseUrl,
        serviceRoutes,
        pricePerKg,
        minimumFee,
        depositAmount,
        depositBalance: depositAmount, // 초기 보증금 = 예치 보증금
        lastDepositAt: new Date(),
        apiProvider,
        apiKey,
        apiEnabled: !!(apiProvider && apiKey),
        isVerified: false, // 관리자 승인 필요
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: shippingCompany,
        message: '배송업체 등록이 완료되었습니다. 관리자 승인 후 이용 가능합니다.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Shipping company register error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 내 배송업체 정보 조회
 * GET /api/shipping/register
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!shippingCompany) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '등록된 배송업체가 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: shippingCompany });
  } catch (error) {
    console.error('Get shipping company error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 배송업체 정보 수정
 * PATCH /api/shipping/register
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

    const shippingCompany = await prisma.shippingCompany.findUnique({
      where: { userId: session.user.id },
    });

    if (!shippingCompany) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '등록된 배송업체가 없습니다.' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateSchema = shippingCompanySchema.partial();
    const validated = updateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    // isVerified가 true인 경우 일부 필드만 수정 가능
    if (shippingCompany.isVerified) {
      const { logo, description, pricePerKg, minimumFee, apiProvider, apiKey } = validated.data;

      const updatedCompany = await prisma.shippingCompany.update({
        where: { id: shippingCompany.id },
        data: {
          logo,
          description,
          pricePerKg,
          minimumFee,
          apiProvider,
          apiKey,
          apiEnabled: !!(apiProvider && apiKey),
        },
      });

      return NextResponse.json({ success: true, data: updatedCompany });
    }

    // isVerified가 false인 경우 모든 필드 수정 가능
    const updatedCompany = await prisma.shippingCompany.update({
      where: { id: shippingCompany.id },
      data: {
        ...validated.data,
        apiEnabled: !!(validated.data.apiProvider && validated.data.apiKey),
      },
    });

    return NextResponse.json({ success: true, data: updatedCompany });
  } catch (error) {
    console.error('Update shipping company error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
