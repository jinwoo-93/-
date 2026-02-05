'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Radio,
  Users,
  Clock,
  Calendar,
  Play,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { formatRelativeTime } from '@/lib/utils';

interface LiveProduct {
  id: string;
  postId: string;
  livePrice?: number;
  livePriceCNY?: number;
  post: {
    id: string;
    title: string;
    titleZh?: string;
    priceKRW: number;
    priceCNY: number;
    images: string[];
  };
}

interface LiveStream {
  id: string;
  hostId: string;
  title: string;
  titleZh?: string;
  thumbnail?: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  scheduledAt?: string;
  startedAt?: string;
  viewerCount: number;
  totalViews: number;
  host: {
    id: string;
    nickname: string;
    profileImage?: string;
    hasExcellentBadge: boolean;
    isBusinessVerified: boolean;
  };
  products: LiveProduct[];
}

interface LiveStreamListProps {
  status?: 'LIVE' | 'SCHEDULED' | 'ENDED';
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

export default function LiveStreamList({
  status,
  limit = 6,
  showTitle = true,
  className,
}: LiveStreamListProps) {
  const { language } = useLanguage();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, [status]);

  const fetchStreams = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (status) params.append('status', status);

      const res = await fetch(`/api/live?${params}`);
      const data = await res.json();

      if (data.success) {
        setStreams(data.data.streams);
      }
    } catch (error) {
      console.error('Failed to fetch live streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (stream: LiveStream) => {
    switch (stream.status) {
      case 'LIVE':
        return (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        );
      case 'SCHEDULED':
        return (
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            {language === 'ko' ? '예정' : '预告'}
          </Badge>
        );
      case 'ENDED':
        return (
          <Badge variant="outline">
            <Play className="h-3 w-3 mr-1" />
            {language === 'ko' ? '다시보기' : '回放'}
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

  if (streams.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Radio className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {language === 'ko' ? '진행 중인 라이브 방송이 없습니다' : '暂无直播'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            {language === 'ko' ? '라이브 커머스' : '直播购物'}
          </h2>
          <Link href="/live">
            <Button variant="ghost" size="sm">
              {language === 'ko' ? '전체보기' : '查看全部'}
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream) => {
          const title = language === 'zh' && stream.titleZh ? stream.titleZh : stream.title;

          return (
            <Link key={stream.id} href={`/live/${stream.id}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                {/* 썸네일 */}
                <div className="relative aspect-video bg-muted">
                  {stream.thumbnail ? (
                    <Image
                      src={stream.thumbnail}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/20 to-primary/5">
                      <Radio className="h-12 w-12 text-primary/50" />
                    </div>
                  )}

                  {/* 상태 배지 */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(stream)}
                  </div>

                  {/* 시청자 수 */}
                  {stream.status === 'LIVE' && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/60 text-white">
                        <Users className="h-3 w-3 mr-1" />
                        {stream.viewerCount.toLocaleString()}
                      </Badge>
                    </div>
                  )}

                  {/* 예정 시간 */}
                  {stream.status === 'SCHEDULED' && stream.scheduledAt && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-black/60 text-white text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(stream.scheduledAt).toLocaleDateString(
                          language === 'ko' ? 'ko-KR' : 'zh-CN',
                          { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </Badge>
                    </div>
                  )}

                  {/* 상품 미리보기 */}
                  {stream.products.length > 0 && (
                    <div className="absolute bottom-2 left-2 flex -space-x-2">
                      {stream.products.slice(0, 3).map((product) => (
                        <div
                          key={product.id}
                          className="w-8 h-8 rounded border-2 border-white overflow-hidden bg-white"
                        >
                          {product.post?.images?.[0] ? (
                            <Image
                              src={product.post.images[0]}
                              alt=""
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ShoppingBag className="w-full h-full p-1 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                      {stream.products.length > 3 && (
                        <div className="w-8 h-8 rounded border-2 border-white bg-muted flex items-center justify-center text-xs font-medium">
                          +{stream.products.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <CardContent className="p-3">
                  <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={stream.host.profileImage || ''} />
                      <AvatarFallback className="text-xs">
                        {stream.host.nickname?.charAt(0) || 'H'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">
                      {stream.host.nickname}
                    </span>
                    {stream.host.hasExcellentBadge && (
                      <Badge variant="excellent" className="text-[10px] px-1 py-0">
                        {language === 'ko' ? '우수' : '优'}
                      </Badge>
                    )}
                  </div>

                  {stream.status === 'ENDED' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      {stream.totalViews.toLocaleString()} {language === 'ko' ? '시청' : '观看'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
