import { z } from 'zod';

// 허용되는 이미지 MIME 타입
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

// 허용되는 이미지 확장자
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;

// 최대 파일 크기 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 최대 업로드 가능한 이미지 수
export const MAX_IMAGES_PER_POST = 10;
export const MAX_IMAGES_PER_MESSAGE = 5;
export const MAX_PRE_SHIP_PHOTOS = 10;

/**
 * 클라이언트용 이미지 파일 검증 스키마
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    { message: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.` }
  )
  .refine(
    (file) => ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number]),
    { message: '허용되지 않는 파일 형식입니다. (jpg, png, webp, gif만 허용)' }
  );

/**
 * 다중 이미지 파일 검증 스키마
 */
export const multipleImagesSchema = z
  .array(imageFileSchema)
  .max(MAX_IMAGES_PER_POST, { message: `최대 ${MAX_IMAGES_PER_POST}개의 이미지만 업로드할 수 있습니다.` });

/**
 * 서버용 이미지 업로드 요청 검증 스키마
 */
export const imageUploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  size: z.number().max(MAX_FILE_SIZE, {
    message: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`,
  }),
  purpose: z.enum(['post', 'profile', 'message', 'preShipPhoto', 'dispute']),
});

/**
 * 파일 확장자 추출
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * 파일 확장자가 허용되는지 확인
 */
export function isAllowedExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext as typeof ALLOWED_IMAGE_EXTENSIONS[number]);
}

/**
 * MIME 타입이 허용되는지 확인
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_TYPES[number]);
}

/**
 * 파일 크기가 허용 범위 내인지 확인
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * 이미지 파일 전체 검증
 */
export function validateImageFile(file: {
  name: string;
  type: string;
  size: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isAllowedExtension(file.name)) {
    errors.push('허용되지 않는 파일 확장자입니다.');
  }

  if (!isAllowedMimeType(file.type)) {
    errors.push('허용되지 않는 파일 형식입니다.');
  }

  if (!isValidFileSize(file.size)) {
    errors.push(`파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
