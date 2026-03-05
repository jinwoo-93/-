'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Star,
  ShoppingCart,
  Package,
  MessageSquare,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Ban,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function UserDetailModal({
  userId,
  isOpen,
  onClose,
  onUpdate,
}: UserDetailModalProps) {
  const { language } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetail();
    }
  }, [userId, isOpen]);

  const fetchUserDetail = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (action: string) => {
    if (!userId) return;

    const confirmMessage =
      action === 'verify'
        ? '사업자 인증을 승인하시겠습니까?'
        : action === 'badge'
        ? '우수 판매자 배지를 부여하시겠습니까?'
        : '작업을 진행하시겠습니까?';

    if (!confirm(confirmMessage)) return;

    try {
      const updateData: any = {};

      if (action === 'verify') {
        updateData.isBusinessVerified = !userData.user.isBusinessVerified;
      } else if (action === 'badge') {
        updateData.hasExcellentBadge = !userData.user.hasExcellentBadge;
      }

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (data.success) {
        alert('업데이트되었습니다.');
        fetchUserDetail();
        onUpdate?.();
      } else {
        alert('업데이트 실패: ' + data.error.message);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>회원 상세 정보</DialogTitle>
          <DialogDescription>
            회원의 상세 정보 및 활동 내역을 확인하고 관리할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* 회원 기본 정보 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userData.user.profileImage || ''} />
                    <AvatarFallback className="text-2xl">
                      {userData.user.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{userData.user.nickname}</h3>
                      {userData.user.hasExcellentBadge && (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      )}
                      {userData.user.userType === 'ADMIN' && (
                        <Badge variant="destructive">관리자</Badge>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{userData.user.email}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {userData.user.country === 'KR' ? '🇰🇷 한국' : '🇨🇳 중국'}
                      </Badge>
                      {userData.user.isPhoneVerified && (
                        <Badge variant="secondary">휴대폰 인증</Badge>
                      )}
                      {userData.user.isBusinessVerified && (
                        <Badge variant="default">사업자 인증</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('verify')}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      {userData.user.isBusinessVerified ? '인증 취소' : '사업자 인증'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('badge')}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {userData.user.hasExcellentBadge ? '배지 회수' : '우수 배지'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    구매 거래
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userData.statistics.totalPurchases}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(userData.statistics.totalPurchaseAmountKRW)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    판매 거래
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userData.statistics.totalSales}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(userData.statistics.totalSalesAmountKRW)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    등록 게시물
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userData.statistics.totalPosts}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">총 게시물</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    평점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    {userData.user.averageRating.toFixed(1)}
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">평균 평점</p>
                </CardContent>
              </Card>
            </div>

            {/* 탭 콘텐츠 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">기본 정보</TabsTrigger>
                <TabsTrigger value="purchases">구매 내역</TabsTrigger>
                <TabsTrigger value="sales">판매 내역</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">계정 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">가입일</span>
                      <span className="font-medium">
                        {formatDate(userData.user.createdAt, language)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 로그인</span>
                      <span className="font-medium">
                        {userData.user.lastLoginAt
                          ? formatDate(userData.user.lastLoginAt, language)
                          : '정보 없음'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">최근 게시물</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.recentActivities.posts.length > 0 ? (
                      <div className="space-y-2">
                        {userData.recentActivities.posts.map((post: any) => (
                          <div
                            key={post.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                          >
                            {post.images[0] && (
                              <div className="relative w-12 h-12">
                                <Image
                                  src={post.images[0]}
                                  alt={post.title}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{post.title}</p>
                              <p className="text-xs text-gray-500">
                                {formatCurrency(post.priceKRW)}
                              </p>
                            </div>
                            <Badge variant="outline">{post.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        게시물이 없습니다
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">최근 구매 내역</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.recentActivities.buyerOrders.length > 0 ? (
                      <div className="space-y-2">
                        {userData.recentActivities.buyerOrders.map((order: any) => (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                          >
                            {order.post.images[0] && (
                              <div className="relative w-12 h-12">
                                <Image
                                  src={order.post.images[0]}
                                  alt={order.post.title}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{order.post.title}</p>
                              <p className="text-xs text-gray-500">
                                판매자: {order.seller.nickname}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {formatCurrency(order.totalKRW)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        구매 내역이 없습니다
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">최근 판매 내역</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userData.recentActivities.sellerOrders.length > 0 ? (
                      <div className="space-y-2">
                        {userData.recentActivities.sellerOrders.map((order: any) => (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                          >
                            {order.post.images[0] && (
                              <div className="relative w-12 h-12">
                                <Image
                                  src={order.post.images[0]}
                                  alt={order.post.title}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{order.post.title}</p>
                              <p className="text-xs text-gray-500">
                                구매자: {order.buyer.nickname}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">
                                {formatCurrency(order.totalKRW)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        판매 내역이 없습니다
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">사용자 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
