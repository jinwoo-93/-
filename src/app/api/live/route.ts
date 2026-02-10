import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * 라이브 방송 목록 조회
 * GET /api/live
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // SCHEDULED, LIVE, ENDED
    const hostId = searchParams.get('hostId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      // 기본: 진행 중 또는 예정된 방송
      where.status = { in: ['LIVE', 'SCHEDULED'] };
    }
    if (hostId) where.hostId = hostId;

    const [streams, total] = await Promise.all([
      prisma.liveStream.findMany({
        where,
        include: {
          products: {
            take: 3,
          },
        },
        orderBy: [
          { status: 'asc' }, // LIVE가 먼저
          { scheduledAt: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.liveStream.count({ where }),
    ]);

    // 호스트 정보 조회
    const hostIds = Array.from(new Set(streams.map((s) => s.hostId)));
    const hosts = await prisma.user.findMany({
      where: { id: { in: hostIds } },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        hasExcellentBadge: true,
        isBusinessVerified: true,
      },
    });

    const hostsMap = new Map(hosts.map((h) => [h.id, h]));

    // 상품 정보 조회
    const productPostIds = streams.flatMap((s) => s.products.map((p) => p.postId));
    const posts = await prisma.post.findMany({
      where: { id: { in: productPostIds } },
      select: {
        id: true,
        title: true,
        titleZh: true,
        priceKRW: true,
        priceCNY: true,
        images: true,
      },
    });

    const postsMap = new Map(posts.map((p) => [p.id, p]));

    const data = streams.map((stream) => ({
      ...stream,
      host: hostsMap.get(stream.hostId),
      products: stream.products.map((p) => ({
        ...p,
        post: postsMap.get(p.postId),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        streams: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get live streams error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 라이브 방송 생성
 * POST /api/live
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
    const { title, titleZh, description, descriptionZh, thumbnail, scheduledAt, productIds } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '방송 제목을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // 스트림 키 생성
    const streamKey = randomBytes(16).toString('hex');

    // 라이브 스트림 생성
    const stream = await prisma.liveStream.create({
      data: {
        hostId: session.user.id,
        title,
        titleZh,
        description,
        descriptionZh,
        thumbnail,
        streamKey,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        products: productIds?.length
          ? {
              create: productIds.map((postId: string, index: number) => ({
                postId,
                displayOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('Create live stream error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '방송 생성 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
