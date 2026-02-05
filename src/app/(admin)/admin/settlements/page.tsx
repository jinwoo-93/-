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
  amount: number;
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
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchData = async () => {
    // TODO: 실제 API 연동
    setStats({
      totalPending: 5000000,
      totalSettled: 150000000,
      pendingCount: 23,
      todayRevenue: 1500000,
      monthRevenue: 45000000,
    });
    setSettlements([
      {
        id: '1',
        userId: 'user1',
        userNickname: 'seller1',
        amount: 500000,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        settledAt: null,
      },
      {
        id: '2',
        userId: 'user2',
        userNickname: 'seller2',
        amount: 1200000,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
      },
    ]);
    setIsLoading(false);
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '금액' : '金额'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '상태' : '状态'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '신청일' : '申请日'}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    {language === 'ko' ? '작업' : '操作'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr key={settlement.id} className="border-b">
                    <td className="p-4">
                      <p className="font-medium">{settlement.userNickname}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold">
                        {format(settlement.amount, settlement.amount / 185)}
                      </p>
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
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(settlement.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {settlement.status === 'PENDING' && (
                        <Button size="sm" variant="outline">
                          {language === 'ko' ? '정산 처리' : '处理结算'}
                        </Button>
                      )}
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
