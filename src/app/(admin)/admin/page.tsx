'use client';

import { useEffect, useState } from 'react';
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
  UserCheck,
  MessageSquare,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
    users: number;
  };
  week: {
    orders: number;
    revenue: number;
    users: number;
  };
  month: {
    orders: number;
    revenue: number;
    users: number;
  };
  total: {
    users: number;
    posts: number;
    orders: number;
  };
  pending: {
    verifications: number;
    disputes: number;
    support: number;
  };
  active: {
    posts: number;
    orders: number;
  };
  byCountry: {
    korea: number;
    china: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/stats');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-gray-500 mt-1">직구역구 관리자 패널</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 오늘의 통계 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          오늘의 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                오늘 주문
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.today.orders)}</div>
              <p className="text-xs text-gray-500 mt-1">
                이번 주: {formatNumber(stats.week.orders)}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                오늘 매출
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.today.revenue)}</div>
              <p className="text-xs text-gray-500 mt-1">
                이번 주: {formatCurrency(stats.week.revenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                신규 회원
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.today.users)}</div>
              <p className="text-xs text-gray-500 mt-1">
                이번 주: {formatNumber(stats.week.users)}명
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 전체 통계 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          전체 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                총 회원
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.total.users)}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  🇰🇷 {formatNumber(stats.byCountry.korea)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🇨🇳 {formatNumber(stats.byCountry.china)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                총 게시물
              </CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.total.posts)}</div>
              <p className="text-xs text-gray-500 mt-1">
                활성: {formatNumber(stats.active.posts)}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                총 주문
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.total.orders)}</div>
              <p className="text-xs text-gray-500 mt-1">
                진행중: {formatNumber(stats.active.orders)}건
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                이번 달 매출
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.month.revenue)}</div>
              <p className="text-xs text-gray-500 mt-1">
                주문: {formatNumber(stats.month.orders)}건
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 처리 필요 항목 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          처리 필요 항목
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  사업자 인증 대기
                </CardTitle>
                <UserCheck className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(stats.pending.verifications)}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">확인 필요</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/disputes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  분쟁 처리 대기
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(stats.pending.disputes)}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">신속 처리 필요</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/support">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  고객 문의 미답변
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatNumber(stats.pending.support)}
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">답변 대기중</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-purple-600" />
          빠른 액션
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/users">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">회원 관리</span>
            </Button>
          </Link>
          <Link href="/admin/posts">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Package className="h-5 w-5" />
              <span className="text-sm">상품 관리</span>
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">주문 관리</span>
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">시스템 설정</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 시스템 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            시스템 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">마지막 업데이트</p>
              <p className="font-medium">{new Date().toLocaleString('ko-KR')}</p>
            </div>
            <div>
              <p className="text-gray-500">서버 상태</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-600">정상</span>
              </div>
            </div>
            <div>
              <p className="text-gray-500">자동 새로고침</p>
              <p className="font-medium">30초</p>
            </div>
            <div>
              <p className="text-gray-500">플랫폼 버전</p>
              <p className="font-medium">v1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
