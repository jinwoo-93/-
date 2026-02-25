'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, TrendingUp, Layers, ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';

interface RecommendedProduct {
  id: string;
  title: string;
  titleZh?: string;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  tradeDirection: string;
  salesCount: number;
  viewCount: number;
  user: {
    id: string;
    nickname: string | null;
    profileImage: string | null;
    averageRating: number;
  };
  score: number;
  reason: string;
  reasonZh: string;
}

export interface ProductRecommendationsProps {
  type?: 'personalized' | 'similar' | 'popular';
  postId?: string;
  categoryId?: string;
  tradeDirection?: 'KR_TO_CN' | 'CN_TO_KR';
  limit?: number;
  title?: string;
  titleZh?: string;
  showTitle?: boolean;
  className?: string;
}

export default function ProductRecommendations({
  type = 'popular',
  postId,
  categoryId,
  tradeDirection,
  limit = 6,
  title,
  titleZh,
  showTitle = true,
  className,
}: ProductRecommendationsProps) {
  const { language } = useLanguage();
  const { format } = useCurrency();

  const [products, setProducts] = useState<RecommendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [type, postId, categoryId, tradeDirection]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ type, limit: limit.toString() });
      if (postId) params.append('postId', postId);
      if (categoryId) params.append('categoryId', categoryId);
      if (tradeDirection) params.append('tradeDirection', tradeDirection);

      const res = await fetch(`/api/recommendations?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'personalized':
        return <Sparkles className="h-5 w-5" />;
      case 'similar':
        return <Layers className="h-5 w-5" />;
      case 'popular':
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    if (title) return language === 'zh' && titleZh ? titleZh : title;

    switch (type) {
      case 'personalized':
        return language === 'ko' ? '맞춤 추천' : '为您推荐';
      case 'similar':
        return language === 'ko' ? '유사 상품' : '相似商品';
      case 'popular':
      default:
        return language === 'ko' ? '인기 상품' : '热门商品';
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="mb-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </h3>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 빈 슬롯 생성 함수
  const renderEmptySlots = () => {
    const emptyCount = limit - products.length;
    return Array.from({ length: emptyCount }).map((_, index) => (
      <div key={`empty-${index}`} className="space-y-2">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-400">
              {language === 'ko' ? '상품 없음' : '暂无商品'}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-4 bg-gray-50 rounded" />
          <div className="h-4 bg-gray-50 rounded w-2/3" />
        </div>
      </div>
    ));
  };

  return (
    <div className={className}>
      {showTitle && (
        <div className="mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </h3>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
            const productTitle = language === 'zh' && product.titleZh
              ? product.titleZh
              : product.title;
            const reason = language === 'zh' ? product.reasonZh : product.reason;

            return (
              <Link
                key={product.id}
                href={`/posts/${product.id}`}
                className="group"
              >
                <div className="space-y-2">
                  {/* 이미지 */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={productTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}

                    {/* 추천 이유 배지 */}
                    {reason && (
                      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium text-gray-700">
                        {reason}
                      </div>
                    )}

                    {/* 거래 방향 */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-medium">
                      {product.tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
                    </div>
                  </div>

                  {/* 정보 */}
                  <div>
                    <p className="text-sm line-clamp-2 group-hover:text-blue-600 transition-colors font-medium">
                      {productTitle}
                    </p>
                    <p className="text-sm font-bold text-black mt-1">
                      {format(product.priceKRW, product.priceCNY)}
                    </p>

                    {/* 판매자 */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={product.user.profileImage || ''} />
                        <AvatarFallback className="text-[8px] bg-gray-100">
                          {product.user.nickname?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500 truncate">
                        {product.user.nickname}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 빈 슬롯 렌더링 */}
          {products.length < limit && renderEmptySlots()}
        </div>
      </div>
    );
  }
