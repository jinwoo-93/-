'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { ORDER_STATUS_LABELS } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, role]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders?role=${role}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'DISPUTED':
      case 'CANCELLED':
        return 'destructive';
      case 'SHIPPING':
      case 'DELIVERED':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (authLoading) return <LoadingPage />;

  return (
    <div className="container-app py-6">
      <h1 className="text-2xl font-bold mb-6">{t('order.title')}</h1>

      {/* 역할 탭 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={role === 'buyer' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRole('buyer')}
        >
          {language === 'ko' ? '구매 내역' : '我买到的'}
        </Button>
        <Button
          variant={role === 'seller' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setRole('seller')}
        >
          {language === 'ko' ? '판매 내역' : '我卖出的'}
        </Button>
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* 이미지 */}
                    <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {order.post?.images?.[0] ? (
                        <Image
                          src={order.post.images[0]}
                          alt={order.post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium line-clamp-1">
                            {language === 'zh' && order.post?.titleZh
                              ? order.post.titleZh
                              : order.post?.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('order.orderNumber')}: {order.orderNumber}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {ORDER_STATUS_LABELS[language][order.status as keyof typeof ORDER_STATUS_LABELS.ko]}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-bold text-primary">
                            {format(order.totalKRW, order.totalCNY)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('post.quantity')}: {order.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-xs">
                            {formatRelativeTime(order.createdAt, language)}
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ko' ? '주문 내역이 없습니다.' : '暂无订单'}
            </p>
            <Link href="/posts">
              <Button className="mt-4">
                {language === 'ko' ? '쇼핑하러 가기' : '去逛逛'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
