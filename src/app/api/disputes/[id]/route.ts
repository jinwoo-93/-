import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// 분쟁 상세 조회
export async function GET(
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

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            preShipPhotos: true,
            buyer: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
            seller: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          },
        },
        initiator: {
          select: {
            id: true,
            nickname: true,
          },
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                nickname: true,
                country: true,
              },
            },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '분쟁을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error('Dispute GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
