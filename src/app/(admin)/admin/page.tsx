'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  Clock,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

interface DashboardStats {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    totalPosts: number;
    activePosts: number;
    newPostsToday: number;
    totalOrders: number;
    ordersToday: number;
    ordersThisWeek: number;
    pendingOrders: number;
  };
  disputes: {
    pending: number;
    active: number;
    recent: Array<{
      id: string;
      orderNumber: string;
      reporter: string;
      reason: string;
      createdAt: string;
    }>;
  };
  revenue: {
    todayRevenue: number;
    lastMonthRevenue: number;
    todayTransactions: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    buyer: string;
    seller: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchStats();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: '대기', variant: 'outline' },
      PAID: { label: '결제완료', variant: 'default' },
      PROCESSING: { label: '처리중', variant: 'secondary' },
      SHIPPED: { label: '배송중', variant: 'default' },
      DELIVERED: { label: '배송완료', variant: 'default' },
      COMPLETED: { label: '완료', variant: 'secondary' },
      CANCELLED: { label: '취소', variant: 'destructive' },
    };
    const badge = badges[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  if (authLoading || isLoading) return <LoadingPage />;
  if (!stats) return null;

  const statCards = [
    {
      title: language === 'ko' ? '총 회원' : '总用户',
      value: stats.overview.totalUsers.toLocaleString(),
      subValue: `+${stats.overview.newUsersToday} ${language === 'ko' ? '오늘' : '今日'}`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up',
    },
    {
      title: language === 'ko' ? '활성 상품' : '活跃商品',
      value: stats.overview.activePosts.toLocaleString(),
      subValue: `/${stats.overview.totalPosts.toLocaleString()} ${language === 'ko' ? '전체' : '总计'}`,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: language === 'ko' ? '오늘 주문' : '今日订单',
      value: stats.overview.ordersToday.toLocaleString(),
      subValue: `${stats.overview.ordersThisWeek.toLocaleString()} ${language === 'ko' ? '이번 주' : '本周'}`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up',
    },
    {
      title: language === 'ko' ? '대기 분쟁' : '待处理争议',
      value: stats.disputes.pending.toString(),
      subValue: `${stats.disputes.active} ${language === 'ko' ? '진행 중' : '进行中'}`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      alert: stats.disputes.pending > 0,
      link: '/admin/disputes',
    },
    {
      title: language === 'ko' ? '오늘 수수료' : '今日手续费',
      value: `₩${stats.revenue.todayRevenue.toLocaleString()}`,
      subValue: `${stats.revenue.todayTransactions} ${language === 'ko' ? '건' : '笔'}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: language === 'ko' ? '처리 대기 주문' : '待处理订单',
      value: stats.overview.pendingOrders.toString(),
      subValue: language === 'ko' ? '발송 대기' : '待发货',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      alert: stats.overview.pendingOrders > 0,
    },
  ];

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'ko' ? '관리자 대시보드' : '管理后台'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {language === 'ko' ? '새로고침' : '刷新'}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, index) => (
          <Card
            key={index}
            className={`${card.alert ? 'border-red-200 bg-red-50/50' : ''} ${card.link ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => card.link && router.push(card.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {card.trend === 'up' && (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                )}
                <span className="text-xs text-muted-foreground">{card.subValue}</span>
              </div>
              {card.alert && (
                <Badge variant="destructive" className="mt-2">
                  {language === 'ko' ? '처리 필요' : '需要处理'}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 상세 정보 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 최근 분쟁 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {language === 'ko' ? '최근 분쟁' : '最近争议'}
            </CardTitle>
            <Link href="/admin/disputes">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체 보기' : '查看全部'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.disputes.recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ko'
                    ? '처리 대기 중인 분쟁이 없습니다.'
                    : '暂无待处理争议'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.disputes.recent.map((dispute) => (
                  <Link
                    key={dispute.id}
                    href={`/admin/disputes/${dispute.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{dispute.orderNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(dispute.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {dispute.reporter}: {dispute.reason}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 주문 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-purple-500" />
              {language === 'ko' ? '최근 주문' : '最近订单'}
            </CardTitle>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체 보기' : '查看全部'}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.buyer} → {order.seller}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-medium text-sm">
                      ₩{order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 링크 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">
                {language === 'ko' ? '회원 관리' : '用户管理'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/disputes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium">
                {language === 'ko' ? '분쟁 관리' : '争议管理'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/settlements">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium">
                {language === 'ko' ? '정산 관리' : '结算管理'}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/support">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="font-medium">
                {language === 'ko' ? '고객 지원' : '客服支持'}
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
