'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ticket,
  ArrowLeft,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

interface Coupon {
  id: string;
  code: string;
  name: string;
  nameZh?: string;
  description?: string;
  descriptionZh?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  expiresAt: string;
  status: 'ACTIVE' | 'USED' | 'EXPIRED';
  usedAt?: string;
}

export default function CouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [couponCode, setCouponCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchCoupons();
    }
  }, [status]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();

      if (data.success) {
        setCoupons(data.data.coupons);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setIsLoading(false);
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
        body: JSON.stringify({ code: couponCode }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '쿠폰이 등록되었습니다' : '优惠券已添加',
        });
        setCouponCode('');
        fetchCoupons();
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '오류가 발생했습니다' : '发生错误'),
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (coupon.status === 'USED') {
      return (
        <Badge variant="outline" className="text-gray-500">
          {language === 'ko' ? '사용완료' : '已使用'}
        </Badge>
      );
    }
    if (coupon.status === 'EXPIRED' || new Date(coupon.expiresAt) < new Date()) {
      return (
        <Badge variant="outline" className="text-gray-500">
          {language === 'ko' ? '만료됨' : '已过期'}
        </Badge>
      );
    }
    const daysLeft = Math.ceil(
      (new Date(coupon.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft <= 7) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          D-{daysLeft}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        {language === 'ko' ? '사용가능' : '可使用'}
      </Badge>
    );
  };

  const availableCoupons = coupons.filter(
    (c) => c.status === 'ACTIVE' && new Date(c.expiresAt) >= new Date()
  );
  const usedCoupons = coupons.filter(
    (c) => c.status === 'USED' || c.status === 'EXPIRED' || new Date(c.expiresAt) < new Date()
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          {language === 'ko' ? '내 쿠폰함' : '我的优惠券'}
        </h1>
      </div>

      {/* 쿠폰 등록 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {language === 'ko' ? '쿠폰 등록' : '添加优惠券'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={language === 'ko' ? '쿠폰 코드 입력' : '输入优惠券代码'}
              className="flex-1"
            />
            <Button onClick={handleRegisterCoupon} disabled={isRegistering}>
              {isRegistering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                language === 'ko' ? '등록' : '添加'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 보유 현황 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '보유 쿠폰' : '持有优惠券'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {availableCoupons.length}
              <span className="text-sm ml-1">
                {language === 'ko' ? '장' : '张'}
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '사용/만료' : '已用/过期'}
            </p>
            <p className="text-2xl font-bold text-muted-foreground">
              {usedCoupons.length}
              <span className="text-sm ml-1">
                {language === 'ko' ? '장' : '张'}
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 쿠폰 목록 */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="available">
                {language === 'ko' ? '사용 가능' : '可使用'} ({availableCoupons.length})
              </TabsTrigger>
              <TabsTrigger value="used">
                {language === 'ko' ? '사용/만료' : '已用/过期'} ({usedCoupons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-0 space-y-4">
              {availableCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'ko' ? '사용 가능한 쿠폰이 없습니다' : '暂无可用优惠券'}</p>
                </div>
              ) : (
                availableCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    language={language}
                    onCopy={copyCode}
                    copiedCode={copiedCode}
                    getStatusBadge={getStatusBadge}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="used" className="mt-0 space-y-4">
              {usedCoupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'ko' ? '사용/만료된 쿠폰이 없습니다' : '暂无已用/过期优惠券'}</p>
                </div>
              ) : (
                usedCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    language={language}
                    onCopy={copyCode}
                    copiedCode={copiedCode}
                    getStatusBadge={getStatusBadge}
                    disabled
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 바로가기 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/mypage/points">
          <Button variant="outline" className="w-full">
            {language === 'ko' ? '내 포인트' : '我的积分'}
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full">
            {language === 'ko' ? '쇼핑하러 가기' : '去购物'}
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface CouponCardProps {
  coupon: Coupon;
  language: 'ko' | 'zh';
  onCopy: (code: string) => void;
  copiedCode: string | null;
  getStatusBadge: (coupon: Coupon) => JSX.Element;
  disabled?: boolean;
}

function CouponCard({ coupon, language, onCopy, copiedCode, getStatusBadge, disabled }: CouponCardProps) {
  const name = language === 'zh' && coupon.nameZh ? coupon.nameZh : coupon.name;
  const description = language === 'zh' && coupon.descriptionZh ? coupon.descriptionZh : coupon.description;

  return (
    <div
      className={`relative border rounded-lg overflow-hidden ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {/* 쿠폰 디자인 */}
      <div className="flex">
        {/* 왼쪽: 할인 정보 */}
        <div className={`w-24 flex-shrink-0 p-4 flex flex-col items-center justify-center ${
          disabled ? 'bg-gray-100' : 'bg-primary/10'
        }`}>
          {coupon.discountType === 'PERCENTAGE' ? (
            <>
              <span className={`text-2xl font-bold ${disabled ? 'text-gray-400' : 'text-primary'}`}>
                {coupon.discountValue}%
              </span>
              <span className="text-xs text-muted-foreground">
                {language === 'ko' ? '할인' : '折扣'}
              </span>
            </>
          ) : (
            <>
              <span className={`text-xl font-bold ${disabled ? 'text-gray-400' : 'text-primary'}`}>
                ₩{coupon.discountValue.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                {language === 'ko' ? '할인' : '折扣'}
              </span>
            </>
          )}
        </div>

        {/* 오른쪽: 쿠폰 정보 */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium">{name}</h3>
            {getStatusBadge(coupon)}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            {coupon.minPurchase && (
              <span>
                {language === 'ko' ? `${coupon.minPurchase.toLocaleString()}원 이상` : `满${coupon.minPurchase.toLocaleString()}韩元`}
              </span>
            )}
            {coupon.maxDiscount && coupon.discountType === 'PERCENTAGE' && (
              <span>
                {language === 'ko' ? `최대 ${coupon.maxDiscount.toLocaleString()}원` : `最高${coupon.maxDiscount.toLocaleString()}韩元`}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              ~{new Date(coupon.expiresAt).toLocaleDateString()}
            </span>

            {!disabled && (
              <button
                onClick={() => onCopy(coupon.code)}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="h-3 w-3" />
                    {language === 'ko' ? '복사됨' : '已复制'}
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    {coupon.code}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 톱니 모양 효과 */}
      <div className="absolute left-[96px] top-0 bottom-0 w-px border-l border-dashed" />
    </div>
  );
}
