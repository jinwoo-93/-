'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Calendar,
  Download,
  Plus,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface SellerSettlement {
  id: string;
  seller: {
    id: string;
    nickname: string;
    email: string;
    profileImage: string | null;
  };
  period: string;
  totalSales: number;
  platformFee: number;
  settlementAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface ShippingSettlement {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
  settlementYear: number;
  settlementMonthNum: number;
  totalShipments: number;
  totalRevenue: number;
  finalAmount: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function AdminSettlementsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('seller');
  const [sellerSettlements, setSellerSettlements] = useState<SellerSettlement[]>([]);
  const [shippingSettlements, setShippingSettlements] = useState<ShippingSettlement[]>([]);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [shippingStats, setShippingStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [authLoading, isAuthenticated, isAdmin, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sellerRes, shippingRes] = await Promise.all([
        fetch(`/api/admin/settlements?status=${statusFilter}`),
        fetch(`/api/admin/shipping-settlements?status=${statusFilter}`),
      ]);

      const [sellerData, shippingData] = await Promise.all([
        sellerRes.json(),
        shippingRes.json(),
      ]);

      if (sellerData.success) {
        setSellerSettlements(sellerData.data.settlements);
        setSellerStats(sellerData.data.stats);
      }

      if (shippingData.success) {
        setShippingSettlements(shippingData.data.settlements);
        setShippingStats(shippingData.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSettlement = async () => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const period = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const confirmed = confirm(
      language === 'ko'
        ? `${period} 정산을 생성하시겠습니까?`
        : `创建 ${period} 结算吗？`
    );

    if (!confirmed) return;

    setIsCreating(true);
    try {
      const endpoint = activeTab === 'seller'
        ? '/api/admin/settlements'
        : '/api/admin/shipping-settlements';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: data.message || (language === 'ko' ? '정산이 생성되었습니다' : '结算已创建'),
        });
        fetchData();
      } else {
        toast({
          title: data.error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const confirmed = confirm(
      language === 'ko'
        ? `정산 상태를 ${newStatus === 'PAID' ? '지급완료' : newStatus === 'APPROVED' ? '승인' : '거부'}로 변경하시겠습니까?`
        : `确定更改结算状态吗？`
    );

    if (!confirmed) return;

    try {
      const endpoint = activeTab === 'seller'
        ? `/api/admin/settlements/${id}`
        : `/api/admin/shipping-settlements/${id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: data.message,
        });
        fetchData();
      } else {
        toast({
          title: data.error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const statusMap: Record<string, { ko: string; zh: string; color: string }> = {
    PENDING: { ko: '대기', zh: '待处理', color: 'bg-yellow-100 text-yellow-800' },
    APPROVED: { ko: '승인', zh: '已批准', color: 'bg-blue-100 text-blue-800' },
    PAID: { ko: '지급완료', zh: '已支付', color: 'bg-green-100 text-green-800' },
    REJECTED: { ko: '거부', zh: '已拒绝', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '정산 관리' : '结算管理'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            {language === 'ko' ? 'Excel 내보내기' : '导出 Excel'}
          </Button>
          <Button
            size="sm"
            onClick={handleCreateSettlement}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ko' ? '정산 생성' : '创建结算'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="seller">
            <Users className="h-4 w-4 mr-2" />
            {language === 'ko' ? '판매자 정산' : '卖家结算'}
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="h-4 w-4 mr-2" />
            {language === 'ko' ? '배송사 정산' : '物流结算'}
          </TabsTrigger>
        </TabsList>

        {/* 판매자 정산 탭 */}
        <TabsContent value="seller" className="space-y-4">
          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '대기 중' : '待处理'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₩{(sellerStats?.totalPending || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '오늘 수수료' : '今日手续费'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₩{(sellerStats?.todayRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '이번 달 수수료' : '本月手续费'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₩{(sellerStats?.monthRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '대기 건수' : '待处理数'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sellerStats?.pendingCount || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 필터 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{language === 'ko' ? '전체' : '全部'}</option>
                  <option value="PENDING">{language === 'ko' ? '대기' : '待处理'}</option>
                  <option value="APPROVED">{language === 'ko' ? '승인' : '已批准'}</option>
                  <option value="PAID">{language === 'ko' ? '지급완료' : '已支付'}</option>
                  <option value="REJECTED">{language === 'ko' ? '거부' : '已拒绝'}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 정산 목록 */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        판매자
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        기간
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        총 판매액
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        플랫폼 수수료
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        정산 금액
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        상태
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellerSettlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{settlement.seller.nickname}</p>
                            <p className="text-xs text-gray-500">{settlement.seller.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{settlement.period}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">
                            ₩{settlement.totalSales.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-red-600">
                            ₩{settlement.platformFee.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-green-600">
                            ₩{settlement.settlementAmount.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={statusMap[settlement.status]?.color}>
                            {language === 'ko'
                              ? statusMap[settlement.status]?.ko
                              : statusMap[settlement.status]?.zh}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {settlement.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(settlement.id, 'APPROVED')}
                                >
                                  승인
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(settlement.id, 'REJECTED')}
                                  className="text-red-600"
                                >
                                  거부
                                </Button>
                              </>
                            )}
                            {settlement.status === 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(settlement.id, 'PAID')}
                                className="text-green-600"
                              >
                                지급완료
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sellerSettlements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === 'ko' ? '정산 내역이 없습니다' : '暂无结算记录'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 배송사 정산 탭 */}
        <TabsContent value="shipping" className="space-y-4">
          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '대기 중' : '待处理'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₩{(shippingStats?.totalPending || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '플랫폼 수수료' : '平台手续费'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₩{(shippingStats?.totalPlatformFee || 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    {language === 'ko' ? '대기 건수' : '待处理数'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shippingStats?.pendingCount || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 필터 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{language === 'ko' ? '전체' : '全部'}</option>
                  <option value="PENDING">{language === 'ko' ? '대기' : '待处理'}</option>
                  <option value="APPROVED">{language === 'ko' ? '승인' : '已批准'}</option>
                  <option value="PAID">{language === 'ko' ? '지급완료' : '已支付'}</option>
                  <option value="REJECTED">{language === 'ko' ? '거부' : '已拒绝'}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 정산 목록 */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        배송업체
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        기간
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        배송 건수
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        총 배송비
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        최종 정산액
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        상태
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingSettlements.map((settlement) => (
                      <tr key={settlement.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {settlement.company.logo && (
                              <img
                                src={settlement.company.logo}
                                alt={settlement.company.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <p className="font-medium">{settlement.company.name}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">
                            {settlement.settlementYear}-
                            {String(settlement.settlementMonthNum).padStart(2, '0')}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{settlement.totalShipments.toLocaleString()}건</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-medium">
                            ₩{settlement.totalRevenue.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-green-600">
                            ₩{settlement.finalAmount.toLocaleString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge className={statusMap[settlement.status]?.color}>
                            {language === 'ko'
                              ? statusMap[settlement.status]?.ko
                              : statusMap[settlement.status]?.zh}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {settlement.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(settlement.id, 'APPROVED')}
                                >
                                  승인
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusChange(settlement.id, 'REJECTED')}
                                  className="text-red-600"
                                >
                                  거부
                                </Button>
                              </>
                            )}
                            {settlement.status === 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(settlement.id, 'PAID')}
                                className="text-green-600"
                              >
                                지급완료
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {shippingSettlements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {language === 'ko' ? '정산 내역이 없습니다' : '暂无结算记录'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
