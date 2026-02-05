'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, AlertCircle, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface UploadedImage {
  url: string;
  key: string;
  isUploading?: boolean;
  error?: string;
}

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  purpose?: 'post' | 'profile' | 'message' | 'preShipPhoto' | 'dispute';
  className?: string;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  purpose = 'post',
  className,
}: ImageUploaderProps) {
  const { language } = useLanguage();
  const [uploadingImages, setUploadingImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    try {
      // 1. Get presigned URL from our API
      const presignedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          purpose,
        }),
      });

      const presignedResult = await presignedResponse.json();

      if (!presignedResult.success) {
        throw new Error(presignedResult.error?.message || '업로드 URL 생성 실패');
      }

      const { uploadUrl, publicUrl, fileKey } = presignedResult.data;

      // 2. Upload directly to S3/R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('파일 업로드 실패');
      }

      return {
        url: publicUrl,
        key: fileKey,
      };
    } catch (err) {
      return {
        url: '',
        key: '',
        error: err instanceof Error ? err.message : '업로드 중 오류 발생',
      };
    }
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setError(null);

      // Check max images limit
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        setError(
          language === 'ko'
            ? `최대 ${maxImages}장까지 업로드 가능합니다.`
            : `最多可上传${maxImages}张图片。`
        );
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Validate files
      const validFiles: File[] = [];
      for (const file of filesToUpload) {
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(
            language === 'ko'
              ? '이미지 파일만 업로드 가능합니다.'
              : '只能上传图片文件。'
          );
          continue;
        }

        // Check file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(
            language === 'ko'
              ? '파일 크기는 5MB 이하여야 합니다.'
              : '文件大小不能超过5MB。'
          );
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Create placeholder uploading items
      const placeholders: UploadedImage[] = validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        key: `uploading-${Date.now()}-${Math.random()}`,
        isUploading: true,
      }));

      setUploadingImages((prev) => [...prev, ...placeholders]);

      // Upload all files
      const uploadPromises = validFiles.map(async (file, index) => {
        const result = await uploadFile(file);
        return { index, result, placeholder: placeholders[index] };
      });

      const results = await Promise.all(uploadPromises);

      // Process results
      const successfulUrls: string[] = [];
      const errors: string[] = [];

      results.forEach(({ result, placeholder }) => {
        // Revoke object URL
        URL.revokeObjectURL(placeholder.url);

        if (result.error) {
          errors.push(result.error);
        } else if (result.url) {
          successfulUrls.push(result.url);
        }
      });

      // Update state
      setUploadingImages([]);

      if (successfulUrls.length > 0) {
        onImagesChange([...images, ...successfulUrls]);
      }

      if (errors.length > 0) {
        setError(errors[0]);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [images, maxImages, purpose, language, onImagesChange]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const allImages = [
    ...images.map((url) => ({ url, key: url, isUploading: false })),
    ...uploadingImages,
  ];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Image grid */}
      <div className="grid grid-cols-5 gap-2">
        {allImages.map((image, index) => (
          <div
            key={image.key}
            className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
          >
            {image.isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-xs text-gray-500 mt-1">
                  {language === 'ko' ? '업로드 중' : '上传中'}
                </span>
              </div>
            ) : (
              <>
                <Image
                  src={image.url}
                  alt={`Uploaded image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 150px"
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                    {language === 'ko' ? '대표' : '封面'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        ))}

        {/* Upload button */}
        {allImages.length < maxImages && (
          <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadingImages.length > 0}
            />
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1">
              {language === 'ko' ? '추가' : '添加'}
            </span>
          </label>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        {language === 'ko'
          ? `• 최대 ${maxImages}장, 각 5MB 이하 (JPG, PNG, WebP, GIF)`
          : `• 最多${maxImages}张，每张不超过5MB（JPG、PNG、WebP、GIF）`}
      </p>
    </div>
  );
}
