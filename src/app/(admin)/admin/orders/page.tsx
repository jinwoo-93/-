'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  X,
  Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

interface Order {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    nickname: string | null;
    email: string | null;
    profileImage: string | null;
  };
  seller: {
    id: string;
    nickname: string | null;
    email: string | null;
    profileImage: string | null;
  };
  post: {
    id: string;
    title: string;
    titleZh: string | null;
    images: string[];
  };
  quantity: number;
  totalKRW: number;
  status: string;
  shippingCompany: {
    id: string;
    name: string;
    nameZh: string | null;
  } | null;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface Stats {
  total: number;
  today: number;
  totalRevenue: number;
  platformFee: number;
}

const statusMap: Record<string, { ko: string; zh: string; color: string }> = {
  PENDING_PAYMENT: { ko: '결제대기', zh: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { ko: '결제완료', zh: '已付款', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { ko: '배송중', zh: '运输中', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { ko: '배송완료', zh: '已送达', color: 'bg-green-100 text-green-800' },
  CONFIRMED: { ko: '구매확정', zh: '确认收货', color: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { ko: '취소', zh: '已取消', color: 'bg-gray-100 text-gray-800' },
  REFUNDED: { ko: '환불', zh: '已退款', color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, totalRevenue: 0, platformFee: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchOrders();
      fetchStats();
    }
  }, [authLoading, isAuthenticated, isAdmin, selectedStatus, searchQuery, page]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();

      if (data.success) {
        setStats({
          total: data.data.overview.totalOrders,
          today: data.data.overview.ordersToday,
          totalRevenue: data.data.revenue.lastMonthRevenue,
          platformFee: Math.round(data.data.revenue.lastMonthRevenue * 0.04), // 평균 4% 수수료
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);

      const res = await fetch(`/api/admin/orders/export?${params}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export orders:', error);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{language === 'ko' ? '주문 관리' : '订单管理'}</h1>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {language === 'ko' ? 'CSV 내보내기' : '导出CSV'}
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ko' ? '전체 주문' : '总订单'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ko' ? '오늘 주문' : '今日订单'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ko' ? '총 거래액' : '总交易额'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ko' ? '플랫폼 수수료' : '平台佣金'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩{stats.platformFee.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={language === 'ko' ? '주문번호, 구매자, 판매자 검색...' : '搜索订单号、买家、卖家...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedStatus === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedStatus('');
                  setPage(1);
                }}
              >
                {language === 'ko' ? '전체' : '全部'}
              </Button>
              {Object.entries(statusMap).map(([status, { ko, zh }]) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedStatus(status);
                    setPage(1);
                  }}
                >
                  {language === 'ko' ? ko : zh}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주문 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '주문정보' : '订单信息'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '구매자' : '买家'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '판매자' : '卖家'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '금액' : '金额'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '상태' : '状态'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ko' ? '주문일시' : '订单时间'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {language === 'ko' ? '주문이 없습니다' : '暂无订单'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={order.post.images[0] || '/placeholder.png'}
                              alt={order.post.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {language === 'ko' ? order.post.title : (order.post.titleZh || order.post.title)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {language === 'ko' ? '수량' : '数量'}: {order.quantity}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.buyer.nickname || order.buyer.email}
                        </p>
                        {order.buyer.email && (
                          <p className="text-xs text-gray-500">{order.buyer.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {order.seller.nickname || order.seller.email}
                        </p>
                        {order.seller.email && (
                          <p className="text-xs text-gray-500">{order.seller.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          ₩{order.totalKRW.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={statusMap[order.status]?.color}>
                          {language === 'ko'
                            ? statusMap[order.status]?.ko
                            : statusMap[order.status]?.zh}
                        </Badge>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {order.trackingNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'zh-CN')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString(language === 'ko' ? 'ko-KR' : 'zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {language === 'ko'
                  ? `총 ${pagination.total}개 중 ${(page - 1) * 20 + 1}-${Math.min(page * 20, pagination.total)}개 표시`
                  : `显示 ${(page - 1) * 20 + 1}-${Math.min(page * 20, pagination.total)} 共 ${pagination.total} 个`}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {language === 'ko' ? '이전' : '上一页'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  {language === 'ko' ? '다음' : '下一页'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
