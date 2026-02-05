'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Clock,
  MessageSquare,
  ExternalLink,
  Loader2,
  Calendar,
  DollarSign,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';
import { formatRelativeTime } from '@/lib/utils';

interface PurchaseRequest {
  id: string;
  requesterId: string;
  productName: string;
  productNameZh?: string;
  productUrl?: string;
  productImage?: string;
  estimatedPrice?: number;
  quantity: number;
  description?: string;
  maxBudget?: number;
  deadline?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  offerCount: number;
  createdAt: string;
  requester: {
    id: string;
    nickname: string;
    profileImage?: string;
  };
}

interface PurchaseRequestListProps {
  status?: string;
  myRequests?: boolean;
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function PurchaseRequestList({
  status,
  myRequests = false,
  limit = 10,
  showTitle = true,
  className,
}: PurchaseRequestListProps) {
  const { language } = useLanguage();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [status, myRequests]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (status) params.append('status', status);
      if (myRequests) params.append('my', 'true');

      const res = await fetch(`/api/purchase-requests?${params}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch purchase requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (reqStatus: string) => {
    switch (reqStatus) {
      case 'OPEN':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            {language === 'ko' ? '모집 중' : '招募中'}
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            {language === 'ko' ? '진행 중' : '进行中'}
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            {language === 'ko' ? '완료' : '已完成'}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            {language === 'ko' ? '취소' : '已取消'}
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline">
            {language === 'ko' ? '마감' : '已截止'}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center py-12 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {language === 'ko' ? '구매대행 요청이 없습니다' : '暂无代购请求'}
          </p>
          <Link href="/purchase-requests/create">
            <Button className="mt-4">
              {language === 'ko' ? '구매대행 요청하기' : '发布代购请求'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {language === 'ko' ? '구매대행 요청' : '代购请求'}
          </h2>
          <Link href="/purchase-requests">
            <Button variant="ghost" size="sm">
              {language === 'ko' ? '전체보기' : '查看全部'}
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {requests.map((req) => {
          const title = language === 'zh' && req.productNameZh
            ? req.productNameZh
            : req.productName;

          return (
            <Link key={req.id} href={`/purchase-requests/${req.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* 이미지 */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {req.productImage ? (
                        <Image
                          src={req.productImage}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-1">{title}</h3>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {req.estimatedPrice && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {language === 'ko' ? '예상 ' : '预计 '}
                            ₩{req.estimatedPrice.toLocaleString()}
                          </span>
                        )}
                        {req.maxBudget && (
                          <span className="flex items-center gap-1">
                            {language === 'ko' ? '예산 ' : '预算 '}
                            ₩{req.maxBudget.toLocaleString()}
                          </span>
                        )}
                        <span>
                          {req.quantity}{language === 'ko' ? '개' : '件'}
                        </span>
                        {req.productUrl && (
                          <ExternalLink className="h-3 w-3" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={req.requester.profileImage || ''} />
                            <AvatarFallback className="text-[10px]">
                              {req.requester.nickname?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {req.requester.nickname}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {formatRelativeTime(new Date(req.createdAt), language)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          {req.deadline && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Calendar className="h-3 w-3" />
                              {new Date(req.deadline).toLocaleDateString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-primary">
                            <MessageSquare className="h-3 w-3" />
                            {req.offerCount} {language === 'ko' ? '제안' : '报价'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
