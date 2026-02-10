import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { selectJuryMembers } from '@/lib/jury';

export const dynamic = 'force-dynamic';

/**
 * 분쟁 투표 시작 API
 * 분쟁 당사자 또는 관리자만 호출 가능
 */
export async function POST(
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

    const { id: disputeId } = params;

    // 분쟁 정보 조회
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            buyerId: true,
            sellerId: true,
            orderNumber: true,
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

    // 권한 확인: 분쟁 당사자 또는 관리자
    const isParticipant =
      dispute.order.buyerId === session.user.id ||
      dispute.order.sellerId === session.user.id ||
      dispute.initiatorId === session.user.id;

    // 관리자 체크 (실제로는 user.role 등으로 확인)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    const isAdmin = user?.userType === 'ADMIN';

    if (!isParticipant && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // 상태 확인
    if (dispute.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '이미 투표가 시작되었거나 해결된 분쟁입니다.' } },
        { status: 400 }
      );
    }

    // 배심원 선정 (당사자 제외)
    const excludeUserIds = [dispute.order.buyerId, dispute.order.sellerId, dispute.initiatorId];
    const juryResult = await selectJuryMembers(disputeId, excludeUserIds);

    if (!juryResult.success) {
      return NextResponse.json(
        { success: false, error: { code: 'JURY_ERROR', message: juryResult.error || '배심원 선정에 실패했습니다.' } },
        { status: 500 }
      );
    }

    // 분쟁 상태를 VOTING으로 변경
    await prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'VOTING',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: '투표가 시작되었습니다. 배심원들에게 알림이 발송되었습니다.',
      data: {
        jurorCount: juryResult.jurors.length,
        votingDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 72시간 후
      },
    });
  } catch (error) {
    console.error('Start voting API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
