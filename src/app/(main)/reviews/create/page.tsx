'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Star,
  Loader2,
  Upload,
  X,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';

const reviewFormSchema = z.object({
  rating: z.number().min(1, '평점을 선택해주세요').max(5),
  comment: z.string().min(10, '리뷰는 10자 이상이어야 합니다').max(500),
  images: z.array(z.string().url()).max(3).optional(),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

interface OrderInfo {
  id: string;
  orderNumber: string;
  totalKRW: number;
  totalCNY: number;
  post: {
    id: string;
    title: string;
    titleZh?: string;
    images: string[];
  };
  seller: {
    id: string;
    nickname?: string;
    profileImage?: string;
  };
}

const RATING_LABELS = {
  ko: ['', '매우 불만족', '불만족', '보통', '만족', '매우 만족'],
  zh: ['', '非常不满意', '不满意', '一般', '满意', '非常满意'],
};

export default function ReviewCreatePage() {
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
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      images: [],
    },
  });

  const rating = watch('rating');
  const images = watch('images') || [];
  const comment = watch('comment') || '';
  const ratingLabels = language === 'ko' ? RATING_LABELS.ko : RATING_LABELS.zh;

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

    if (images.length + files.length > 3) {
      toast({
        title: language === 'ko' ? '최대 3개까지 업로드 가능합니다' : '最多上传3张图片',
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
            purpose: 'review',
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

      setValue('images', [...images, ...uploadedUrls]);
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
    setValue(
      'images',
      images.filter((_, i) => i !== index)
    );
  };

  // 리뷰 제출
  const onSubmit = async (formData: ReviewFormData) => {
    if (!orderId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          rating: formData.rating,
          comment: formData.comment,
          images: formData.images,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '리뷰가 등록되었습니다' : '评价已提交',
        });
        router.push('/mypage/orders');
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '리뷰 등록 실패' : '提交失败'),
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
        <h1 className="text-2xl font-bold">
          {language === 'ko' ? '리뷰 작성' : '撰写评价'}
        </h1>
      </div>

      {/* 주문 상품 정보 */}
      {order && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
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
                <p className="font-medium text-sm line-clamp-2">
                  {language === 'ko'
                    ? order.post.title
                    : order.post.titleZh || order.post.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ko' ? '판매자' : '卖家'}: {order.seller.nickname || '-'}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 별점 선택 */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {language === 'ko' ? '별점 *' : '评分 *'}
          </Label>
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setValue('rating', star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {(hoverRating || rating) > 0 && (
              <p className="text-sm text-muted-foreground">
                {ratingLabels[hoverRating || rating]}
              </p>
            )}
          </div>
          {errors.rating && (
            <p className="text-xs text-destructive text-center">
              {errors.rating.message}
            </p>
          )}
        </div>

        {/* 리뷰 내용 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="comment" className="text-sm font-medium">
              {language === 'ko' ? '리뷰 내용 *' : '评价内容 *'}
            </Label>
            <span className="text-xs text-muted-foreground">
              {comment.length}/500
            </span>
          </div>
          <Textarea
            id="comment"
            {...register('comment')}
            placeholder={
              language === 'ko'
                ? '상품에 대한 솔직한 리뷰를 작성해주세요 (최소 10자)'
                : '请写下您对商品的真实评价（至少10个字）'
            }
            rows={4}
            maxLength={500}
          />
          {errors.comment && (
            <p className="text-xs text-destructive">{errors.comment.message}</p>
          )}
        </div>

        {/* 리뷰 이미지 (선택) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {language === 'ko' ? '사진 첨부 (선택, 최대 3개)' : '添加照片（可选，最多3张）'}
          </Label>
          <div className="flex gap-2">
            {images.map((url, index) => (
              <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
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
            {images.length < 3 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                {uploadingImages ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {language === 'ko' ? '사진' : '照片'}
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
        </div>

        {/* 제출 버튼 */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'ko' ? '등록 중...' : '提交中...'}
            </>
          ) : (
            language === 'ko' ? '리뷰 등록' : '提交评价'
          )}
        </Button>
      </form>
    </div>
  );
}
