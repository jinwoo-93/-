'use client';

import { useState, useEffect } from 'react';
import {
  Coins,
  Ticket,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Loader2,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

interface Coupon {
  id: string;
  couponId: string;
  coupon: {
    id: string;
    code: string;
    name: string;
    nameZh?: string;
    discountType: 'FIXED' | 'PERCENTAGE';
    discountValue: number;
    minOrderAmount: number;
    maxDiscount?: number;
    validUntil: string;
  };
}

interface PointsCouponSelectorProps {
  orderAmount: number;
  onPointsChange: (points: number) => void;
  onCouponChange: (couponId: string | null, discountAmount: number) => void;
  className?: string;
}

export default function PointsCouponSelector({
  orderAmount,
  onPointsChange,
  onCouponChange,
  className,
}: PointsCouponSelectorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();

  const [isExpanded, setIsExpanded] = useState(true);

  // 포인트 관련
  const [pointBalance, setPointBalance] = useState(0);
  const [pointInput, setPointInput] = useState('');
  const [usedPoints, setUsedPoints] = useState(0);

  // 쿠폰 관련
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchPointsAndCoupons();
  }, []);

  const fetchPointsAndCoupons = async () => {
    setIsLoading(true);
    try {
      const [pointsRes, couponsRes] = await Promise.all([
        fetch('/api/points'),
        fetch('/api/coupons?status=available'),
      ]);

      const [pointsData, couponsData] = await Promise.all([
        pointsRes.json(),
        couponsRes.json(),
      ]);

      if (pointsData.success) {
        setPointBalance(pointsData.data.balance);
      }

      if (couponsData.success) {
        setCoupons(couponsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch points/coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePointsUse = () => {
    const points = parseInt(pointInput) || 0;

    if (points < 0) {
      toast({
        title: language === 'ko' ? '올바른 포인트를 입력해주세요' : '请输入正确的积分',
        variant: 'destructive',
      });
      return;
    }

    if (points > pointBalance) {
      toast({
        title: language === 'ko' ? '보유 포인트를 초과했습니다' : '超过可用积分',
        variant: 'destructive',
      });
      return;
    }

    // 최대 사용 가능 포인트 (주문 금액까지만)
    const maxUsable = Math.min(points, orderAmount - couponDiscount);
    setUsedPoints(maxUsable);
    onPointsChange(maxUsable);
  };

  const handleUseAllPoints = () => {
    const maxUsable = Math.min(pointBalance, orderAmount - couponDiscount);
    setPointInput(maxUsable.toString());
    setUsedPoints(maxUsable);
    onPointsChange(maxUsable);
  };

  const handleCouponSelect = (couponId: string) => {
    const userCoupon = coupons.find((c) => c.couponId === couponId);

    if (!userCoupon) {
      setSelectedCouponId(null);
      setCouponDiscount(0);
      onCouponChange(null, 0);
      return;
    }

    const coupon = userCoupon.coupon;

    // 최소 주문 금액 확인
    if (orderAmount < coupon.minOrderAmount) {
      toast({
        title: language === 'ko'
          ? `최소 주문 금액은 ${coupon.minOrderAmount.toLocaleString()}원입니다`
          : `最低订单金额为${coupon.minOrderAmount.toLocaleString()}元`,
        variant: 'destructive',
      });
      return;
    }

    // 할인 금액 계산
    let discount = 0;
    if (coupon.discountType === 'FIXED') {
      discount = coupon.discountValue;
    } else {
      discount = Math.floor(orderAmount * (coupon.discountValue / 100));
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    setSelectedCouponId(couponId);
    setCouponDiscount(discount);
    onCouponChange(couponId, discount);

    // 포인트 재계산 (쿠폰 적용 후 남은 금액까지만)
    if (usedPoints > orderAmount - discount) {
      const newPoints = Math.max(0, orderAmount - discount);
      setUsedPoints(newPoints);
      setPointInput(newPoints.toString());
      onPointsChange(newPoints);
    }
  };

  const handleRegisterCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: language === 'ko' ? '쿠폰 코드를 입력해주세요' : '请输入优惠券代码',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '쿠폰이 등록되었습니다' : '优惠券已添加',
        });
        setCouponCode('');
        setCoupons((prev) => [...prev, data.data]);
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const formatCouponValue = (coupon: Coupon['coupon']) => {
    if (coupon.discountType === 'FIXED') {
      return language === 'ko'
        ? `${coupon.discountValue.toLocaleString()}원 할인`
        : `减${coupon.discountValue.toLocaleString()}元`;
    } else {
      const text = `${coupon.discountValue}%`;
      if (coupon.maxDiscount) {
        return language === 'ko'
          ? `${text} (최대 ${coupon.maxDiscount.toLocaleString()}원)`
          : `${text} (最高${coupon.maxDiscount.toLocaleString()}元)`;
      }
      return text;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full"
        >
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {language === 'ko' ? '할인 적용' : '优惠'}
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* 포인트 섹션 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                {language === 'ko' ? '포인트' : '积分'}
              </Label>
              <span className="text-sm text-muted-foreground">
                {language === 'ko' ? '보유: ' : '可用: '}
                <span className="font-medium text-foreground">
                  {pointBalance.toLocaleString()}P
                </span>
              </span>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={language === 'ko' ? '사용할 포인트' : '使用积分'}
                value={pointInput}
                onChange={(e) => setPointInput(e.target.value)}
                min={0}
                max={pointBalance}
              />
              <Button variant="outline" onClick={handleUseAllPoints}>
                {language === 'ko' ? '전액' : '全部'}
              </Button>
              <Button onClick={handlePointsUse}>
                {language === 'ko' ? '적용' : '应用'}
              </Button>
            </div>

            {usedPoints > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>
                  {usedPoints.toLocaleString()}P {language === 'ko' ? '적용됨' : '已应用'}
                  ({language === 'ko' ? '-' : '-'}₩{usedPoints.toLocaleString()})
                </span>
              </div>
            )}
          </div>

          {/* 쿠폰 섹션 */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              {language === 'ko' ? '쿠폰' : '优惠券'}
            </Label>

            {/* 쿠폰 코드 입력 */}
            <div className="flex gap-2">
              <Input
                placeholder={language === 'ko' ? '쿠폰 코드 입력' : '输入优惠券代码'}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button
                variant="outline"
                onClick={handleRegisterCoupon}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  language === 'ko' ? '등록' : '添加'
                )}
              </Button>
            </div>

            {/* 쿠폰 목록 */}
            {coupons.length > 0 ? (
              <RadioGroup
                value={selectedCouponId || ''}
                onValueChange={handleCouponSelect}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50">
                  <RadioGroupItem value="" id="no-coupon" />
                  <Label htmlFor="no-coupon" className="flex-1 cursor-pointer">
                    {language === 'ko' ? '쿠폰 사용 안함' : '不使用优惠券'}
                  </Label>
                </div>

                {coupons.map((userCoupon) => {
                  const coupon = userCoupon.coupon;
                  const isDisabled = orderAmount < coupon.minOrderAmount;

                  return (
                    <div
                      key={userCoupon.couponId}
                      className={`flex items-start space-x-2 p-3 rounded-lg border ${
                        isDisabled
                          ? 'opacity-50 bg-muted/30'
                          : selectedCouponId === userCoupon.couponId
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem
                        value={userCoupon.couponId}
                        id={userCoupon.couponId}
                        disabled={isDisabled}
                      />
                      <Label
                        htmlFor={userCoupon.couponId}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {language === 'zh' && coupon.nameZh
                              ? coupon.nameZh
                              : coupon.name}
                          </span>
                          <Badge variant="secondary">
                            {formatCouponValue(coupon)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>
                            {coupon.minOrderAmount > 0 && (
                              <>
                                {language === 'ko'
                                  ? `${coupon.minOrderAmount.toLocaleString()}원 이상`
                                  : `满${coupon.minOrderAmount.toLocaleString()}元`}
                              </>
                            )}
                          </span>
                          <span>
                            ~{new Date(coupon.validUntil).toLocaleDateString()}
                          </span>
                        </div>
                        {isDisabled && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                            <AlertCircle className="h-3 w-3" />
                            {language === 'ko'
                              ? `${coupon.minOrderAmount.toLocaleString()}원 이상 주문 시 사용 가능`
                              : `订单满${coupon.minOrderAmount.toLocaleString()}元可用`}
                          </div>
                        )}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {language === 'ko' ? '사용 가능한 쿠폰이 없습니다' : '暂无可用优惠券'}
              </div>
            )}

            {selectedCouponId && couponDiscount > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>
                  {language === 'ko' ? '쿠폰 할인: ' : '优惠券折扣: '}
                  -₩{couponDiscount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* 총 할인 금액 */}
          {(usedPoints > 0 || couponDiscount > 0) && (
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm font-medium">
                <span>{language === 'ko' ? '총 할인' : '总优惠'}</span>
                <span className="text-green-600">
                  -₩{(usedPoints + couponDiscount).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
