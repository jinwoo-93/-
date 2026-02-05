'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingBag, Shield, CreditCard, Truck, Package, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import PointsCouponSelector from '@/components/checkout/PointsCouponSelector';
import BundleShippingInfo from '@/components/shipping/BundleShippingInfo';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/hooks/useToast';
import { shippingAddressSchema } from '@/lib/validations';
import { calculatePlatformFee } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ShippingAddress } from '@/types';

interface ShippingRate {
  companyId: string | null;
  companyName: string;
  companyNameZh: string;
  totalFeeKRW: number;
  totalFeeCNY: number;
  estimatedDays: number;
  averageRating?: number;
  onTimeRate?: number;
  hasExcellentBadge?: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format, currency } = useCurrency();
  const { toast } = useToast();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPriceKRW = useCartStore((state) => state.getTotalPriceKRW);
  const getTotalPriceCNY = useCartStore((state) => state.getTotalPriceCNY);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // 할인 관련 상태
  const [usedPoints, setUsedPoints] = useState(0);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      country: user?.country === 'CN' ? 'CN' : 'KR',
    },
  });

  // 우편번호 변경 감지
  const postalCode = useWatch({ control, name: 'postalCode' });
  const country = useWatch({ control, name: 'country' });

  // 총 무게 계산 (각 상품의 무게가 있다고 가정, 없으면 기본값 0.5kg)
  const totalWeight = items.reduce((sum, item) => {
    const itemWeight = (item.post as any).weight || 0.5;
    return sum + itemWeight * item.quantity;
  }, 0);

  // 배송 방향 결정
  const direction = items[0]?.post.direction || 'KR_TO_CN';

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (items.length === 0) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, authLoading, items.length, router]);

  // 배송비 계산
  const calculateShipping = useCallback(async () => {
    if (!totalWeight) return;

    setIsLoadingShipping(true);
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: totalWeight,
          direction,
          zipCode: postalCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShippingRates(data.data.rates || [data.data]);
        // 추천 배송사 또는 최저가 선택
        const recommended = data.data.recommended || data.data.rates?.[0] || data.data;
        setSelectedShipping(recommended);
      }
    } catch (error) {
      console.error('Failed to calculate shipping:', error);
      // 기본 배송비 설정
      setSelectedShipping({
        companyId: null,
        companyName: '일반 배송',
        companyNameZh: '普通配送',
        totalFeeKRW: 15000,
        totalFeeCNY: 81,
        estimatedDays: 7,
      });
    } finally {
      setIsLoadingShipping(false);
    }
  }, [totalWeight, direction, postalCode]);

  // 초기 배송비 계산
  useEffect(() => {
    calculateShipping();
  }, [calculateShipping]);

  // 우편번호 변경 시 배송비 재계산
  useEffect(() => {
    if (postalCode && postalCode.length >= 5) {
      const timer = setTimeout(() => {
        calculateShipping();
      }, 500); // 디바운스
      return () => clearTimeout(timer);
    }
  }, [postalCode, calculateShipping]);

  const itemPriceKRW = getTotalPriceKRW();
  const itemPriceCNY = getTotalPriceCNY();
  const shippingFeeKRW = selectedShipping?.totalFeeKRW || 15000;
  const shippingFeeCNY = selectedShipping?.totalFeeCNY || 81;
  const platformFeeKRW = calculatePlatformFee(itemPriceKRW, user?.isBusinessVerified || false);
  const platformFeeCNY = calculatePlatformFee(itemPriceCNY, user?.isBusinessVerified || false);
  const totalDiscountKRW = usedPoints + couponDiscount;
  const totalKRW = Math.max(0, itemPriceKRW + shippingFeeKRW + platformFeeKRW - totalDiscountKRW);
  const totalCNY = Math.max(0, itemPriceCNY + shippingFeeCNY + platformFeeCNY - Math.floor(totalDiscountKRW / 185));

  // 묶음 배송용 아이템 변환
  const bundleItems = items.map((item) => ({
    sellerId: item.post.user?.id || '',
    sellerName: item.post.user?.nickname || '',
    quantity: item.quantity,
    shippingFeeKRW: 3000, // 기본 개별 배송비
    shippingFeeCNY: 16,
  }));

  const handlePointsChange = (points: number) => {
    setUsedPoints(points);
  };

  const handleCouponChange = (couponId: string | null, discount: number) => {
    setSelectedCouponId(couponId);
    setCouponDiscount(discount);
  };

  const onSubmit = async (address: ShippingAddress) => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      // 각 아이템에 대해 주문 생성
      for (const item of items) {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: item.post.id,
            quantity: item.quantity,
            shippingAddress: address,
            shippingCompanyId: selectedShipping?.companyId,
            shippingFee: shippingFeeKRW,
          }),
        });

        const data = await response.json();
        if (!data.success) {
          toast({ title: data.error.message, variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }
      }

      toast({ title: language === 'ko' ? '주문이 생성되었습니다' : '订单已创建' });
      clearCart();
      router.push('/orders');
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || items.length === 0) return <LoadingPage />;

  return (
    <div className="container-app py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        {language === 'ko' ? '주문/결제' : '订单确认'}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 왼쪽: 배송지 입력 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('order.shippingAddress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'ko' ? '수령인' : '收货人'}
                    </label>
                    <Input {...register('name')} className="mt-1" />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'ko' ? '연락처' : '联系电话'}
                    </label>
                    <Input {...register('phone')} className="mt-1" />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'ko' ? '국가' : '国家'}
                    </label>
                    <select
                      {...register('country')}
                      className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="KR">{language === 'ko' ? '한국' : '韩国'}</option>
                      <option value="CN">{language === 'ko' ? '중국' : '中国'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'ko' ? '우편번호' : '邮编'}
                    </label>
                    <Input {...register('postalCode')} className="mt-1" />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive mt-1">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '주소' : '地址'}
                  </label>
                  <Input {...register('address1')} className="mt-1" />
                  {errors.address1 && (
                    <p className="text-sm text-destructive mt-1">{errors.address1.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '상세주소' : '详细地址'}
                  </label>
                  <Input {...register('address2')} className="mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'ko' ? '도시' : '城市'}
                  </label>
                  <Input {...register('city')} className="mt-1" />
                  {errors.city && (
                    <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 배송사 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-5 w-5" />
                {language === 'ko' ? '배송사 선택' : '选择物流'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingShipping ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {language === 'ko' ? '배송비 계산 중...' : '计算运费中...'}
                  </span>
                </div>
              ) : shippingRates.length > 1 ? (
                <div className="space-y-3">
                  {shippingRates.map((rate) => (
                    <div
                      key={rate.companyId || 'default'}
                      onClick={() => setSelectedShipping(rate)}
                      className={cn(
                        'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                        selectedShipping?.companyId === rate.companyId
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-muted-foreground/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {language === 'ko' ? rate.companyName : rate.companyNameZh}
                              {rate.hasExcellentBadge && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                  {language === 'ko' ? '우수' : '优秀'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ko'
                                ? `예상 ${rate.estimatedDays}일 소요`
                                : `预计${rate.estimatedDays}天送达`}
                              {rate.averageRating && rate.averageRating > 0 && (
                                <span className="ml-2">
                                  ⭐ {rate.averageRating.toFixed(1)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {format(rate.totalFeeKRW, rate.totalFeeCNY)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {language === 'ko'
                            ? selectedShipping?.companyName || '일반 배송'
                            : selectedShipping?.companyNameZh || '普通配送'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ko'
                            ? `총 ${totalWeight.toFixed(1)}kg · 예상 ${selectedShipping?.estimatedDays || 7}일 소요`
                            : `共${totalWeight.toFixed(1)}kg · 预计${selectedShipping?.estimatedDays || 7}天送达`}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">
                      {format(shippingFeeKRW, shippingFeeCNY)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 포인트/쿠폰 적용 */}
          <PointsCouponSelector
            orderAmount={itemPriceKRW + shippingFeeKRW + platformFeeKRW}
            onPointsChange={handlePointsChange}
            onCouponChange={handleCouponChange}
          />

          {/* 묶음 배송 안내 */}
          {items.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {language === 'ko' ? '묶음 배송 혜택' : '合并发货优惠'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BundleShippingInfo items={bundleItems} showDetails={true} />
              </CardContent>
            </Card>
          )}

          {/* 주문 상품 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {language === 'ko' ? '주문 상품' : '订单商品'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.post.id} className="flex gap-4">
                  <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                    {item.post.images[0] ? (
                      <Image
                        src={item.post.images[0]}
                        alt={item.post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.post.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('post.quantity')}: {item.quantity}
                    </p>
                    <p className="font-bold text-primary">
                      {format(item.post.priceKRW * item.quantity, item.post.priceCNY * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 결제 요약 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {language === 'ko' ? '결제 금액' : '支付金额'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('order.itemPrice')}</span>
                <span>{format(itemPriceKRW, itemPriceCNY)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  {t('order.shippingFee')}
                  <span className="text-xs text-muted-foreground">
                    ({totalWeight.toFixed(1)}kg)
                  </span>
                </span>
                <span>{format(shippingFeeKRW, shippingFeeCNY)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  {t('order.platformFee')} ({user?.isBusinessVerified ? '3%' : '5%'})
                </span>
                <span>{format(platformFeeKRW, platformFeeCNY)}</span>
              </div>

              {/* 할인 금액 */}
              {totalDiscountKRW > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{language === 'ko' ? '할인' : '优惠'}</span>
                  <span>-{format(totalDiscountKRW, Math.floor(totalDiscountKRW / 185))}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>{t('order.totalPrice')}</span>
                <span className="text-primary">{format(totalKRW, totalCNY)}</span>
              </div>
            </CardContent>
          </Card>

          {/* 에스크로 안내 */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {t('payment.escrowInfo')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            form="checkout-form"
            className="w-full"
            size="lg"
            disabled={isSubmitting || isLoadingShipping}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {isSubmitting
              ? language === 'ko'
                ? '처리 중...'
                : '处理中...'
              : `${format(totalKRW, totalCNY)} ${t('payment.pay')}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
