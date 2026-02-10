import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 배송업체 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route'); // "KR_TO_CN" or "CN_TO_KR"
    const sort = searchParams.get('sort') || 'rating'; // rating, shipments, price

    const companies = await prisma.shippingCompany.findMany({
      where: {
        isVerified: true,
        ...(route && {
          serviceRoutes: {
            path: [],
            array_contains: route === 'KR_TO_CN'
              ? { from: 'KR', to: 'CN' }
              : { from: 'CN', to: 'KR' },
          },
        }),
      },
      orderBy:
        sort === 'shipments'
          ? { totalShipments: 'desc' }
          : sort === 'price'
          ? { pricePerKg: 'asc' }
          : { averageRating: 'desc' },
    });

    return NextResponse.json({ success: true, data: companies });
  } catch (error) {
    console.error('Shipping companies GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
