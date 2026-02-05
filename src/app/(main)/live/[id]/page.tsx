'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Radio,
  Users,
  ShoppingBag,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  Star,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import FollowButton from '@/components/user/FollowButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';

interface LiveProduct {
  id: string;
  postId: string;
  livePrice?: number;
  livePriceCNY?: number;
  displayOrder: number;
  post: {
    id: string;
    title: string;
    titleZh?: string;
    priceKRW: number;
    priceCNY: number;
    images: string[];
    quantity: number;
    status: string;
  };
}

interface LiveStream {
  id: string;
  hostId: string;
  title: string;
  titleZh?: string;
  description?: string;
  descriptionZh?: string;
  thumbnail?: string;
  streamUrl?: string;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  peakViewers: number;
  totalViews: number;
  host: {
    id: string;
    nickname: string;
    profileImage?: string;
    hasExcellentBadge: boolean;
    isBusinessVerified: boolean;
    averageRating: number;
    totalSales: number;
  };
  products: LiveProduct[];
}

export default function LiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<LiveProduct | null>(null);

  useEffect(() => {
    fetchStream();
  }, [params.id]);

  const fetchStream = async () => {
    try {
      const res = await fetch(`/api/live/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setStream(data.data);
        if (data.data.products.length > 0) {
          setSelectedProduct(data.data.products[0]);
        }
      } else {
        router.push('/live');
      }
    } catch (error) {
      console.error('Failed to fetch stream:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!stream) return null;

  const title = language === 'zh' && stream.titleZh ? stream.titleZh : stream.title;
  const description = language === 'zh' && stream.descriptionZh ? stream.descriptionZh : stream.description;

  return (
    <div className="min-h-screen bg-black">
      {/* 상단 네비게이션 */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          {stream.status === 'LIVE' && (
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
          <Badge variant="secondary" className="bg-black/50 text-white">
            <Users className="h-3 w-3 mr-1" />
            {stream.status === 'LIVE' ? stream.viewerCount : stream.totalViews}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* 비디오 영역 */}
        <div className="flex-1 relative bg-gray-900">
          {stream.status === 'LIVE' && stream.streamUrl ? (
            <video
              src={stream.streamUrl}
              className="w-full h-full object-contain"
              autoPlay
              controls
            />
          ) : stream.thumbnail ? (
            <Image
              src={stream.thumbnail}
              alt={title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-white">
                <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {stream.status === 'SCHEDULED'
                    ? language === 'ko' ? '방송 예정' : '即将开播'
                    : language === 'ko' ? '방송 종료' : '直播已结束'}
                </p>
                {stream.scheduledAt && stream.status === 'SCHEDULED' && (
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(stream.scheduledAt).toLocaleString(language === 'ko' ? 'ko-KR' : 'zh-CN')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 사이드 패널 */}
        <div className="w-full lg:w-96 bg-background flex flex-col max-h-[50vh] lg:max-h-screen">
          {/* 방송 정보 */}
          <div className="p-4 border-b">
            <h1 className="font-bold text-lg">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}

            {/* 호스트 정보 */}
            <div className="flex items-center justify-between mt-4">
              <Link href={`/users/${stream.host.id}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={stream.host.profileImage || ''} />
                  <AvatarFallback>{stream.host.nickname?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{stream.host.nickname}</span>
                    {stream.host.hasExcellentBadge && (
                      <Badge variant="excellent" className="text-[10px] px-1">
                        {language === 'ko' ? '우수' : '优'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {stream.host.averageRating.toFixed(1)}
                    </span>
                    <span>{stream.host.totalSales} {language === 'ko' ? '거래' : '交易'}</span>
                  </div>
                </div>
              </Link>
              <FollowButton userId={stream.host.id} size="sm" />
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="font-medium flex items-center gap-2 mb-3">
                <ShoppingBag className="h-4 w-4" />
                {language === 'ko' ? '판매 상품' : '商品列表'} ({stream.products.length})
              </h2>

              <div className="space-y-3">
                {stream.products.map((product) => {
                  const productTitle = language === 'zh' && product.post.titleZh
                    ? product.post.titleZh
                    : product.post.title;
                  const hasLivePrice = product.livePrice && product.livePrice < product.post.priceKRW;

                  return (
                    <Link
                      key={product.id}
                      href={`/posts/${product.postId}`}
                      className={`flex gap-3 p-2 rounded-lg border transition-colors ${
                        selectedProduct?.id === product.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedProduct(product);
                      }}
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                        {product.post.images[0] ? (
                          <Image
                            src={product.post.images[0]}
                            alt={productTitle}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-full h-full p-3 text-muted-foreground" />
                        )}
                        {hasLivePrice && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1">
                            <Tag className="h-2 w-2 mr-0.5" />
                            SALE
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-2">{productTitle}</p>
                        <div className="mt-1">
                          {hasLivePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-red-500">
                                {format(product.livePrice!, product.livePriceCNY || product.livePrice! / 185)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {format(product.post.priceKRW, product.post.priceCNY)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold">
                              {format(product.post.priceKRW, product.post.priceCNY)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 선택된 상품 구매 버튼 */}
          {selectedProduct && (
            <div className="p-4 border-t bg-muted/30">
              <Link href={`/posts/${selectedProduct.postId}`}>
                <Button className="w-full" size="lg">
                  {language === 'ko' ? '상품 보러가기' : '查看商品'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
