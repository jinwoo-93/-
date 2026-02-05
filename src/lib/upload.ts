import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// 지원하는 이미지 타입
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// 최대 파일 크기 (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// S3 클라이언트 설정 (Cloudflare R2 호환)
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'jikguyeokgu';
const CDN_URL = process.env.CDN_URL || process.env.S3_PUBLIC_URL || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * 파일 유효성 검사
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // 파일 타입 검사
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `지원하지 않는 파일 형식입니다. (지원: ${ALLOWED_IMAGE_TYPES.join(', ')})`,
    };
  }

  // 파일 크기 검사
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  return { valid: true };
}

/**
 * 고유한 파일 키 생성
 */
export function generateFileKey(
  folder: string,
  originalFilename: string,
  userId?: string
): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  const userPrefix = userId ? `${userId.slice(0, 8)}/` : '';

  return `${folder}/${userPrefix}${timestamp}-${uuid}.${ext}`;
}

/**
 * S3/R2에 파일 업로드
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // 공개 읽기 권한 (CDN 사용 시)
      ACL: 'public-read',
    });

    await s3Client.send(command);

    const url = CDN_URL
      ? `${CDN_URL}/${key}`
      : `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('[Upload] S3 upload error:', error);
    return {
      success: false,
      error: '파일 업로드에 실패했습니다.',
    };
  }
}

/**
 * S3/R2에서 파일 삭제
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('[Upload] S3 delete error:', error);
    return false;
  }
}

/**
 * Presigned URL 생성 (클라이언트 직접 업로드용)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ url: string; fields?: Record<string, string> } | null> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return { url };
  } catch (error) {
    console.error('[Upload] Presigned URL error:', error);
    return null;
  }
}

/**
 * 이미지 URL에서 키 추출
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    // CDN URL이나 S3 URL에서 키 추출
    if (CDN_URL && url.startsWith(CDN_URL)) {
      return url.replace(`${CDN_URL}/`, '');
    }

    // S3 URL 패턴
    const s3Pattern = new RegExp(`${BUCKET_NAME}/(.+)$`);
    const match = url.match(s3Pattern);

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * 여러 이미지 삭제
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map(async (url) => {
    const key = extractKeyFromUrl(url);
    if (key) {
      await deleteFromS3(key);
    }
  });

  await Promise.allSettled(deletePromises);
}

/**
 * Base64 이미지를 업로드 (폴백용)
 */
export async function uploadBase64Image(
  base64Data: string,
  folder: string,
  userId?: string
): Promise<UploadResult> {
  try {
    // base64 데이터에서 실제 데이터 추출
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: '잘못된 이미지 형식입니다.' };
    }

    const contentType = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, 'base64');

    // 파일 크기 검사
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
      };
    }

    const ext = contentType.split('/')[1] || 'jpg';
    const key = generateFileKey(folder, `image.${ext}`, userId);

    return await uploadToS3(buffer, key, contentType);
  } catch (error) {
    console.error('[Upload] Base64 upload error:', error);
    return { success: false, error: '이미지 업로드에 실패했습니다.' };
  }
}
