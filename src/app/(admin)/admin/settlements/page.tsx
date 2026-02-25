'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';

interface Settlement {
  id: string;
  userId: string;
  userNickname: string;
  userProfileImage: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  totalRevenue: number;
  platformFee: number;
  netAmount: number;
  orderCount: number;
  status: string;
  createdAt: string;
  settledAt: string | null;
}

interface SettlementStats {
  totalPending: number;
  totalSettled: number;
  pendingCount: number;
  todayRevenue: number;
  monthRevenue: number;
  totalOrders: number;
}

export default function AdminSettlementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [authLoading, isAuthenticated, isAdmin, period]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/settlements?period=${period}`);
      const data = await response.json();

      if (data.success) {
        setSettlements(data.data.settlements);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;
  if (!stats) return null;

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '정산 관리' : '结算管理'}
          </h1>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          {language === 'ko' ? '내보내기' : '导出'}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '정산 대기' : '待结算'}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {format(stats.totalPending, stats.totalPending / 185)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingCount} {language === 'ko' ? '건' : '笔'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '누적 정산' : '累计结算'}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {format(stats.totalSettled, stats.totalSettled / 185)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '오늘 수수료' : '今日手续费'}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {format(stats.todayRevenue, stats.todayRevenue / 185)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '이번 달 수수료' : '本月手续费'}
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {format(stats.monthRevenue, stats.monthRevenue / 185)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 기간 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={period === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('today')}
              >
                {language === 'ko' ? '오늘' : '今天'}
              </Button>
              <Button
                variant={period === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('week')}
              >
                {language === 'ko' ? '이번 주' : '本周'}
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('month')}
              >
                {language === 'ko' ? '이번 달' : '本月'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 정산 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '정산 내역' : '结算记录'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '판매자' : '卖家'}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '총 매출' : '总销售额'}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '수수료(5%)' : '手续费(5%)'}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '순 정산액' : '净结算额'}
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '주문 수' : '订单数'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '상태' : '状态'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{settlement.userNickname}</div>
                        {settlement.accountHolder && (
                          <div className="text-xs text-gray-500">
                            ({settlement.accountHolder})
                          </div>
                        )}
                      </div>
                      {settlement.bankName && settlement.accountNumber && (
                        <div className="text-xs text-gray-500 mt-1">
                          {settlement.bankName} {settlement.accountNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium">
                        {format(settlement.totalRevenue, settlement.totalRevenue / 185)}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium text-blue-600">
                        {format(settlement.platformFee, settlement.platformFee / 185)}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-green-600">
                        {format(settlement.netAmount, settlement.netAmount / 185)}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">
                        {settlement.orderCount}{language === 'ko' ? '건' : '笔'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          settlement.status === 'PENDING'
                            ? 'secondary'
                            : settlement.status === 'COMPLETED'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {settlement.status === 'PENDING'
                          ? (language === 'ko' ? '대기' : '待处理')
                          : settlement.status === 'COMPLETED'
                          ? (language === 'ko' ? '완료' : '已完成')
                          : (language === 'ko' ? '실패' : '失败')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
