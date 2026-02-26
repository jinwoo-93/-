'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  ShoppingCart,
  Package,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Shield,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface AdminStats {
  users: {
    total: number;
    buyers: number;
    sellers: number;
    today: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  disputes: {
    total: number;
    active: number;
    resolved: number;
  };
  products: {
    total: number;
    active: number;
    pending: number;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const lang = language === 'zh' ? 'zh' : 'ko';

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
      return;
    }

    if (session?.user?.userType !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || session.user?.userType !== 'ADMIN') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            {lang === 'ko' ? '관리자 대시보드' : '管理员仪表板'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {lang === 'ko' ? '직구역구 플랫폼 관리' : '直购逆购平台管理'}
          </p>
        </div>
        <Button onClick={() => router.push('/')}>
          {lang === 'ko' ? '홈으로' : '返回首页'}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 사용자 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === 'ko' ? '전체 사용자' : '总用户数'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'ko' ? '오늘' : '今日'} +{stats?.users.today || 0}
            </p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-blue-600">
                {lang === 'ko' ? '구매자' : '买家'}: {stats?.users.buyers || 0}
              </span>
              <span className="text-green-600">
                {lang === 'ko' ? '판매자' : '卖家'}: {stats?.users.sellers || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 주문 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === 'ko' ? '전체 주문' : '总订单数'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'ko' ? '처리중' : '处理中'}: {stats?.orders.pending || 0}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                {lang === 'ko' ? '완료' : '已完成'}: {stats?.orders.completed || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 매출 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === 'ko' ? '총 매출' : '总销售额'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{(stats?.orders.revenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'ko' ? '완료된 주문 기준' : '基于已完成订单'}
            </p>
          </CardContent>
        </Card>

        {/* 분쟁 통계 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === 'ko' ? '분쟁 관리' : '争议管理'}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.disputes.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'ko' ? '처리 필요' : '待处理'}
            </p>
            <div className="text-xs mt-2 text-green-600">
              {lang === 'ko' ? '해결' : '已解决'}: {stats?.disputes.resolved || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {lang === 'ko' ? '사용자 관리' : '用户管理'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '회원 정보, 권한, 인증 상태 관리'
                : '管理会员信息、权限、认证状态'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/users')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {lang === 'ko' ? '상품 관리' : '商品管理'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '등록 상품 검토, 승인, 삭제'
                : '审核注册商品、批准、删除'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/products')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {lang === 'ko' ? '주문 관리' : '订单管理'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '주문 내역, 배송 상태 확인'
                : '查看订单历史、配送状态'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/orders')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {lang === 'ko' ? '분쟁 중재' : '争议仲裁'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '분쟁 검토, 판정, 환불 처리'
                : '审核争议、裁决、退款处理'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/disputes')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {lang === 'ko' ? '문의 관리' : '咨询管理'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '고객 문의 답변, 지원 티켓'
                : '回复客户咨询、支持工单'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/support')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {lang === 'ko' ? '시스템 설정' : '系统设置'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === 'ko'
                ? '플랫폼 설정, 정책, 수수료'
                : '平台设置、政策、手续费'}
            </p>
            <Button className="w-full" onClick={() => router.push('/admin/settings')}>
              {lang === 'ko' ? '관리하기' : '管理'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
