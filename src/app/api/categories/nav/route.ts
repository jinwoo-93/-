import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * 네비게이션용 카테고리 목록 조회 (최상위 + 하위)
 * GET /api/categories/nav
 */
export async function GET(request: NextRequest) {
  try {
    // 최상위 카테고리 조회 (parentId가 null인 것들)
    const topCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          orderBy: {
            nameKo: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ success: true, data: topCategories });
  } catch (error) {
    console.error('Categories nav GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
