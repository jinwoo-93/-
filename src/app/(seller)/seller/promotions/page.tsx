'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  Loader2,
  Calendar,
  Percent,
  Package,
  Clock,
  TrendingUp,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Gift,
  Zap,
  Truck,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface Promotion {
  id: string;
  type: 'DISCOUNT' | 'BUNDLE' | 'TIME_SALE' | 'FREE_SHIPPING' | 'COUPON';
  title: string;
  titleZh?: string;
  description?: string;
  descriptionZh?: string;
  discountRate?: number;
  discountAmount?: number;
  minPurchase?: number;
  bundlePostIds?: string[];
  bundlePrice?: number;
  targetPostIds?: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  viewCount: number;
  clickCount: number;
  orderCount: number;
  revenue: number;
  createdAt: string;
}

export default function PromotionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPromotions();
    }
  }, [status]);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/promotions');
      const data = await res.json();

      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: currentStatus ? '프로모션이 비활성화되었습니다' : '프로모션이 활성화되었습니다',
        });
        fetchPromotions();
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '프로모션이 삭제되었습니다',
        });
        fetchPromotions();
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: Promotion['type']) => {
    switch (type) {
      case 'DISCOUNT':
        return <Percent className="h-4 w-4" />;
      case 'BUNDLE':
        return <Gift className="h-4 w-4" />;
      case 'TIME_SALE':
        return <Zap className="h-4 w-4" />;
      case 'FREE_SHIPPING':
        return <Truck className="h-4 w-4" />;
      case 'COUPON':
        return <Ticket className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: Promotion['type']) => {
    const labels = {
      DISCOUNT: '할인',
      BUNDLE: '묶음판매',
      TIME_SALE: '타임세일',
      FREE_SHIPPING: '무료배송',
      COUPON: '쿠폰',
    };
    return labels[type];
  };

  const getTypeColor = (type: Promotion['type']) => {
    const colors = {
      DISCOUNT: 'bg-blue-100 text-blue-700 border-blue-200',
      BUNDLE: 'bg-purple-100 text-purple-700 border-purple-200',
      TIME_SALE: 'bg-red-100 text-red-700 border-red-200',
      FREE_SHIPPING: 'bg-green-100 text-green-700 border-green-200',
      COUPON: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[type];
  };

  const getStatusBadge = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (!promotion.isActive) {
      return (
        <Badge variant="outline" className="text-gray-500">
          비활성
        </Badge>
      );
    }

    if (now < start) {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          예정
        </Badge>
      );
    }

    if (now > end) {
      return (
        <Badge variant="outline" className="text-gray-500">
          종료
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        진행중
      </Badge>
    );
  };

  const filterPromotions = (promos: Promotion[]) => {
    const now = new Date();

    switch (activeTab) {
      case 'active':
        return promos.filter(
          (p) => p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now
        );
      case 'scheduled':
        return promos.filter((p) => p.isActive && new Date(p.startDate) > now);
      case 'ended':
        return promos.filter((p) => !p.isActive || new Date(p.endDate) < now);
      default:
        return promos;
    }
  };

  const filteredPromotions = filterPromotions(promotions);

  // 통계 계산
  const activePromotions = promotions.filter(
    (p) =>
      p.isActive &&
      new Date(p.startDate) <= new Date() &&
      new Date(p.endDate) >= new Date()
  );
  const totalViews = promotions.reduce((sum, p) => sum + p.viewCount, 0);
  const totalClicks = promotions.reduce((sum, p) => sum + p.clickCount, 0);
  const totalOrders = promotions.reduce((sum, p) => sum + p.orderCount, 0);
  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">프로모션 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            판매 촉진을 위한 다양한 프로모션을 생성하고 관리하세요
          </p>
        </div>
        <Link href="/seller/promotions/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            프로모션 생성
          </Button>
        </Link>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">진행중</p>
                <p className="text-2xl font-bold text-primary">{activePromotions.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">조회수</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">클릭수</p>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MousePointer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">주문수</p>
                <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">매출</p>
                <p className="text-2xl font-bold">
                  ₩{(totalRevenue / 10000).toFixed(0)}
                  <span className="text-sm ml-1">만</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 프로모션 목록 */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                전체 ({promotions.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                진행중 ({activePromotions.length})
              </TabsTrigger>
              <TabsTrigger value="scheduled">
                예정 (
                {
                  promotions.filter(
                    (p) => p.isActive && new Date(p.startDate) > new Date()
                  ).length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="ended">
                종료 (
                {
                  promotions.filter(
                    (p) => !p.isActive || new Date(p.endDate) < new Date()
                  ).length
                }
                )
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              {filteredPromotions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>프로모션이 없습니다</p>
                  <Link href="/seller/promotions/create">
                    <Button className="mt-4">프로모션 생성하기</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPromotions.map((promotion) => (
                    <PromotionCard
                      key={promotion.id}
                      promotion={promotion}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      getTypeIcon={getTypeIcon}
                      getTypeLabel={getTypeLabel}
                      getTypeColor={getTypeColor}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface PromotionCardProps {
  promotion: Promotion;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  getTypeIcon: (type: Promotion['type']) => JSX.Element;
  getTypeLabel: (type: Promotion['type']) => string;
  getTypeColor: (type: Promotion['type']) => string;
  getStatusBadge: (promotion: Promotion) => JSX.Element;
}

function PromotionCard({
  promotion,
  onToggleActive,
  onDelete,
  getTypeIcon,
  getTypeLabel,
  getTypeColor,
  getStatusBadge,
}: PromotionCardProps) {
  const router = useRouter();

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* 왼쪽: 프로모션 정보 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getTypeColor(promotion.type)}>
              {getTypeIcon(promotion.type)}
              <span className="ml-1">{getTypeLabel(promotion.type)}</span>
            </Badge>
            {getStatusBadge(promotion)}
          </div>

          <h3 className="font-semibold text-lg mb-1">{promotion.title}</h3>
          {promotion.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {promotion.description}
            </p>
          )}

          {/* 할인 정보 */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
            {promotion.discountRate && (
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Percent className="h-4 w-4" />
                {promotion.discountRate}% 할인
              </div>
            )}
            {promotion.discountAmount && (
              <div className="flex items-center gap-1 text-primary font-semibold">
                <DollarSign className="h-4 w-4" />
                ₩{promotion.discountAmount.toLocaleString()} 할인
              </div>
            )}
            {promotion.minPurchase && (
              <div className="text-muted-foreground">
                최소 구매: ₩{promotion.minPurchase.toLocaleString()}
              </div>
            )}
          </div>

          {/* 기간 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar className="h-4 w-4" />
            {formatDate(promotion.startDate, 'ko')} ~ {formatDate(promotion.endDate, 'ko')}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>{promotion.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <span>{promotion.clickCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span>{promotion.orderCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-primary font-semibold">
              <DollarSign className="h-4 w-4" />
              ₩{(promotion.revenue / 10000).toFixed(1)}만
            </div>
          </div>
        </div>

        {/* 오른쪽: 액션 버튼 */}
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push(`/seller/promotions/${promotion.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            수정
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleActive(promotion.id, promotion.isActive)}
          >
            {promotion.isActive ? (
              <>
                <ToggleRight className="h-4 w-4 mr-1" />
                활성
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-1" />
                비활성
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(promotion.id)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
