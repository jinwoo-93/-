import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/disputes/[id]/comments - 댓글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.disputeComment.findMany({
      where: {
        disputeId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            nationality: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch comments',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/disputes/[id]/comments - 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Please login to comment',
          },
        },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Comment content is required',
          },
        },
        { status: 400 }
      );
    }

    // 분쟁 존재 확인
    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
    });

    if (!dispute) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Dispute not found',
          },
        },
        { status: 404 }
      );
    }

    // 댓글 생성
    const comment = await prisma.disputeComment.create({
      data: {
        disputeId: params.id,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            nationality: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: 'Failed to create comment',
        },
      },
      { status: 500 }
    );
  }
}
