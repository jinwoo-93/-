import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
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

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 필터 조건 구성
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // 모든 주문 조회
    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: {
          select: {
            nickname: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            nickname: true,
            email: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
        shippingCompany: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // CSV 생성
    const headers = [
      '주문번호',
      '구매자',
      '구매자 이메일',
      '구매자 전화번호',
      '판매자',
      '판매자 이메일',
      '상품명',
      '수량',
      '상품가격(KRW)',
      '배송비(KRW)',
      '플랫폼 수수료(KRW)',
      '총액(KRW)',
      '상태',
      '배송업체',
      '송장번호',
      '주문일시',
      '결제일시',
      '배송일시',
      '배송완료일시',
      '구매확정일시',
    ];

    const rows = orders.map((order) => [
      order.orderNumber,
      order.buyer.nickname || '',
      order.buyer.email || '',
      order.buyer.phone || '',
      order.seller.nickname || '',
      order.seller.email || '',
      order.post.title,
      order.quantity,
      order.itemPriceKRW,
      order.shippingFeeKRW,
      order.platformFeeKRW,
      order.totalKRW,
      order.status,
      order.shippingCompany?.name || '',
      order.trackingNumber || '',
      order.createdAt.toISOString(),
      order.paidAt?.toISOString() || '',
      order.shippedAt?.toISOString() || '',
      order.deliveredAt?.toISOString() || '',
      order.confirmedAt?.toISOString() || '',
    ]);

    // CSV 문자열 생성
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // BOM 추가 (Excel에서 한글 깨짐 방지)
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Failed to export orders:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '주문 내보내기에 실패했습니다.' } },
      { status: 500 }
    );
  }
}
