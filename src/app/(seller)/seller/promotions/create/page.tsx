'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Loader2,
  Percent,
  Gift,
  Zap,
  Truck,
  Ticket,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

type PromotionType = 'DISCOUNT' | 'BUNDLE' | 'TIME_SALE' | 'FREE_SHIPPING' | 'COUPON';

interface FormData {
  type: PromotionType;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  discountRate: string;
  discountAmount: string;
  minPurchase: string;
  bundlePostIds: string;
  bundlePrice: string;
  targetPostIds: string;
  startDate: string;
  endDate: string;
}

export default function CreatePromotionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: 'DISCOUNT',
    title: '',
    titleZh: '',
    description: '',
    descriptionZh: '',
    discountRate: '',
    discountAmount: '',
    minPurchase: '',
    bundlePostIds: '',
    bundlePrice: '',
    targetPostIds: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.title.trim()) {
      toast({ title: '제목을 입력해주세요', variant: 'destructive' });
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({ title: '프로모션 기간을 설정해주세요', variant: 'destructive' });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({ title: '종료일은 시작일보다 이후여야 합니다', variant: 'destructive' });
      return;
    }

    // 타입별 필수값 검사
    if (formData.type === 'DISCOUNT' && !formData.discountRate && !formData.discountAmount) {
      toast({ title: '할인율 또는 할인 금액을 입력해주세요', variant: 'destructive' });
      return;
    }

    if (formData.type === 'BUNDLE' && (!formData.bundlePostIds || !formData.bundlePrice)) {
      toast({ title: '묶음 상품 ID와 가격을 입력해주세요', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 데이터 변환
      const payload = {
        type: formData.type,
        title: formData.title,
        titleZh: formData.titleZh || undefined,
        description: formData.description || undefined,
        descriptionZh: formData.descriptionZh || undefined,
        discountRate: formData.discountRate ? parseFloat(formData.discountRate) : undefined,
        discountAmount: formData.discountAmount
          ? parseFloat(formData.discountAmount)
          : undefined,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        bundlePostIds: formData.bundlePostIds
          ? formData.bundlePostIds.split(',').map((id) => id.trim())
          : undefined,
        bundlePrice: formData.bundlePrice ? parseFloat(formData.bundlePrice) : undefined,
        targetPostIds: formData.targetPostIds
          ? formData.targetPostIds.split(',').map((id) => id.trim())
          : [],
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast({ title: '프로모션이 생성되었습니다' });
        router.push('/seller/promotions');
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const typeOptions = [
    { value: 'DISCOUNT', label: '할인', icon: Percent },
    { value: 'BUNDLE', label: '묶음판매', icon: Gift },
    { value: 'TIME_SALE', label: '타임세일', icon: Zap },
    { value: 'FREE_SHIPPING', label: '무료배송', icon: Truck },
    { value: 'COUPON', label: '쿠폰', icon: Ticket },
  ];

  return (
    <div className="max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">프로모션 생성</h1>
          <p className="text-sm text-muted-foreground mt-1">
            판매 촉진을 위한 프로모션을 설정하세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 프로모션 타입 */}
          <Card>
            <CardHeader>
              <CardTitle>프로모션 타입</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, type: option.value as PromotionType }))
                      }
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                        formData.type === option.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 (한국어) *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="예: 겨울 대할인"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleZh">제목 (중국어)</Label>
                  <Input
                    id="titleZh"
                    name="titleZh"
                    value={formData.titleZh}
                    onChange={handleChange}
                    placeholder="例: 冬季大促销"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">설명 (한국어)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="프로모션 설명을 입력하세요"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descriptionZh">설명 (중국어)</Label>
                  <Textarea
                    id="descriptionZh"
                    name="descriptionZh"
                    value={formData.descriptionZh}
                    onChange={handleChange}
                    placeholder="输入促销说明"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 할인 설정 */}
          {(formData.type === 'DISCOUNT' || formData.type === 'TIME_SALE') && (
            <Card>
              <CardHeader>
                <CardTitle>할인 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountRate">할인율 (%)</Label>
                    <Input
                      id="discountRate"
                      name="discountRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.discountRate}
                      onChange={handleChange}
                      placeholder="예: 20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">할인 금액 (₩)</Label>
                    <Input
                      id="discountAmount"
                      name="discountAmount"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.discountAmount}
                      onChange={handleChange}
                      placeholder="예: 5000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">최소 구매 금액 (₩)</Label>
                  <Input
                    id="minPurchase"
                    name="minPurchase"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    placeholder="예: 30000"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">
                    할인율 또는 할인 금액 중 하나만 입력하세요. 둘 다 입력하면 할인율이 우선 적용됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 묶음 판매 설정 */}
          {formData.type === 'BUNDLE' && (
            <Card>
              <CardHeader>
                <CardTitle>묶음 판매 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bundlePostIds">묶음 상품 ID *</Label>
                  <Input
                    id="bundlePostIds"
                    name="bundlePostIds"
                    value={formData.bundlePostIds}
                    onChange={handleChange}
                    placeholder="쉼표로 구분하여 입력 (예: id1, id2, id3)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundlePrice">묶음 가격 (₩) *</Label>
                  <Input
                    id="bundlePrice"
                    name="bundlePrice"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.bundlePrice}
                    onChange={handleChange}
                    placeholder="예: 50000"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 적용 대상 */}
          <Card>
            <CardHeader>
              <CardTitle>적용 대상</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetPostIds">적용 상품 ID</Label>
                <Input
                  id="targetPostIds"
                  name="targetPostIds"
                  value={formData.targetPostIds}
                  onChange={handleChange}
                  placeholder="쉼표로 구분하여 입력 (비워두면 모든 상품)"
                />
                <p className="text-xs text-muted-foreground">
                  특정 상품에만 적용하려면 상품 ID를 입력하세요. 비워두면 모든 상품에 적용됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 기간 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>프로모션 기간</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">시작일 *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">종료일 *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                '프로모션 생성'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
