'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, ArrowLeft, Trophy, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';

interface MyBid {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  slot: {
    id: string;
    name: string;
    type: string;
    weekStart: string;
    weekEnd: string;
    currentHighestBid: number | null;
  };
}

export default function MyBidsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [bids, setBids] = useState<MyBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchMyBids();
  }, [isAuthenticated, authLoading]);

  const fetchMyBids = async () => {
    try {
      const response = await fetch('/api/ads/bids/my');
      const data = await response.json();
      if (data.success) {
        setBids(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch my bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const statusLabels: Record<string, { ko: string; zh: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { ko: '입찰 중', zh: '竞拍中', variant: 'default' },
    WON: { ko: '낙찰', zh: '中标', variant: 'default' },
    LOST: { ko: '미낙찰', zh: '未中标', variant: 'secondary' },
    CANCELLED: { ko: '취소됨', zh: '已取消', variant: 'destructive' },
  };

  const slotTypeLabels: Record<string, { ko: string; zh: string }> = {
    PRODUCT: { ko: '상품 광고', zh: '商品广告' },
    SHIPPING: { ko: '배송사 광고', zh: '物流广告' },
    MAIN_BANNER: { ko: '메인 배너', zh: '主横幅' },
    CATEGORY_TOP: { ko: '카테고리 상단', zh: '分类顶部' },
    SEARCH_TOP: { ko: '검색 상단', zh: '搜索顶部' },
    SIDEBAR: { ko: '사이드바', zh: '侧边栏' },
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'WON':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'LOST':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="container-app py-6 max-w-3xl">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ko' ? '뒤로가기' : '返回'}
      </button>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">
            {language === 'ko' ? '내 입찰 내역' : '我的竞拍记录'}
          </h1>
        </div>
        <Link href="/ads">
          <Button size="sm">{language === 'ko' ? '새 입찰' : '新竞拍'}</Button>
        </Link>
      </div>

      {/* 입찰 목록 */}
      {bids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {language === 'ko' ? '아직 입찰 내역이 없습니다' : '暂无竞拍记录'}
            </p>
            <Link href="/ads">
              <Button>{language === 'ko' ? '광고 입찰하기' : '开始竞拍'}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => {
            const isLeading = bid.slot.currentHighestBid === bid.amount && bid.status === 'PENDING';

            return (
              <Card key={bid.id} className={isLeading ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(bid.status)}
                      <CardTitle className="text-base">{bid.slot.name}</CardTitle>
                    </div>
                    <Badge variant={statusLabels[bid.status]?.variant || 'secondary'}>
                      {isLeading
                        ? (language === 'ko' ? '1위' : '第一名')
                        : statusLabels[bid.status]?.[language === 'ko' ? 'ko' : 'zh'] || bid.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? '슬롯 유형' : '广告位类型'}
                      </p>
                      <p className="font-medium">
                        {slotTypeLabels[bid.slot.type]?.[language === 'ko' ? 'ko' : 'zh'] || bid.slot.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? '광고 기간' : '广告期间'}
                      </p>
                      <p className="font-medium">
                        {formatDate(bid.slot.weekStart, language).split(' ')[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? '내 입찰가' : '我的出价'}
                      </p>
                      <p className="font-bold text-primary">
                        {format(bid.amount, bid.amount / 185)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {language === 'ko' ? '현재 최고가' : '当前最高价'}
                      </p>
                      <p className={`font-medium ${
                        bid.slot.currentHighestBid === bid.amount
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {bid.slot.currentHighestBid
                          ? format(bid.slot.currentHighestBid, bid.slot.currentHighestBid / 185)
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {bid.status === 'PENDING' && bid.slot.currentHighestBid && bid.slot.currentHighestBid > bid.amount && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <p className="text-sm text-red-600">
                        {language === 'ko'
                          ? '현재 더 높은 입찰이 있습니다'
                          : '当前有更高出价'}
                      </p>
                      <Link href={`/ads/bid/${bid.slot.id}`}>
                        <Button size="sm" variant="outline">
                          {language === 'ko' ? '다시 입찰' : '重新竞拍'}
                        </Button>
                      </Link>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    {language === 'ko' ? '입찰일' : '竞拍时间'}: {formatDate(bid.createdAt, language)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
