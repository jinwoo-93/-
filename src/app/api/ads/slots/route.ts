import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SlotType } from '@prisma/client';

// 광고 슬롯 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const slotType = searchParams.get('slotType'); // PRODUCT or SHIPPING

    // 다음 주의 시작일과 종료일 계산
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const slots = await prisma.adSlot.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(slotType && { slotType: slotType as SlotType }),
      },
      include: {
        category: {
          select: {
            id: true,
            nameKo: true,
            nameZh: true,
          },
        },
        bids: {
          where: {
            status: 'PENDING',
            weekEnd: { gte: new Date() },
          },
          orderBy: { bidAmount: 'desc' },
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    // 현재 최고 입찰가와 기본 최소 입찰가 추가
    const slotsWithInfo = slots.map((slot) => ({
      ...slot,
      currentHighestBid: slot.bids.length > 0 ? slot.bids[0].bidAmount : null,
      minimumBid: 10000, // 기본 최소 입찰가
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    }));

    return NextResponse.json({ success: true, data: slotsWithInfo });
  } catch (error) {
    console.error('Ad slots GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}

// 광고 슬롯 생성 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.userType !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '관리자 권한이 필요합니다.' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slotType, categoryId, position } = body;

    const slot = await prisma.adSlot.create({
      data: {
        slotType: slotType as SlotType,
        categoryId,
        position: position || 1,
      },
    });

    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error) {
    console.error('Ad slots POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
