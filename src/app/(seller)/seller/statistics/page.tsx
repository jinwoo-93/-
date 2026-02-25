'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Eye,
  Package,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';

interface Statistics {
  period: '7days' | '30days' | '90days';
  totalSales: number;
  totalRevenueKRW: number;
  totalRevenueCNY: number;
  totalOrders: number;
  avgOrderValue: number;
  totalViews: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    title: string;
    titleZh: string | null;
    images: string[];
    salesCount: number;
    revenue: number;
    viewCount: number;
  }>;
  dailyStats: Array<{
    date: string;
    sales: number;
    revenue: number;
    orders: number;
  }>;
}

export default function SellerStatisticsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'7days' | '30days' | '90days'>('30days');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      fetchStatistics();
    }
  }, [authLoading, isAuthenticated, period]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/seller/statistics?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;
  if (!stats) return null;

  const periodLabels = {
    '7days': language === 'ko' ? '최근 7일' : '最近7天',
    '30days': language === 'ko' ? '최근 30일' : '最近30天',
    '90days': language === 'ko' ? '최근 90일' : '最近90天',
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'ko' ? '판매 통계' : '销售统计'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {language === 'ko'
              ? '기간별 판매 성과를 분석합니다'
              : '分析不同时期的销售业绩'}
          </p>
        </div>

        {/* 기간 선택 */}
        <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
          {(['7days', '30days', '90days'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                period === p
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 총 매출액 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'ko' ? '총 매출액' : '总销售额'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(stats.totalRevenueKRW, stats.totalRevenueCNY)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 총 주문 수 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'ko' ? '총 주문 수' : '总订单数'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 평균 주문 금액 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'ko' ? '평균 주문 금액' : '平均订单金额'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₩{Math.round(stats.avgOrderValue).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 전환율 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {language === 'ko' ? '전환율' : '转化率'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ko' ? '조회 대비 구매' : '浏览转购买'}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 일별 매출 추이 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {language === 'ko' ? '일별 매출 추이' : '每日销售趋势'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.dailyStats.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              {language === 'ko' ? '데이터가 없습니다' : '暂无数据'}
            </p>
          ) : (
            <div className="space-y-2">
              {stats.dailyStats.slice(0, 10).map((day, index) => {
                const maxRevenue = Math.max(...stats.dailyStats.map(d => d.revenue));
                const widthPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600">
                      {new Date(day.date).toLocaleDateString(language === 'ko' ? 'ko-KR' : 'zh-CN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-sm font-medium text-gray-900">
                          ₩{day.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-20 text-sm text-gray-600 text-right">
                      {day.orders}
                      {language === 'ko' ? '건' : '笔'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 베스트 상품 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {language === 'ko' ? '베스트 상품 (Top 5)' : '热销商品 (Top 5)'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topProducts.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              {language === 'ko' ? '판매된 상품이 없습니다' : '暂无销售商品'}
            </p>
          ) : (
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/posts/${product.id}`}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {language === 'ko' ? product.title : product.titleZh || product.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        {product.salesCount}{language === 'ko' ? '판매' : '销量'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {product.viewCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {language === 'ko' ? '매출' : '销售额'}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      ₩{product.revenue.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 분석 링크 */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {language === 'ko' ? '더 자세한 분석이 필요하신가요?' : '需要更详细的分析吗？'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ko'
                  ? '카테고리별, 시간대별 상세 분석 리포트를 준비 중입니다'
                  : '按类别、时段的详细分析报告准备中'}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
