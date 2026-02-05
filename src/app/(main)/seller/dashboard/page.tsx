'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Star,
  Eye,
  Truck,
  Clock,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalSales: number;
  totalRevenueKRW: number;
  totalRevenueCNY: number;
  thisMonthSales: number;
  thisMonthRevenueKRW: number;
  averageRating: number;
  totalReviews: number;
  totalViews: number;
  pendingOrders: number;
  shippingOrders: number;
  completedOrders: number;
  disputeRate: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalKRW: number;
  totalCNY: number;
  createdAt: string;
  buyer: {
    nickname: string;
  };
  post: {
    title: string;
    images: string[];
  };
}

interface TopProduct {
  id: string;
  title: string;
  titleZh: string | null;
  images: string[];
  priceKRW: number;
  soldCount: number;
  viewCount: number;
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, isAuthenticated, dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch(`/api/seller/stats?range=${dateRange}`),
        fetch('/api/seller/orders/recent?limit=5'),
        fetch('/api/seller/products/top?limit=5'),
      ]);

      const [statsData, ordersData, productsData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.data);
      if (productsData.success) setTopProducts(productsData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const orderStatusColor: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    SHIPPING: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CONFIRMED: 'bg-gray-100 text-gray-800',
    DISPUTED: 'bg-red-100 text-red-800',
  };

  const orderStatusLabel: Record<string, Record<string, string>> = {
    ko: {
      PENDING_PAYMENT: '결제 대기',
      PAID: '결제 완료',
      SHIPPING: '배송 중',
      DELIVERED: '배송 완료',
      CONFIRMED: '구매 확정',
      DISPUTED: '분쟁 중',
    },
    zh: {
      PENDING_PAYMENT: '待付款',
      PAID: '已付款',
      SHIPPING: '配送中',
      DELIVERED: '已送达',
      CONFIRMED: '已确认',
      DISPUTED: '争议中',
    },
  };

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'ko' ? '판매자 대시보드' : '卖家中心'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ko'
              ? `안녕하세요, ${user?.nickname || user?.name}님!`
              : `您好，${user?.nickname || user?.name}！`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '7d'
                ? language === 'ko' ? '7일' : '7天'
                : range === '30d'
                ? language === 'ko' ? '30일' : '30天'
                : language === 'ko' ? '90일' : '90天'}
            </Button>
          ))}
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '총 매출' : '总销售额'}
                </p>
                <p className="text-2xl font-bold">
                  {format(stats?.totalRevenueKRW || 0, stats?.totalRevenueCNY || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '총 판매 건수' : '总销量'}
                </p>
                <p className="text-2xl font-bold">{stats?.totalSales || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '평균 평점' : '平均评分'}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({stats?.totalReviews || 0})
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '상품 조회수' : '商品浏览量'}
                </p>
                <p className="text-2xl font-bold">
                  {stats?.totalViews?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주문 현황 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">
                  {language === 'ko' ? '발송 대기' : '待发货'}
                </p>
                <p className="text-3xl font-bold text-yellow-800">
                  {stats?.pendingOrders || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  {language === 'ko' ? '배송 중' : '配送中'}
                </p>
                <p className="text-3xl font-bold text-blue-800">
                  {stats?.shippingOrders || 0}
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">
                  {language === 'ko' ? '완료' : '已完成'}
                </p>
                <p className="text-3xl font-bold text-green-800">
                  {stats?.completedOrders || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {language === 'ko' ? '최근 주문' : '最新订单'}
            </CardTitle>
            <Link href="/seller/orders">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체 보기' : '查看全部'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'ko' ? '최근 주문이 없습니다' : '暂无订单'}
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">
                          {order.post?.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.buyer?.nickname} · {formatDate(order.createdAt, language)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={cn(
                          'text-xs',
                          orderStatusColor[order.status] || 'bg-gray-100'
                        )}
                      >
                        {orderStatusLabel[language]?.[order.status] || order.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {format(order.totalKRW, order.totalCNY)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 인기 상품 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {language === 'ko' ? '인기 상품' : '热门商品'}
            </CardTitle>
            <Link href="/mypage/posts">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체 보기' : '查看全部'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {language === 'ko' ? '등록된 상품이 없습니다' : '暂无商品'}
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/posts/${product.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="w-6 text-center font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-sm line-clamp-1">
                        {language === 'zh' && product.titleZh
                          ? product.titleZh
                          : product.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {product.soldCount}
                          {language === 'ko' ? '건' : '件'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {product.viewCount}
                        </span>
                      </div>
                    </div>
                    <p className="font-medium">
                      ₩{product.priceKRW.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/posts/create">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Package className="h-6 w-6" />
                <span>{language === 'ko' ? '상품 등록' : '发布商品'}</span>
              </Button>
            </Link>
            <Link href="/seller/orders">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <ShoppingBag className="h-6 w-6" />
                <span>{language === 'ko' ? '주문 관리' : '订单管理'}</span>
              </Button>
            </Link>
            <Link href="/mypage/reviews">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Star className="h-6 w-6" />
                <span>{language === 'ko' ? '리뷰 관리' : '评价管理'}</span>
              </Button>
            </Link>
            <Link href="/mypage/profile">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>{language === 'ko' ? '상세 통계' : '详细统计'}</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
