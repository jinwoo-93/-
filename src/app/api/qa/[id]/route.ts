import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Q&A 답변 등록/수정
 * PATCH /api/qa/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const qaId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { answer, answerZh } = body;

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '답변 내용을 입력해주세요.' } },
        { status: 400 }
      );
    }

    // Q&A 조회
    const qa = await prisma.productQA.findUnique({
      where: { id: qaId },
      include: {
        // Post와 관계가 없으므로 별도 조회
      },
    });

    if (!qa) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '문의를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 게시글 판매자 확인
    const post = await prisma.post.findUnique({
      where: { id: qa.postId },
      select: { userId: true, title: true },
    });

    if (!post || post.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '답변 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 답변 등록/수정
    const updatedQA = await prisma.productQA.update({
      where: { id: qaId },
      data: {
        answer: answer.trim(),
        answerZh: answerZh?.trim() || null,
        answeredAt: new Date(),
        answeredBy: session.user.id,
        status: 'ANSWERED',
      },
    });

    // 질문자에게 알림
    try {
      await prisma.notification.create({
        data: {
          userId: qa.userId,
          type: 'SYSTEM',
          title: '문의 답변 등록',
          message: `"${post.title}" 상품 문의에 판매자가 답변했습니다.`,
          link: `/posts/${qa.postId}?tab=qa`,
        },
      });
    } catch (notificationError) {
      console.error('Failed to create answer notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: updatedQA,
    });
  } catch (error) {
    console.error('Answer Q&A error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '답변 등록 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

/**
 * Q&A 삭제
 * DELETE /api/qa/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const qaId = params.id;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    // Q&A 조회
    const qa = await prisma.productQA.findUnique({
      where: { id: qaId },
    });

    if (!qa) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '문의를 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 게시글 판매자 확인
    const post = await prisma.post.findUnique({
      where: { id: qa.postId },
      select: { userId: true },
    });

    // 질문자 또는 판매자만 삭제 가능
    if (qa.userId !== session.user.id && post?.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 소프트 삭제
    await prisma.productQA.update({
      where: { id: qaId },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({
      success: true,
      data: { message: '문의가 삭제되었습니다.' },
    });
  } catch (error) {
    console.error('Delete Q&A error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '삭제 중 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
