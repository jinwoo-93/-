import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { getFileExtension, isAllowedMimeType, isValidFileSize } from './validations/image';

// S3 클라이언트 초기화
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

// 폴더 경로 설정
const FOLDERS = {
  post: 'posts',
  profile: 'profiles',
  message: 'messages',
  preShipPhoto: 'pre-ship-photos',
  dispute: 'disputes',
} as const;

type UploadPurpose = keyof typeof FOLDERS;

/**
 * 랜덤 파일명 생성
 */
function generateFileName(originalName: string): string {
  const ext = getFileExtension(originalName);
  const uuid = uuidv4();
  const timestamp = Date.now();
  return `${uuid}-${timestamp}.${ext}`;
}

/**
 * S3 업로드용 Presigned URL 생성
 */
export async function createUploadPresignedUrl(
  originalFileName: string,
  contentType: string,
  fileSize: number,
  purpose: UploadPurpose
): Promise<{
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
} | null> {
  // 파일 검증
  if (!isAllowedMimeType(contentType)) {
    throw new Error('허용되지 않는 파일 형식입니다.');
  }

  if (!isValidFileSize(fileSize)) {
    throw new Error('파일 크기가 허용 범위를 초과합니다.');
  }

  const fileName = generateFileName(originalFileName);
  const folder = FOLDERS[purpose];
  const fileKey = `${folder}/${fileName}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5분
    });

    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  } catch (error) {
    console.error('Failed to create upload presigned URL:', error);
    return null;
  }
}

/**
 * S3 다운로드용 Presigned URL 생성 (보안 이미지용)
 */
export async function createDownloadPresignedUrl(
  fileKey: string,
  expiresIn: number = 3600 // 1시간 기본값
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return downloadUrl;
  } catch (error) {
    console.error('Failed to create download presigned URL:', error);
    return null;
  }
}

/**
 * 발송 전 사진 접근 권한 확인 및 URL 생성
 */
export async function getPreShipPhotoUrl(
  fileKey: string,
  userId: string,
  orderId: string,
  prisma: any // Prisma client
): Promise<string | null> {
  try {
    // 주문 정보 조회하여 권한 확인
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true,
        preShipPhotos: true,
      },
    });

    if (!order) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    // 구매자 또는 판매자만 접근 가능
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new Error('접근 권한이 없습니다.');
    }

    // 요청한 파일이 해당 주문의 발송 전 사진인지 확인
    if (!order.preShipPhotos.includes(fileKey)) {
      throw new Error('해당 주문의 사진이 아닙니다.');
    }

    // Presigned URL 생성 (1시간 유효)
    return await createDownloadPresignedUrl(fileKey, 3600);
  } catch (error) {
    console.error('Failed to get pre-ship photo URL:', error);
    return null;
  }
}

/**
 * 파일 URL에서 S3 키 추출
 */
export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // S3 URL 패턴: https://bucket.s3.region.amazonaws.com/key
    return urlObj.pathname.substring(1); // 앞의 '/' 제거
  } catch {
    return null;
  }
}

/**
 * 이미지 URL이 S3 URL인지 확인
 */
export function isS3Url(url: string): boolean {
  return url.includes('.s3.') && url.includes('.amazonaws.com');
}
