'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';

interface SalesOrder {
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
  buyer: {
    id: string;
    nickname: string;
  };
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function MySalesPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchSalesData();
  }, [isAuthenticated, authLoading]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('/api/orders?type=seller');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
        // 통계 계산
        const totalRevenue = data.data.reduce(
          (sum: number, order: SalesOrder) =>
            order.status === 'CONFIRMED' ? sum + order.totalPrice : sum,
          0
        );
        const pendingOrders = data.data.filter(
          (order: SalesOrder) =>
            order.status === 'PAID' || order.status === 'SHIPPED'
        ).length;
        const completedOrders = data.data.filter(
          (order: SalesOrder) => order.status === 'CONFIRMED'
        ).length;
        setStats({
          totalSales: data.data.length,
          totalRevenue,
          pendingOrders,
          completedOrders,
        });
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const statusLabels: Record<string, { ko: string; zh: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { ko: '결제 대기', zh: '待支付', variant: 'secondary' },
    PAID: { ko: '발송 대기', zh: '待发货', variant: 'default' },
    SHIPPED: { ko: '배송 중', zh: '配送中', variant: 'default' },
    DELIVERED: { ko: '배송 완료', zh: '已送达', variant: 'default' },
    CONFIRMED: { ko: '거래 완료', zh: '已完成', variant: 'default' },
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
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">
          {language === 'ko' ? '판매 관리' : '我的销售'}
        </h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '총 매출' : '总销售额'}
            </p>
            <p className="text-2xl font-bold text-primary">
              {format(stats.totalRevenue, stats.totalRevenue / 185)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '총 거래' : '总交易'}
            </p>
            <p className="text-2xl font-bold">{stats.totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '처리 대기' : '待处理'}
            </p>
            <p className="text-2xl font-bold text-orange-500">
              {stats.pendingOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '완료' : '已完成'}
            </p>
            <p className="text-2xl font-bold text-green-500">
              {stats.completedOrders}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 주문 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '주문 목록' : '订单列表'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="py-8 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'ko' ? '판매 내역이 없습니다' : '暂无销售记录'}
              </p>
              <Link href="/posts/create">
                <Button>{language === 'ko' ? '상품 등록하기' : '发布商品'}</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {order.post.images[0] ? (
                        <Image
                          src={order.post.images[0]}
                          alt={order.post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium line-clamp-1">{order.post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ko' ? '구매자' : '买家'}: {order.buyer.nickname}
                          </p>
                        </div>
                        <Badge variant={statusLabels[order.status]?.variant || 'secondary'}>
                          {statusLabels[order.status]?.[language === 'ko' ? 'ko' : 'zh'] || order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-bold text-primary">
                          {format(order.totalPrice, order.totalPrice / 185)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt, language)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
