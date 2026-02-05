import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { adBidSchema } from '@/lib/validations';
import { MIN_BID_AMOUNT } from '@/lib/constants';

// 입찰하기
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = adBidSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '입력값을 확인해주세요.', details: validated.error.errors } },
        { status: 400 }
      );
    }

    const { slotId, postId, bidAmount } = validated.data;

    if (bidAmount < MIN_BID_AMOUNT) {
      return NextResponse.json(
        { success: false, error: { code: 'MIN_BID', message: `최소 입찰가는 ${MIN_BID_AMOUNT.toLocaleString()}원입니다.` } },
        { status: 400 }
      );
    }

    // 슬롯 확인
    const slot = await prisma.adSlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '광고 슬롯을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 현재 주의 시작일과 종료일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday + 7); // 다음 주 월요일
    weekStart.setHours(10, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 이미 입찰했는지 확인
    const existingBid = await prisma.adBid.findFirst({
      where: {
        slotId,
        userId: session.user.id,
        weekStart,
        status: 'PENDING',
      },
    });

    if (existingBid) {
      // 기존 입찰 업데이트
      const updatedBid = await prisma.adBid.update({
        where: { id: existingBid.id },
        data: { bidAmount },
      });
      return NextResponse.json({ success: true, data: updatedBid });
    }

    // 새 입찰 생성
    const bid = await prisma.adBid.create({
      data: {
        slotId,
        userId: session.user.id,
        postId,
        bidAmount,
        weekStart,
        weekEnd,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: bid }, { status: 201 });
  } catch (error) {
    console.error('Ad bid POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
