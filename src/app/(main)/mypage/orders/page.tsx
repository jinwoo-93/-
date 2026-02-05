'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  post: {
    id: string;
    title: string;
    images: string[];
  };
  seller: {
    id: string;
    nickname: string;
  };
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, authLoading]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?type=buyer');
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

  if (authLoading || isLoading) return <LoadingPage />;

  const statusLabels: Record<string, { ko: string; zh: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { ko: '결제 대기', zh: '待支付', variant: 'secondary' },
    PAID: { ko: '결제 완료', zh: '已支付', variant: 'default' },
    SHIPPED: { ko: '배송 중', zh: '配送中', variant: 'default' },
    DELIVERED: { ko: '배송 완료', zh: '已送达', variant: 'default' },
    CONFIRMED: { ko: '구매 확정', zh: '已确认', variant: 'default' },
    DISPUTE: { ko: '분쟁 중', zh: '争议中', variant: 'destructive' },
    CANCELLED: { ko: '취소됨', zh: '已取消', variant: 'secondary' },
  };

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ko' ? '뒤로가기' : '返回'}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">
          {language === 'ko' ? '구매 내역' : '我的订单'}
        </h1>
      </div>

      {/* 주문 목록 */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {language === 'ko' ? '구매 내역이 없습니다' : '暂无订单'}
            </p>
            <Link href="/posts">
              <Button>{language === 'ko' ? '쇼핑하러 가기' : '去购物'}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {order.post.images[0] ? (
                        <Image
                          src={order.post.images[0]}
                          alt={order.post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium line-clamp-1">{order.post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ko' ? '판매자' : '卖家'}: {order.seller.nickname}
                          </p>
                        </div>
                        <Badge variant={statusLabels[order.status]?.variant || 'secondary'}>
                          {statusLabels[order.status]?.[language === 'ko' ? 'ko' : 'zh'] || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-primary">
                          {format(order.totalPrice, order.totalPrice / 185)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
