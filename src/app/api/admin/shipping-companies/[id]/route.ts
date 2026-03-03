import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 관리자: 배송업체 상세 조회
 * GET /api/admin/shipping-companies/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const company = await prisma.shippingCompany.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            createdAt: true,
          },
        },
        settlements: {
          orderBy: { settlementMonth: 'desc' },
          take: 5,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '배송업체를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error('Admin shipping company GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 관리자: 배송업체 승인/거부
 * PATCH /api/admin/shipping-companies/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, reason, depositBalance, hasExcellentBadge } = body; // action: 'approve' | 'reject' | 'suspend' | 'activate' | 'update'

    if (!action || !['approve', 'reject', 'suspend', 'activate', 'update'].includes(action)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '유효하지 않은 액션입니다.' } },
        { status: 400 }
      );
    }

    const company = await prisma.shippingCompany.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '배송업체를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // 승인 처리
      const updatedCompany = await prisma.shippingCompany.update({
        where: { id: params.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      // 배송업체에 알림
      if (company.userId) {
        await prisma.notification.create({
          data: {
            userId: company.userId,
            type: 'SYSTEM',
            title: '배송업체 승인 완료',
            message: `${company.name} 배송업체가 승인되었습니다. 이제 서비스를 이용하실 수 있습니다.`,
            link: '/shipping/dashboard',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: '배송업체가 승인되었습니다.',
      });
    } else if (action === 'reject') {
      // 거부 처리 - 삭제
      await prisma.shippingCompany.delete({
        where: { id: params.id },
      });

      // 배송업체에 알림
      if (company.userId) {
        await prisma.notification.create({
          data: {
            userId: company.userId,
            type: 'SYSTEM',
            title: '배송업체 승인 거부',
            message: reason || '배송업체 등록이 거부되었습니다. 자세한 내용은 고객센터에 문의해주세요.',
            link: '/support',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: '배송업체 등록이 거부되었습니다.',
      });
    } else if (action === 'suspend') {
      // 일시 정지 처리
      const updatedCompany = await prisma.shippingCompany.update({
        where: { id: params.id },
        data: {
          isVerified: false,
          verifiedAt: null,
        },
      });

      // 알림
      if (company.userId) {
        await prisma.notification.create({
          data: {
            userId: company.userId,
            type: 'SYSTEM',
            title: '배송업체 일시 정지',
            message: `${company.name} 배송업체가 일시 정지되었습니다. 자세한 내용은 고객센터에 문의해주세요.`,
            link: '/support',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: '배송업체가 일시 정지되었습니다.',
      });
    } else if (action === 'activate') {
      // 재활성화 처리
      const updatedCompany = await prisma.shippingCompany.update({
        where: { id: params.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      // 알림
      if (company.userId) {
        await prisma.notification.create({
          data: {
            userId: company.userId,
            type: 'SYSTEM',
            title: '배송업체 재활성화',
            message: `${company.name} 배송업체가 다시 활성화되었습니다. 서비스 이용이 가능합니다.`,
            link: '/shipping/dashboard',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: '배송업체가 활성화되었습니다.',
      });
    } else if (action === 'update') {
      // 정보 업데이트
      const updateData: any = {};

      if (depositBalance !== undefined) {
        updateData.depositBalance = depositBalance;
      }

      if (hasExcellentBadge !== undefined) {
        updateData.hasExcellentBadge = hasExcellentBadge;
      }

      const updatedCompany = await prisma.shippingCompany.update({
        where: { id: params.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: updatedCompany,
        message: '배송업체 정보가 수정되었습니다.',
      });
    }
  } catch (error) {
    console.error('Admin shipping company PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 관리자: 배송업체 삭제
 * DELETE /api/admin/shipping-companies/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { userType: true },
    });

    if (user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const company = await prisma.shippingCompany.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            posts: true,
            orders: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '배송업체를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 진행 중인 주문이 있으면 삭제 불가
    if (company._count.orders > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'HAS_ORDERS', message: '진행 중인 주문이 있어 삭제할 수 없습니다.' } },
        { status: 400 }
      );
    }

    await prisma.shippingCompany.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: '배송업체가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Admin shipping company DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
