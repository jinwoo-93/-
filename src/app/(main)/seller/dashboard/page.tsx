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
  Award,
  Gift,
  Zap,
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
import { translate as t } from '@/lib/i18n';
import type { SellerGrade } from '@prisma/client';

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

interface SellerGradeInfo {
  currentGrade: SellerGrade;
  currentScore: number;
  nextGrade: SellerGrade | null;
  nextGradeRequirements: {
    minSales: number;
    minRevenue: number;
    minRating: number;
    maxDisputeRate: number;
  } | null;
  progress: number;
  benefits: {
    commissionDiscount: number;
    priorityDisplay: boolean;
    promotionTools: boolean;
  };
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
  const [gradeInfo, setGradeInfo] = useState<SellerGradeInfo | null>(null);
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
      const [statsRes, ordersRes, productsRes, gradeRes] = await Promise.all([
        fetch(`/api/seller/stats?range=${dateRange}`),
        fetch('/api/seller/orders/recent?limit=5'),
        fetch('/api/seller/products/top?limit=5'),
        fetch('/api/seller/grade'),
      ]);

      const [statsData, ordersData, productsData, gradeData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
        gradeRes.json(),
      ]);

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.data);
      if (productsData.success) setTopProducts(productsData.data);
      if (gradeData.success) setGradeInfo(gradeData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const getGradeBadge = (grade: SellerGrade) => {
    const config = {
      BRONZE: { icon: '🥉', color: 'bg-amber-100 text-amber-800 border-amber-300', name: { ko: '브론즈', zh: '青铜', en: 'Bronze' } },
      SILVER: { icon: '🥈', color: 'bg-gray-100 text-gray-800 border-gray-300', name: { ko: '실버', zh: '白银', en: 'Silver' } },
      GOLD: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', name: { ko: '골드', zh: '黄金', en: 'Gold' } },
      PLATINUM: { icon: '💎', color: 'bg-cyan-100 text-cyan-800 border-cyan-300', name: { ko: '플래티넘', zh: '铂金', en: 'Platinum' } },
      DIAMOND: { icon: '💎💎', color: 'bg-purple-100 text-purple-800 border-purple-300', name: { ko: '다이아몬드', zh: '钻石', en: 'Diamond' } },
    };
    return config[grade];
  };

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

      {/* 판매자 등급 카드 */}
      {gradeInfo && (
        <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t('seller', 'currentGrade', language)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-lg font-bold px-3 py-1',
                        getGradeBadge(gradeInfo.currentGrade).color
                      )}
                    >
                      {getGradeBadge(gradeInfo.currentGrade).icon}{' '}
                      {getGradeBadge(gradeInfo.currentGrade).name[language]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({gradeInfo.currentScore.toFixed(1)} {t('seller', 'points', language)})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  {t('seller', 'benefits', language)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {gradeInfo.benefits.commissionDiscount}% {t('seller', 'discount', language)}
                  </Badge>
                </div>
              </div>
            </div>

            {gradeInfo.nextGrade && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">
                    {t('seller', 'nextGrade', language)}:{' '}
                    {getGradeBadge(gradeInfo.nextGrade).icon}{' '}
                    {getGradeBadge(gradeInfo.nextGrade).name[language]}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {gradeInfo.progress.toFixed(0)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(gradeInfo.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-muted-foreground text-xs">
                      {t('seller', 'salesCount', language)}
                    </p>
                    <p className="font-medium">
                      {stats?.totalSales || 0} / {gradeInfo.nextGradeRequirements?.minSales}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-muted-foreground text-xs">
                      {t('seller', 'revenue', language)}
                    </p>
                    <p className="font-medium">
                      ₩{((stats?.totalRevenueKRW || 0) / 10000).toFixed(0)}만 /{' '}
                      ₩{(gradeInfo.nextGradeRequirements?.minRevenue || 0) / 10000}만
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-muted-foreground text-xs">
                      {t('seller', 'rating', language)}
                    </p>
                    <p className="font-medium">
                      {stats?.averageRating?.toFixed(1) || '0.0'} /{' '}
                      {gradeInfo.nextGradeRequirements?.minRating}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-muted-foreground text-xs">
                      {t('seller', 'disputeRate', language)}
                    </p>
                    <p className="font-medium">
                      {stats?.disputeRate?.toFixed(1) || '0.0'}% /{' '}
                      {gradeInfo.nextGradeRequirements?.maxDisputeRate}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <Link href="/seller/dashboard#orders">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체 보기' : '查看全部'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent id="orders">
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
            <Link href="/seller/dashboard#orders">
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
