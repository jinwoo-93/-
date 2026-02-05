'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Search, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';

interface Dispute {
  id: string;
  reason: string;
  status: string;
  votesForBuyer: number;
  votesForSeller: number;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalPrice: number;
    buyer: { nickname: string };
    seller: { nickname: string };
  };
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchDisputes();
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/admin/disputes');
      const data = await response.json();
      if (data.success) {
        setDisputes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const statusLabels: Record<string, { ko: string; zh: string; icon: any; color: string }> = {
    OPEN: { ko: '접수', zh: '已受理', icon: Clock, color: 'text-yellow-500' },
    VOTING: { ko: '투표 중', zh: '投票中', icon: AlertTriangle, color: 'text-blue-500' },
    RESOLVED: { ko: '해결됨', zh: '已解决', icon: CheckCircle, color: 'text-green-500' },
    CLOSED: { ko: '종료', zh: '已关闭', icon: XCircle, color: 'text-gray-500' },
  };

  const filteredDisputes = statusFilter === 'all'
    ? disputes
    : disputes.filter((d) => d.status === statusFilter);

  const pendingCount = disputes.filter((d) => d.status === 'OPEN' || d.status === 'VOTING').length;

  return (
    <div className="container-app py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '분쟁 관리' : '争议管理'}
          </h1>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive">
            {pendingCount} {language === 'ko' ? '건 처리 대기' : '件待处理'}
          </Badge>
        )}
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              {language === 'ko' ? '전체' : '全部'} ({disputes.length})
            </Button>
            <Button
              variant={statusFilter === 'OPEN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('OPEN')}
            >
              {language === 'ko' ? '접수' : '已受理'}
            </Button>
            <Button
              variant={statusFilter === 'VOTING' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('VOTING')}
            >
              {language === 'ko' ? '투표 중' : '投票中'}
            </Button>
            <Button
              variant={statusFilter === 'RESOLVED' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('RESOLVED')}
            >
              {language === 'ko' ? '해결됨' : '已解决'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 분쟁 목록 */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'ko' ? '분쟁 내역이 없습니다' : '暂无争议'}
            </CardContent>
          </Card>
        ) : (
          filteredDisputes.map((dispute) => {
            const StatusIcon = statusLabels[dispute.status]?.icon || Clock;
            const statusColor = statusLabels[dispute.status]?.color || 'text-gray-500';
            const totalVotes = dispute.votesForBuyer + dispute.votesForSeller;

            return (
              <Card key={dispute.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                        <Badge
                          variant={dispute.status === 'VOTING' ? 'default' : 'secondary'}
                        >
                          {statusLabels[dispute.status]?.[language === 'ko' ? 'ko' : 'zh']}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {dispute.order.orderNumber}
                        </span>
                      </div>
                      <p className="font-medium mb-2">{dispute.reason}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                          {language === 'ko' ? '구매자' : '买家'}: {dispute.order.buyer.nickname}
                        </span>
                        <span>
                          {language === 'ko' ? '판매자' : '卖家'}: {dispute.order.seller.nickname}
                        </span>
                        <span>
                          {language === 'ko' ? '금액' : '金额'}: {format(dispute.order.totalPrice, dispute.order.totalPrice / 185)}
                        </span>
                      </div>

                      {dispute.status === 'VOTING' && (
                        <div className="mt-4">
                          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                            <div
                              className="bg-blue-500"
                              style={{ width: `${totalVotes > 0 ? (dispute.votesForBuyer / totalVotes) * 100 : 50}%` }}
                            />
                            <div
                              className="bg-red-500"
                              style={{ width: `${totalVotes > 0 ? (dispute.votesForSeller / totalVotes) * 100 : 50}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>{language === 'ko' ? '구매자' : '买家'} {dispute.votesForBuyer}</span>
                            <span>{language === 'ko' ? '판매자' : '卖家'} {dispute.votesForSeller}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(dispute.createdAt, language)}
                      </p>
                      <Link href={`/disputes/${dispute.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          {language === 'ko' ? '상세' : '详情'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
