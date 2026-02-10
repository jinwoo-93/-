import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * 라이브 방송 상세 조회
 * GET /api/live/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const streamId = params.id;

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
      include: {
        products: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!stream) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '방송을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.liveStream.update({
      where: { id: streamId },
      data: { totalViews: { increment: 1 } },
    });

    // 호스트 정보
    const host = await prisma.user.findUnique({
      where: { id: stream.hostId },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        hasExcellentBadge: true,
        isBusinessVerified: true,
        averageRating: true,
        totalSales: true,
      },
    });

    // 상품 정보
    const productPostIds = stream.products.map((p) => p.postId);
    const posts = await prisma.post.findMany({
      where: { id: { in: productPostIds } },
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
        quantity: true,
        status: true,
      },
    });

    const postsMap = new Map(posts.map((p) => [p.id, p]));

    return NextResponse.json({
      success: true,
      data: {
        ...stream,
        host,
        products: stream.products.map((p) => ({
          ...p,
          post: postsMap.get(p.postId),
        })),
      },
    });
  } catch (error) {
    console.error('Get live stream error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 라이브 방송 상태 변경
 * PATCH /api/live/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const streamId = params.id;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '방송을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (stream.hostId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '권한이 없습니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, viewerCount } = body;

    const updateData: any = {};

    switch (action) {
      case 'start':
        updateData.status = 'LIVE';
        updateData.startedAt = new Date();
        break;
      case 'end':
        updateData.status = 'ENDED';
        updateData.endedAt = new Date();
        break;
      case 'cancel':
        updateData.status = 'CANCELLED';
        break;
      case 'updateViewers':
        if (viewerCount !== undefined) {
          updateData.viewerCount = viewerCount;
          // 최대 시청자 수 갱신
          if (viewerCount > stream.peakViewers) {
            updateData.peakViewers = viewerCount;
          }
        }
        break;
    }

    const updatedStream = await prisma.liveStream.update({
      where: { id: streamId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedStream,
    });
  } catch (error) {
    console.error('Update live stream error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '업데이트 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
