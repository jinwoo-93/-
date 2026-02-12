'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertTriangle,
  Loader2,
  Upload,
  X,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';

const disputeFormSchema = z.object({
  reason: z.string().min(1, '분쟁 사유를 선택해주세요'),
  description: z.string().min(20, '상세 설명은 20자 이상이어야 합니다').max(2000),
  evidence: z.array(z.string().url()).min(1, '증거 이미지를 1개 이상 업로드해주세요').max(5),
});

type DisputeFormData = z.infer<typeof disputeFormSchema>;

interface OrderInfo {
  id: string;
  orderNumber: string;
  totalKRW: number;
  totalCNY: number;
  status: string;
  post: {
    id: string;
    title: string;
    titleZh?: string;
    images: string[];
  };
  seller: {
    nickname?: string;
  };
}

const DISPUTE_REASONS = {
  ko: [
    { value: '상품 미도착', label: '상품 미도착' },
    { value: '상품 불량', label: '상품 불량/파손' },
    { value: '설명과 다름', label: '상품 설명과 다름' },
    { value: '수량 부족', label: '수량 부족' },
    { value: '기타', label: '기타' },
  ],
  zh: [
    { value: '상품 미도착', label: '未收到商品' },
    { value: '상품 불량', label: '商品质量问题/损坏' },
    { value: '설명과 다름', label: '与描述不符' },
    { value: '수량 부족', label: '数量不足' },
    { value: '기타', label: '其他' },
  ],
};

export default function DisputeCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { language } = useLanguage();
  const { formatKRW, formatCNY } = useCurrency();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      reason: '',
      description: '',
      evidence: [],
    },
  });

  const evidence = watch('evidence');
  const reasons = language === 'ko' ? DISPUTE_REASONS.ko : DISPUTE_REASONS.zh;

  // 주문 정보 로드
  useEffect(() => {
    if (!orderId) {
      toast({
        title: language === 'ko' ? '주문 정보가 없습니다' : '缺少订单信息',
        variant: 'destructive',
      });
      router.push('/mypage/orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          toast({
            title: data.error?.message || (language === 'ko' ? '주문을 찾을 수 없습니다' : '找不到订单'),
            variant: 'destructive',
          });
          router.push('/mypage/orders');
        }
      } catch {
        toast({
          title: language === 'ko' ? '네트워크 오류' : '网络错误',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [orderId, router, toast, language]);

  // 이미지 업로드
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = evidence || [];
    if (currentImages.length + files.length > 5) {
      toast({
        title: language === 'ko' ? '최대 5개까지 업로드 가능합니다' : '最多上传5张图片',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            purpose: 'evidence',
          }),
        });
        const data = await response.json();

        if (data.success) {
          await fetch(data.data.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          uploadedUrls.push(data.data.publicUrl);
        }
      }

      setValue('evidence', [...currentImages, ...uploadedUrls]);
    } catch {
      toast({
        title: language === 'ko' ? '이미지 업로드 실패' : '图片上传失败',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const current = evidence || [];
    setValue(
      'evidence',
      current.filter((_, i) => i !== index)
    );
  };

  // 분쟁 제출
  const onSubmit = async (formData: DisputeFormData) => {
    if (!orderId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: formData.reason,
          description: formData.description,
          evidence: formData.evidence,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '분쟁이 신청되었습니다' : '争议已提交',
        });
        router.push(`/disputes/${data.data.id}`);
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '분쟁 신청 실패' : '提交失败'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: language === 'ko' ? '네트워크 오류' : '网络错误',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            {language === 'ko' ? '분쟁 신청' : '提交争议'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'ko'
              ? '주문에 문제가 있으신 경우 분쟁을 신청해주세요'
              : '如果订单有问题，请提交争议'}
          </p>
        </div>
      </div>

      {/* 주문 정보 */}
      {order && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'ko' ? '주문 정보' : '订单信息'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {order.post.images?.[0] ? (
                  <Image
                    src={order.post.images[0]}
                    alt={order.post.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">
                  {language === 'ko'
                    ? order.post.title
                    : order.post.titleZh || order.post.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ko' ? '주문번호' : '订单号'}: {order.orderNumber}
                </p>
                <p className="font-bold text-sm mt-1">
                  {formatKRW(order.totalKRW)}{' '}
                  <span className="text-xs text-muted-foreground font-normal">
                    ({formatCNY(order.totalCNY)})
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 분쟁 신청 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 분쟁 사유 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {language === 'ko' ? '분쟁 사유 *' : '争议原因 *'}
          </Label>
          <div className="grid grid-cols-1 gap-2">
            {reasons.map((reason) => (
              <label
                key={reason.value}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  watch('reason') === reason.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  value={reason.value}
                  {...register('reason')}
                  className="accent-primary"
                />
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>
          {errors.reason && (
            <p className="text-xs text-destructive">{errors.reason.message}</p>
          )}
        </div>

        {/* 상세 설명 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {language === 'ko' ? '상세 설명 *' : '详细说明 *'}
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={
              language === 'ko'
                ? '문제 상황을 구체적으로 설명해주세요 (최소 20자)'
                : '请详细描述问题情况（至少20个字）'
            }
            rows={5}
          />
          {errors.description && (
            <p className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* 증거 이미지 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {language === 'ko' ? '증거 이미지 * (최대 5개)' : '证据图片 *（最多5张）'}
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {(evidence || []).map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {(evidence || []).length < 5 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                {uploadingImages ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {language === 'ko' ? '업로드' : '上传'}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
              </label>
            )}
          </div>
          {errors.evidence && (
            <p className="text-xs text-destructive">{errors.evidence.message}</p>
          )}
        </div>

        {/* 안내 사항 */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <p className="text-xs text-orange-800">
              {language === 'ko'
                ? '분쟁이 접수되면 양측 의견을 수렴하여 공정하게 해결됩니다. 허위 분쟁은 불이익을 받을 수 있습니다.'
                : '争议提交后，我们将听取双方意见并公正解决。虚假争议可能会受到处罚。'}
            </p>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ko' ? '제출 중...' : '提交中...'}
            </>
          ) : (
            language === 'ko' ? '분쟁 신청하기' : '提交争议'
          )}
        </Button>
      </form>
    </div>
  );
}
