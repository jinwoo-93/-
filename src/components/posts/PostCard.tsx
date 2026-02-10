'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, Star, Truck, MessageSquare, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WishlistButton from '@/components/product/WishlistButton';
import { TradeBadge } from '@/components/ui/TradeBadge';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { cn, formatPrice } from '@/lib/utils';
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
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="flex gap-4 p-4 bg-white rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all duration-300 border border-gray-100">
          {/* 이미지 */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            {/* 거래 방향 뱃지 */}
            <div className="absolute top-2 left-2">
              <TradeBadge direction={post.tradeDirection} size="sm" variant="filled" showIcon={false} />
            </div>
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 text-gray-900">
              {title}
            </h3>

            {/* 가격 */}
            <div className="mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {hasDiscount && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-white bg-red-500">
                    {discountPercent}%
                  </span>
                )}
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatKRW(post.originalPriceKRW!)}
                  </span>
                )}
              </div>
              <span className="text-lg font-bold text-brand-orange">{format(post.priceKRW, post.priceCNY)}</span>
            </div>

            {/* 배송 정보 & 에스크로 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-korea-700 bg-korea-50 rounded-full">
                <Truck className="h-3 w-3" />
                {language === 'ko' ? '국제배송' : '国际配送'}
              </span>
              {post.hasEscrow && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-escrow-700 bg-escrow-50 rounded-full">
                  <Shield className="h-3 w-3" />
                  {language === 'ko' ? '안전거래' : '担保交易'}
                </span>
              )}
            </div>

            {/* 판매자 & 통계 */}
            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
              {showSeller && post.user && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-5 w-5 border border-gray-200">
                    <AvatarImage src={post.user.profileImage || ''} />
                    <AvatarFallback className="text-[8px] bg-gray-100">
                      {post.user.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px] font-medium text-gray-700">{post.user.nickname}</span>
                  {post.user.averageRating && (
                    <span className="flex items-center gap-0.5 text-yellow-500">
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
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            <WishlistButton postId={post.id} size="sm" variant="card" />
          </div>
          <div className="p-2">
            <h3 className="text-xs line-clamp-2 mb-1 text-gray-900">{title}</h3>
            <p className="text-sm font-bold text-brand-orange">
              {format(post.priceKRW, post.priceCNY)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // 기본 레이아웃 (그리드 뷰)
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-full hover:shadow-xl hover:border-gray-200 hover:scale-[1.02] transition-all duration-300">
        {/* 이미지 영역 */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {post.images[0] ? (
            <Image
              src={post.images[0]}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

          {/* 거래 방향 뱃지 */}
          <div className="absolute top-2 left-2">
            <TradeBadge direction={post.tradeDirection} size="sm" variant="filled" showIcon={false} />
          </div>

          {/* 할인 뱃지 */}
          {hasDiscount && (
            <div className="absolute top-2 right-10 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-red-500">
              {discountPercent}%
            </div>
          )}

          {/* 찜 버튼 */}
          <WishlistButton postId={post.id} size="sm" variant="card" />

          {/* 베스트/신규 뱃지 */}
          {post.isBest && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">BEST</span>
          )}
          {post.isNew && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-bold text-white bg-green-500 rounded-full">NEW</span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-3">
          {/* 제목 */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem] text-gray-900">
            {title}
          </h3>

          {/* 가격 */}
          <div className="mb-2">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through block">
                {formatKRW(post.originalPriceKRW!)}
              </span>
            )}
            <span className="text-lg font-bold text-brand-orange">
              {format(post.priceKRW, post.priceCNY)}
            </span>
          </div>

          {/* 배송/혜택 뱃지 */}
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-korea-700 bg-korea-50 rounded">
              {language === 'ko' ? '국제배송' : '国际配送'}
            </span>
            {post.hasEscrow && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-escrow-700 bg-escrow-50 rounded">
                <Shield className="h-2.5 w-2.5" />
                {language === 'ko' ? '안전거래' : '担保交易'}
              </span>
            )}
          </div>

          {/* 판매자 정보 */}
          {showSeller && post.user && (
            <div className="flex items-center gap-2 mb-2 pt-2 border-t border-gray-100">
              <Avatar className="h-5 w-5 border border-gray-200">
                <AvatarImage src={post.user.profileImage || ''} />
                <AvatarFallback className="text-xs bg-gray-100">
                  {post.user.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 truncate flex-1">
                {post.user.nickname}
              </span>
              {post.user.hasExcellentBadge && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-medium">
                  TOP
                </span>
              )}
            </div>
          )}

          {/* 통계 */}
          {showStats && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {post.user?.averageRating && (
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
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
