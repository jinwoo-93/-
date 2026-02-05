'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Camera,
  Upload,
  X,
  Truck,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  ImagePlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface ShippingCompany {
  id: string;
  name: string;
  nameZh: string;
}

interface ShippingManagerProps {
  orderId: string;
  currentCompanyId?: string;
  onSuccess?: () => void;
}

export function ShippingManager({
  orderId,
  currentCompanyId,
  onSuccess,
}: ShippingManagerProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId || '');
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // 배송사 목록 로드
  useState(() => {
    async function loadCompanies() {
      try {
        const response = await fetch('/api/shipping/companies');
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error('Failed to load shipping companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    loadCompanies();
  });

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (photos.length + files.length > 5) {
      toast({
        title: language === 'ko' ? '최대 5장까지 업로드 가능합니다' : '最多上传5张图片',
        variant: 'destructive',
      });
      return;
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [photos.length, language, toast]);

  // 사진 삭제
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // 이미지 업로드
  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const urls: string[] = [];

    for (const photo of photos) {
      try {
        // Presigned URL 요청
        const presignedRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: photo.file.name,
            contentType: photo.file.type,
            folder: 'shipping',
          }),
        });

        const presignedData = await presignedRes.json();
        if (!presignedData.success) {
          throw new Error('Failed to get upload URL');
        }

        // 이미지 업로드
        await fetch(presignedData.data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': photo.file.type },
          body: photo.file,
        });

        urls.push(presignedData.data.fileUrl);
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    }

    return urls;
  };

  // 발송 처리
  const handleSubmit = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: language === 'ko' ? '운송장 번호를 입력해주세요' : '请输入物流单号',
        variant: 'destructive',
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: language === 'ko' ? '발송 전 상품 사진을 최소 1장 업로드해주세요' : '请至少上传1张发货前商品照片',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // 1. 사진 업로드
      const photoUrls = await uploadPhotos();
      setUploadedUrls(photoUrls);
      setIsUploading(false);

      // 2. 발송 처리 API 호출
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          shippingCompanyId: selectedCompanyId || null,
          preShipPhotos: photoUrls,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '발송 처리가 완료되었습니다' : '发货成功',
        });
        onSuccess?.();
      } else {
        throw new Error(data.error?.message || '발송 처리 실패');
      }
    } catch (error) {
      console.error('Shipping error:', error);
      toast({
        title: language === 'ko' ? '발송 처리 중 오류가 발생했습니다' : '发货失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {language === 'ko' ? '발송 처리' : '发货'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 발송 전 사진 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === 'ko' ? '발송 전 상품 사진' : '发货前商品照片'}
            <span className="text-destructive ml-1">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            {language === 'ko'
              ? '분쟁 발생 시 증거로 사용됩니다. 상품 상태와 포장 상태를 명확하게 촬영해주세요.'
              : '如发生争议，将作为证据使用。请清晰拍摄商品状态和包装情况。'}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* 업로드된 사진들 */}
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <Image
                  src={photo.preview}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* 업로드 버튼 */}
            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">{photos.length}/5</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* 배송사 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === 'ko' ? '배송사' : '物流公司'}
          </label>
          <Select
            value={selectedCompanyId}
            onValueChange={setSelectedCompanyId}
            disabled={isLoadingCompanies}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={language === 'ko' ? '배송사 선택' : '选择物流公司'}
              />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {language === 'ko' ? company.name : company.nameZh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 운송장 번호 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {language === 'ko' ? '운송장 번호' : '物流单号'}
            <span className="text-destructive ml-1">*</span>
          </label>
          <Input
            placeholder={language === 'ko' ? '운송장 번호 입력' : '请输入物流单号'}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        {/* 안내 메시지 */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">
            {language === 'ko'
              ? '발송 처리 후에는 취소가 불가능합니다. 정확한 정보를 입력해주세요.'
              : '发货后无法取消，请确认信息准确无误。'}
          </p>
        </div>

        {/* 발송 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || photos.length === 0 || !trackingNumber.trim()}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {isUploading
                ? language === 'ko' ? '사진 업로드 중...' : '上传照片中...'
                : language === 'ko' ? '발송 처리 중...' : '发货中...'}
            </>
          ) : (
            <>
              <Package className="h-5 w-5 mr-2" />
              {language === 'ko' ? '발송 완료' : '确认发货'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * 발송 사진 조회 컴포넌트
 */
interface PreShipPhotosViewerProps {
  photos: string[];
}

export function PreShipPhotosViewer({ photos }: PreShipPhotosViewerProps) {
  const { language } = useLanguage();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium mb-2">
        {language === 'ko' ? '발송 전 상품 사진' : '发货前商品照片'}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity"
          >
            <Image
              src={photo}
              alt={`Pre-ship photo ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* 전체 화면 보기 모달 */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            onClick={() => setSelectedIndex(null)}
          >
            <X className="h-8 w-8" />
          </button>
          <div className="relative w-full max-w-3xl aspect-square">
            <Image
              src={photos[selectedIndex]}
              alt={`Pre-ship photo ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(index);
                }}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === selectedIndex ? 'bg-white' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
