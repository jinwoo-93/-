import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { postUpdateSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            averageRating: true,
            hasExcellentBadge: true,
            isBusinessVerified: true,
            totalSales: true,
            createdAt: true,
          },
        },
        category: {
          select: {
            id: true,
            nameKo: true,
            nameZh: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Post GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 게시글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = postUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const updateData: any = { ...validated.data };

    // 가격 변경 시 CNY도 업데이트
    if (validated.data.priceKRW) {
      const exchangeRate = await prisma.exchangeRate.findUnique({
        where: { fromCurrency_toCurrency: { fromCurrency: 'KRW', toCurrency: 'CNY' } },
      });
      updateData.priceCNY = validated.data.priceKRW * (exchangeRate?.rate || 0.0054);
    }

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Post PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '게시글을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 관리자이거나 본인 게시글인 경우만 삭제 가능
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (post.userId !== session.user.id && user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 소프트 삭제
    await prisma.post.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
    });

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    console.error('Post DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
