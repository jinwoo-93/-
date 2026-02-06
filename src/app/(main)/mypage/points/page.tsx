'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Coins,
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gift,
  ShoppingBag,
  Star,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/hooks/useLanguage';

interface PointHistory {
  id: string;
  type: 'EARN' | 'SPEND' | 'EXPIRE' | 'REFUND';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

interface PointStats {
  totalPoints: number;
  totalEarned: number;
  totalSpent: number;
  expiringPoints: number;
  expiringDate?: string;
}

export default function PointsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();

  const [stats, setStats] = useState<PointStats | null>(null);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPointsData();
    }
  }, [status]);

  const fetchPointsData = async () => {
    try {
      const res = await fetch('/api/points');
      const data = await res.json();

      if (data.success) {
        setStats({
          totalPoints: data.data.balance,
          totalEarned: data.data.totalEarned || 0,
          totalSpent: data.data.totalSpent || 0,
          expiringPoints: data.data.expiringPoints || 0,
          expiringDate: data.data.expiringDate,
        });
        setHistory(data.data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EARN':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SPEND':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'EXPIRE':
        return <Calendar className="h-4 w-4 text-gray-500" />;
      case 'REFUND':
        return <Gift className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EARN':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {language === 'ko' ? '적립' : '获得'}
          </Badge>
        );
      case 'SPEND':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            {language === 'ko' ? '사용' : '使用'}
          </Badge>
        );
      case 'EXPIRE':
        return (
          <Badge variant="outline">
            {language === 'ko' ? '소멸' : '过期'}
          </Badge>
        );
      case 'REFUND':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {language === 'ko' ? '환불' : '退还'}
          </Badge>
        );
      default:
        return null;
    }
  };

  const filteredHistory = activeTab === 'all'
    ? history
    : history.filter((h) => h.type === activeTab.toUpperCase());

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          {language === 'ko' ? '내 포인트' : '我的积分'}
        </h1>
      </div>

      {/* 포인트 현황 */}
      <Card className="mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'ko' ? '사용 가능 포인트' : '可用积分'}
            </p>
            <p className="text-4xl font-bold text-yellow-600">
              {stats?.totalPoints.toLocaleString() || 0}
              <span className="text-lg ml-1">P</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {language === 'ko' ? '총 적립' : '累计获得'}
              </p>
              <p className="font-semibold text-green-600">
                +{stats?.totalEarned.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {language === 'ko' ? '총 사용' : '累计使用'}
              </p>
              <p className="font-semibold text-red-600">
                -{stats?.totalSpent.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {language === 'ko' ? '소멸 예정' : '即将过期'}
              </p>
              <p className="font-semibold text-orange-600">
                {stats?.expiringPoints.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {(stats?.expiringPoints ?? 0) > 0 && stats?.expiringDate && (
            <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-center">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {language === 'ko'
                  ? `${new Date(stats.expiringDate).toLocaleDateString()}까지 ${stats.expiringPoints.toLocaleString()}P 소멸 예정`
                  : `${stats.expiringPoints.toLocaleString()}积分将于${new Date(stats.expiringDate).toLocaleDateString()}过期`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 포인트 안내 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            {language === 'ko' ? '포인트 적립 방법' : '积分获取方式'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ko' ? '구매 적립' : '购物积分'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ko' ? '결제금액의 1% 적립' : '支付金额的1%返还'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ko' ? '리뷰 작성' : '撰写评价'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ko' ? '사진 리뷰 500P, 텍스트 리뷰 100P' : '图片评价500P，文字评价100P'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Gift className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ko' ? '투표 참여' : '参与投票'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ko' ? '투표당 10P 적립' : '每次投票10P'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 포인트 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '포인트 내역' : '积分明细'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">
                {language === 'ko' ? '전체' : '全部'}
              </TabsTrigger>
              <TabsTrigger value="earn">
                {language === 'ko' ? '적립' : '获得'}
              </TabsTrigger>
              <TabsTrigger value="spend">
                {language === 'ko' ? '사용' : '使用'}
              </TabsTrigger>
              <TabsTrigger value="expire">
                {language === 'ko' ? '소멸' : '过期'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'ko' ? '포인트 내역이 없습니다' : '暂无积分记录'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          item.type === 'EARN' || item.type === 'REFUND'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {item.type === 'EARN' || item.type === 'REFUND' ? '+' : '-'}
                          {Math.abs(item.amount).toLocaleString()}P
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {language === 'ko' ? '잔액' : '余额'} {item.balance.toLocaleString()}P
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 바로가기 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/mypage/coupons">
          <Button variant="outline" className="w-full">
            {language === 'ko' ? '내 쿠폰함' : '我的优惠券'}
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full">
            {language === 'ko' ? '쇼핑하러 가기' : '去购物'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
