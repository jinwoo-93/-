'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, Star, Truck, Clock, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WishlistButton from '@/components/product/WishlistButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'horizontal';
  showSeller?: boolean;
  showStats?: boolean;
}

export function PostCard({
  post,
  variant = 'default',
  showSeller = true,
  showStats = true,
}: PostCardProps) {
  const { language } = useLanguage();
  const { format, formatKRW, formatCNY } = useCurrency();

  const title = language === 'zh' && post.titleZh ? post.titleZh : post.title;
  const isKoreaToChina = post.tradeDirection === 'KR_TO_CN';

  // 할인율 계산 (originalPrice가 있는 경우)
  const hasDiscount = post.originalPriceKRW && post.originalPriceKRW > post.priceKRW;
  const discountPercent = hasDiscount
    ? Math.round(((post.originalPriceKRW! - post.priceKRW) / post.originalPriceKRW!) * 100)
    : 0;

  // 수평 레이아웃 (검색 결과, 리스트 뷰)
  if (variant === 'horizontal') {
    return (
      <Link href={`/posts/${post.id}`} className="block">
        <div className="flex gap-4 p-4 bg-card rounded-lg hover:shadow-md transition-shadow">
          {/* 이미지 */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 bg-muted rounded-lg overflow-hidden">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            {/* 거래 방향 뱃지 */}
            <div className={cn(
              'absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium text-white',
              isKoreaToChina ? 'bg-blue-600' : 'bg-red-600'
            )}>
              {isKoreaToChina ? 'KR→CN' : 'CN→KR'}
            </div>
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2">
              {title}
            </h3>

            {/* 가격 */}
            <div className="mb-2">
              {hasDiscount && (
                <span className="price-original mr-2">
                  {formatKRW(post.originalPriceKRW!)}
                </span>
              )}
              <div className="flex items-center gap-2">
                {hasDiscount && (
                  <span className="price-discount">{discountPercent}%</span>
                )}
                <span className="price-current">{format(post.priceKRW, post.priceCNY)}</span>
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-free-shipping">
                <Truck className="h-3 w-3 mr-1" />
                {language === 'ko' ? '국제배송' : '国际配送'}
              </span>
            </div>

            {/* 판매자 & 통계 */}
            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              {showSeller && post.user && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={post.user.profileImage || ''} />
                    <AvatarFallback className="text-[8px]">
                      {post.user.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px]">{post.user.nickname}</span>
                  {post.user.averageRating && (
                    <span className="flex items-center gap-0.5 text-[hsl(var(--rating))]">
                      <Star className="h-3 w-3 fill-current" />
                      {post.user.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
              {showStats && (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {post.commentCount || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 컴팩트 레이아웃 (추천 상품, 작은 카드)
  if (variant === 'compact') {
    return (
      <Link href={`/posts/${post.id}`} className="block">
        <div className="product-card">
          <div className="relative aspect-square bg-muted">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            <WishlistButton postId={post.id} size="sm" variant="card" />
          </div>
          <div className="p-2">
            <h3 className="text-xs line-clamp-2 mb-1">{title}</h3>
            <p className="text-sm font-bold text-[hsl(var(--price))]">
              {format(post.priceKRW, post.priceCNY)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // 기본 레이아웃 (그리드 뷰)
  return (
    <Link href={`/posts/${post.id}`} className="block">
      <div className="product-card h-full">
        {/* 이미지 영역 */}
        <div className="relative aspect-square bg-muted">
          {post.images[0] ? (
            <Image
              src={post.images[0]}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

          {/* 거래 방향 뱃지 */}
          <div className={cn(
            'absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium text-white',
            isKoreaToChina ? 'bg-blue-600' : 'bg-red-600'
          )}>
            {isKoreaToChina ? 'KR→CN' : 'CN→KR'}
          </div>

          {/* 할인 뱃지 */}
          {hasDiscount && (
            <div className="absolute top-2 right-10 price-discount">
              {discountPercent}%
            </div>
          )}

          {/* 찜 버튼 */}
          <WishlistButton postId={post.id} size="sm" variant="card" />

          {/* 베스트/신규 뱃지 */}
          {post.isBest && (
            <span className="absolute bottom-2 left-2 badge-best">BEST</span>
          )}
          {post.isNew && (
            <span className="absolute bottom-2 left-2 badge-new">NEW</span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-3">
          {/* 제목 */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* 가격 */}
          <div className="mb-2">
            {hasDiscount && (
              <span className="price-original block">
                {formatKRW(post.originalPriceKRW!)}
              </span>
            )}
            <span className="price-current">
              {format(post.priceKRW, post.priceCNY)}
            </span>
          </div>

          {/* 배송/혜택 뱃지 */}
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="badge-free-shipping text-[10px]">
              {language === 'ko' ? '국제배송' : '国际配送'}
            </span>
            {post.hasEscrow && (
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-green-700 bg-green-50 rounded">
                {language === 'ko' ? '안전결제' : '担保支付'}
              </span>
            )}
          </div>

          {/* 판매자 정보 */}
          {showSeller && post.user && (
            <div className="flex items-center gap-2 mb-2 pt-2 border-t">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.user.profileImage || ''} />
                <AvatarFallback className="text-xs">
                  {post.user.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate flex-1">
                {post.user.nickname}
              </span>
              {post.user.hasExcellentBadge && (
                <span className="text-[10px] px-1 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded">
                  TOP
                </span>
              )}
            </div>
          )}

          {/* 통계 */}
          {showStats && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.user?.averageRating && (
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-[hsl(var(--rating))] text-[hsl(var(--rating))]" />
                  {post.user.averageRating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                {post.salesCount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PostCard;
