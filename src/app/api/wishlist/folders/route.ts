import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { withRateLimit, apiLimiter } from '@/lib/rate-limiter';

/**
 * GET /api/wishlist/folders
 * 찜목록 폴더 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, apiLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
        },
        { status: 401 }
      );
    }

    const folders = await prisma.wishlistFolder.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            wishlists: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      nameZh: folder.nameZh,
      description: folder.description,
      count: folder._count.wishlists,
      createdAt: folder.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('GET /api/wishlist/folders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist/folders
 * 찜목록 폴더 생성
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(request, apiLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '폴더 이름을 입력해주세요' },
        },
        { status: 400 }
      );
    }

    const folder = await prisma.wishlistFolder.create({
      data: {
        userId: session.user.id,
        name: body.name,
        nameZh: body.nameZh,
        description: body.description,
      },
    });

    return NextResponse.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    console.error('POST /api/wishlist/folders error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' },
      },
      { status: 500 }
    );
  }
}
