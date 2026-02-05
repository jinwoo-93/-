'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Camera,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { ShippingManager, PreShipPhotosViewer } from '@/components/order/ShippingManager';
import ShippingTracker from '@/components/shipping/ShippingTracker';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { format } = useCurrency();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isShipping, setIsShipping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrder();
  }, [params.id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
        router.push('/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShip = async () => {
    if (!trackingNumber) {
      toast({
        title: language === 'ko' ? '운송장 번호를 입력해주세요' : '请输入物流单号',
        variant: 'destructive',
      });
      return;
    }

    setIsShipping(true);
    try {
      const response = await fetch(`/api/orders/${params.id}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          shippingCompanyId: order?.shippingCompanyId,
          preShipPhotos: ['/images/placeholder.jpg'], // TODO: 실제 이미지 업로드
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: language === 'ko' ? '발송 처리되었습니다' : '已发货' });
        fetchOrder();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsShipping(false);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch(`/api/orders/${params.id}/confirm`, {
        method: 'PATCH',
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: language === 'ko' ? '구매가 확정되었습니다' : '已确认收货' });
        fetchOrder();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!order) return null;

  const isBuyer = order.buyerId === user?.id;
  const isSeller = order.sellerId === user?.id;

  const orderTimeline = [
    {
      status: 'PENDING_PAYMENT',
      icon: Package,
      label: language === 'ko' ? '주문 생성' : '订单创建',
      date: order.createdAt,
      completed: true,
    },
    {
      status: 'PAID',
      icon: CheckCircle,
      label: language === 'ko' ? '결제 완료' : '已付款',
      date: order.paidAt,
      completed: !!order.paidAt,
    },
    {
      status: 'SHIPPING',
      icon: Truck,
      label: language === 'ko' ? '배송 시작' : '已发货',
      date: order.shippedAt,
      completed: !!order.shippedAt,
    },
    {
      status: 'DELIVERED',
      icon: Package,
      label: language === 'ko' ? '배송 완료' : '已送达',
      date: order.deliveredAt,
      completed: !!order.deliveredAt,
    },
    {
      status: 'CONFIRMED',
      icon: CheckCircle,
      label: language === 'ko' ? '구매 확정' : '已确认',
      date: order.confirmedAt,
      completed: !!order.confirmedAt,
    },
  ];

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{t('order.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('order.orderNumber')}: {order.orderNumber}
          </p>
        </div>
        <Badge
          variant={
            order.status === 'CONFIRMED'
              ? 'success'
              : order.status === 'DISPUTED'
              ? 'destructive'
              : 'secondary'
          }
        >
          {ORDER_STATUS_LABELS[language][order.status as keyof typeof ORDER_STATUS_LABELS.ko]}
        </Badge>
      </div>

      {/* 타임라인 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '주문 진행 상황' : '订单状态'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {orderTimeline.map((item, index) => (
              <div key={item.status} className="flex gap-4 pb-6 last:pb-0">
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  {index < orderTimeline.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${
                        item.completed ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={item.completed ? 'font-medium' : 'text-muted-foreground'}>
                    {item.label}
                  </p>
                  {item.date && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.date, language)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 상품 정보 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden">
              {order.post?.images?.[0] ? (
                <Image
                  src={order.post.images[0]}
                  alt={order.post.title || ''}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium line-clamp-2">
                {language === 'zh' && order.post?.titleZh
                  ? order.post.titleZh
                  : order.post?.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('post.quantity')}: {order.quantity}
              </p>
              <p className="font-bold text-primary mt-1">
                {format(order.totalKRW, order.totalCNY)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배송 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t('shipping.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('order.shippingAddress')}</p>
            <p className="font-medium">{order.shippingAddress?.name}</p>
            <p className="text-sm">
              {order.shippingAddress?.address1} {order.shippingAddress?.address2}
            </p>
            <p className="text-sm">
              {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            </p>
            <p className="text-sm">{order.shippingAddress?.phone}</p>
          </div>

          {order.trackingNumber && (
            <div>
              <p className="text-sm text-muted-foreground">{t('order.trackingNumber')}</p>
              <p className="font-medium">{order.trackingNumber}</p>
              {order.shippingCompany && (
                <p className="text-sm text-muted-foreground">
                  {language === 'ko'
                    ? order.shippingCompany.name
                    : order.shippingCompany.nameZh}
                </p>
              )}
            </div>
          )}

          {/* 발송 전 상품 사진 */}
          {order.preShipPhotos && order.preShipPhotos.length > 0 && (
            <PreShipPhotosViewer photos={order.preShipPhotos} />
          )}
        </CardContent>
      </Card>

      {/* 실시간 배송 추적 */}
      {order.trackingNumber && (order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
        <ShippingTracker
          orderId={order.id}
          trackingNumber={order.trackingNumber}
          carrier={order.shippingCompany?.code}
          className="mb-6"
        />
      )}

      {/* 가격 정보 */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('order.itemPrice')}</span>
            <span>{format(order.itemPriceKRW, order.itemPriceCNY)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t('order.shippingFee')}</span>
            <span>{format(order.shippingFeeKRW, order.shippingFeeCNY)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t('order.platformFee')} ({(order.feeRate * 100).toFixed(0)}%)</span>
            <span>{format(order.platformFeeKRW, order.platformFeeCNY)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>{t('order.totalPrice')}</span>
            <span className="text-primary">{format(order.totalKRW, order.totalCNY)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="space-y-3">
        {/* 판매자: 발송 처리 */}
        {isSeller && order.status === 'PAID' && (
          <ShippingManager
            orderId={order.id}
            currentCompanyId={order.shippingCompanyId || undefined}
            onSuccess={fetchOrder}
          />
        )}

        {/* 구매자: 구매 확정 */}
        {isBuyer && (order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming
              ? language === 'ko'
                ? '처리 중...'
                : '处理中...'
              : t('order.confirmPurchase')}
          </Button>
        )}

        {/* 분쟁 신청 */}
        {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
          <Link href={`/disputes/create?orderId=${order.id}`}>
            <Button variant="outline" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t('order.openDispute')}
            </Button>
          </Link>
        )}

        {/* 메시지 */}
        <Link href={`/messages/${isBuyer ? order.sellerId : order.buyerId}`}>
          <Button variant="outline" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            {isBuyer
              ? language === 'ko'
                ? '판매자에게 문의'
                : '联系卖家'
              : language === 'ko'
              ? '구매자에게 문의'
              : '联系买家'}
          </Button>
        </Link>

        {/* 리뷰 작성 (구매 확정 후) */}
        {isBuyer && order.status === 'CONFIRMED' && !order.reviews?.length && (
          <Link href={`/reviews/create?orderId=${order.id}`}>
            <Button variant="secondary" className="w-full">
              {language === 'ko' ? '리뷰 작성하기' : '写评价'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
