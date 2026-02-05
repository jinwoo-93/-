'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, Clock, Trophy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { formatDate } from '@/lib/utils';

interface AdSlot {
  id: string;
  name: string;
  slotType: string;
  weekStart: string;
  weekEnd: string;
  currentHighestBid: number | null;
  minimumBid: number;
  bids: {
    id: string;
    bidAmount: number;
    user: {
      id: string;
      nickname: string;
    };
  }[];
}

export default function AdsPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { format } = useCurrency();

  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchSlots();
  }, [isAuthenticated, authLoading]);

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/ads/slots');
      const data = await response.json();
      if (data.success) {
        setSlots(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ad slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 다음 월요일 10시까지 남은 시간 계산
  const getTimeRemaining = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(10, 0, 0, 0);

    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const timeRemaining = getTimeRemaining();

  if (authLoading || isLoading) return <LoadingPage />;

  const slotTypeLabels: Record<string, { ko: string; zh: string }> = {
    PRODUCT: { ko: '상품 광고', zh: '商品广告' },
    SHIPPING: { ko: '배송사 광고', zh: '物流广告' },
    MAIN_BANNER: { ko: '메인 배너', zh: '主横幅' },
    CATEGORY_TOP: { ko: '카테고리 상단', zh: '分类顶部' },
    SEARCH_TOP: { ko: '검색 상단', zh: '搜索顶部' },
    SIDEBAR: { ko: '사이드바', zh: '侧边栏' },
  };

  return (
    <div className="container-app py-6 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">{t('ad.title')}</h1>
        </div>
        <Link href="/ads/my-bids">
          <Button variant="outline" size="sm">
            {language === 'ko' ? '내 입찰 내역' : '我的竞拍'}
          </Button>
        </Link>
      </div>

      {/* 입찰 마감 카운트다운 */}
      <Card className="mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {language === 'ko' ? '다음 입찰 마감까지' : '距离下次截止'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '매주 월요일 오전 10시 마감' : '每周一上午10点截止'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-center">
              <div className="bg-background rounded-lg px-3 py-2">
                <p className="text-2xl font-bold text-primary">{timeRemaining.days}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '일' : '天'}</p>
              </div>
              <div className="bg-background rounded-lg px-3 py-2">
                <p className="text-2xl font-bold text-primary">{timeRemaining.hours}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '시' : '时'}</p>
              </div>
              <div className="bg-background rounded-lg px-3 py-2">
                <p className="text-2xl font-bold text-primary">{timeRemaining.minutes}</p>
                <p className="text-xs text-muted-foreground">{language === 'ko' ? '분' : '分'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 광고 슬롯 목록 */}
      <div className="space-y-4">
        <h2 className="font-bold">{language === 'ko' ? '광고 슬롯' : '广告位'}</h2>

        {slots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'ko' ? '현재 입찰 가능한 광고 슬롯이 없습니다.' : '暂无可竞拍的广告位'}
            </CardContent>
          </Card>
        ) : (
          slots.map((slot) => (
            <Card key={slot.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{slot.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {slotTypeLabels[slot.slotType]?.[language === 'ko' ? 'ko' : 'zh'] || slot.slotType}
                    </Badge>
                  </div>
                  <Link href={`/ads/bid/${slot.id}`}>
                    <Button size="sm">{t('ad.placeBid')}</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '기간' : '期间'}
                    </p>
                    <p className="font-medium">
                      {formatDate(slot.weekStart, language)} ~ {formatDate(slot.weekEnd, language)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '최소 입찰가' : '最低出价'}
                    </p>
                    <p className="font-medium">{format(slot.minimumBid, slot.minimumBid / 185)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '현재 최고가' : '当前最高价'}
                    </p>
                    <div className="flex items-center gap-1">
                      {slot.currentHighestBid ? (
                        <>
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <p className="font-bold text-primary">
                            {format(slot.currentHighestBid, slot.currentHighestBid / 185)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      )}
                    </div>
                  </div>
                </div>

                {slot.bids.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      {language === 'ko' ? '입찰 현황' : '竞拍情况'} ({slot.bids.length})
                    </p>
                    <div className="space-y-2">
                      {slot.bids.slice(0, 3).map((bid, index) => (
                        <div key={bid.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                            {index === 1 && <TrendingUp className="h-4 w-4 text-gray-400" />}
                            {index === 2 && <TrendingUp className="h-4 w-4 text-orange-400" />}
                            <span>{bid.user.nickname}</span>
                          </div>
                          <span className={index === 0 ? 'font-bold text-primary' : ''}>
                            {format(bid.bidAmount, bid.bidAmount / 185)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 광고 안내 */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-3">{language === 'ko' ? '광고 입찰 안내' : '广告竞拍说明'}</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              • {language === 'ko'
                ? '매주 월요일 오전 10시에 입찰이 마감됩니다.'
                : '每周一上午10点截止竞拍。'}
            </li>
            <li>
              • {language === 'ko'
                ? '가장 높은 금액을 입찰한 사용자가 해당 주의 광고 슬롯을 사용합니다.'
                : '出价最高者获得该周的广告位使用权。'}
            </li>
            <li>
              • {language === 'ko'
                ? '입찰 금액은 최소 입찰가 이상이어야 합니다.'
                : '出价金额必须高于最低出价。'}
            </li>
            <li>
              • {language === 'ko'
                ? '낙찰 시 결제가 진행되며, 미낙찰 시 환불됩니다.'
                : '中标后进行支付，未中标则退款。'}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
