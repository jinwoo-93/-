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
      <Card className={className}>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={productTitle}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}

                    {/* 추천 이유 배지 */}
                    <Badge
                      variant="secondary"
                      className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/80"
                    >
                      {reason}
                    </Badge>

                    {/* 거래 방향 */}
                    <Badge
                      variant={product.tradeDirection === 'KR_TO_CN' ? 'korea' : 'china'}
                      className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5"
                    >
                      {product.tradeDirection === 'KR_TO_CN' ? '🇰🇷' : '🇨🇳'}
                    </Badge>
                  </div>

                  {/* 정보 */}
                  <div>
                    <p className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {productTitle}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {format(product.priceKRW, product.priceCNY)}
                    </p>

                    {/* 판매자 */}
                    <div className="flex items-center gap-1 mt-1.5">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={product.user.profileImage || ''} />
                        <AvatarFallback className="text-[8px]">
                          {product.user.nickname?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">
                        {product.user.nickname}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
