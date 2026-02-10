import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { createDownloadPresignedUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * 발송 전 사진 조회 API (Presigned URL 반환)
 * 구매자 또는 판매자만 접근 가능
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 }
      );
    }

    const { id: orderId, photoId } = params;

    // 주문 정보 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true,
        preShipPhotos: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '주문을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // 권한 확인: 구매자 또는 판매자만 접근 가능
    if (order.buyerId !== session.user.id && order.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' } },
        { status: 403 }
      );
    }

    // photoId가 해당 주문의 발송 전 사진인지 확인
    // photoId는 배열 인덱스 또는 파일 키일 수 있음
    let fileKey: string | undefined;

    // 숫자인 경우 인덱스로 처리
    const photoIndex = parseInt(photoId);
    if (!isNaN(photoIndex) && photoIndex >= 0 && photoIndex < order.preShipPhotos.length) {
      fileKey = order.preShipPhotos[photoIndex];
    } else {
      // 파일 키로 직접 검색
      fileKey = order.preShipPhotos.find((photo) => photo.includes(photoId));
    }

    if (!fileKey) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '사진을 찾을 수 없습니다.' } },
        { status: 404 }
      );
    }

    // Presigned URL 생성 (1시간 유효)
    const downloadUrl = await createDownloadPresignedUrl(fileKey, 3600);

    if (!downloadUrl) {
      return NextResponse.json(
        { success: false, error: { code: 'URL_ERROR', message: 'URL 생성에 실패했습니다.' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: downloadUrl,
        expiresIn: 3600, // 초 단위
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Photo API error:', error);

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
