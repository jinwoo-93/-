import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * 팔로우/언팔로우 토글
 * POST /api/follow
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '사용자 ID가 필요합니다.' } },
        { status: 400 }
      );
    }

    // 자기 자신은 팔로우할 수 없음
    if (userId === session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: '자신을 팔로우할 수 없습니다.' } },
        { status: 400 }
      );
    }

    // 대상 사용자 존재 확인
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nickname: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사용자를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 기존 팔로우 확인
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // 언팔로우
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });

      // 팔로워 수 조회
      const followerCount = await prisma.follow.count({
        where: { followingId: userId },
      });

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: false,
          followerCount,
          message: '팔로우를 취소했습니다.',
        },
      });
    } else {
      // 팔로우
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: userId,
        },
      });

      // 팔로워 수 조회
      const followerCount = await prisma.follow.count({
        where: { followingId: userId },
      });

      // 알림 생성 (선택적)
      try {
        await prisma.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM',
            title: '새 팔로워',
            message: `${session.user.name || '회원'}님이 회원님을 팔로우했습니다.`,
            link: `/users/${session.user.id}`,
          },
        });
      } catch (notificationError) {
        console.error('Failed to create follow notification:', notificationError);
      }

      return NextResponse.json({
        success: true,
        data: {
          isFollowing: true,
          followerCount,
          message: '팔로우했습니다.',
        },
      });
    }
  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '처리 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * 내가 팔로우한 사용자 목록
 * GET /api/follow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || 'following'; // following or followers

    const skip = (page - 1) * limit;

    if (type === 'followers') {
      // 나를 팔로우하는 사람들
      const [follows, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followingId: session.user.id },
          include: {
            // Prisma에서 relation이 없어서 별도 쿼리 필요
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.follow.count({
          where: { followingId: session.user.id },
        }),
      ]);

      // 팔로워 정보 조회
      const followerIds = follows.map((f) => f.followerId);
      const followers = await prisma.user.findMany({
        where: { id: { in: followerIds } },
        select: {
          id: true,
          nickname: true,
          profileImage: true,
          hasExcellentBadge: true,
          isBusinessVerified: true,
          totalSales: true,
          averageRating: true,
        },
      });

      const followersMap = new Map(followers.map((f) => [f.id, f]));
      const data = follows.map((f) => ({
        ...followersMap.get(f.followerId),
        followedAt: f.createdAt,
      }));

      return NextResponse.json({
        success: true,
        data: {
          users: data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } else {
      // 내가 팔로우하는 사람들
      const [follows, total] = await Promise.all([
        prisma.follow.findMany({
          where: { followerId: session.user.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.follow.count({
          where: { followerId: session.user.id },
        }),
      ]);

      // 팔로잉 정보 조회
      const followingIds = follows.map((f) => f.followingId);
      const followings = await prisma.user.findMany({
        where: { id: { in: followingIds } },
        select: {
          id: true,
          nickname: true,
          profileImage: true,
          hasExcellentBadge: true,
          isBusinessVerified: true,
          totalSales: true,
          averageRating: true,
        },
      });

      const followingsMap = new Map(followings.map((f) => [f.id, f]));
      const data = follows.map((f) => ({
        ...followingsMap.get(f.followingId),
        followedAt: f.createdAt,
      }));

      return NextResponse.json({
        success: true,
        data: {
          users: data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '조회 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
