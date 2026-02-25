'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, Star, Shield } from 'lucide-react';
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

  const hasDiscount = post.originalPriceKRW && post.originalPriceKRW > post.priceKRW;
  const discountPercent = hasDiscount
    ? Math.round(((post.originalPriceKRW! - post.priceKRW) / post.originalPriceKRW!) * 100)
    : 0;

  // 수평 레이아웃
  if (variant === 'horizontal') {
    return (
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="flex gap-4 p-4 bg-white border border-gray-100 hover:border-gray-300 transition-colors">
          <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] shrink-0 bg-gray-50 overflow-hidden">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <TradeBadge direction={post.tradeDirection} size="sm" variant="filled" showIcon={false} />
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col py-1">
            <h3 className="text-[14px] font-bold text-black line-clamp-2 mb-2">
              {title}
            </h3>

            <div className="mb-2">
              {hasDiscount && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[12px] font-black text-brand-orange">{discountPercent}%</span>
                  <span className="text-[12px] text-gray-400 line-through">
                    {formatKRW(post.originalPriceKRW!)}
                  </span>
                </div>
              )}
              <span className="text-[16px] font-black text-black">{format(post.priceKRW, post.priceCNY)}</span>
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {post.hasEscrow && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-escrow-700 bg-escrow-50 border border-escrow-200">
                  <Shield className="h-2.5 w-2.5" />
                  {language === 'ko' ? '안전거래' : '担保'}
                </span>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between text-[11px] text-gray-400">
              {showSeller && post.user && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-500">{post.user.nickname}</span>
                  {post.user.averageRating && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      {post.user.averageRating.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
              {showStats && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 컴팩트 레이아웃
  if (variant === 'compact') {
    return (
      <Link href={`/posts/${post.id}`} className="block group">
        <div className="bg-white border border-gray-100 overflow-hidden hover:border-gray-300 transition-colors">
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {post.images[0] ? (
              <Image
                src={post.images[0]}
                alt={title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
            )}
            <WishlistButton postId={post.id} size="sm" variant="card" />
          </div>
          <div className="p-2.5">
            <h3 className="text-[12px] text-gray-700 line-clamp-2 mb-1">{title}</h3>
            <p className="text-[14px] font-black text-black">
              {format(post.priceKRW, post.priceCNY)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // 기본 레이아웃
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <div className="bg-white border border-gray-100 overflow-hidden h-full hover:border-gray-300 transition-colors">
        {/* 이미지 */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {post.images[0] ? (
            <Image
              src={post.images[0]}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}

          <div className="absolute top-2 left-2">
            <TradeBadge direction={post.tradeDirection} size="sm" variant="filled" showIcon={false} />
          </div>

          {hasDiscount && (
            <div className="absolute top-2 right-10 px-1.5 py-0.5 text-[10px] font-black text-white bg-brand-orange">
              {discountPercent}%
            </div>
          )}

          <WishlistButton postId={post.id} size="sm" variant="card" />

          {post.isBest && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black text-white bg-black">BEST</span>
          )}
          {post.isNew && (
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-black text-white bg-brand-orange">NEW</span>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="p-3">
          <h3 className="text-[13px] text-gray-700 line-clamp-2 mb-2 min-h-[2.5rem]">
            {title}
          </h3>

          <div className="mb-2">
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through block">
                {formatKRW(post.originalPriceKRW!)}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {hasDiscount && (
                <span className="text-[15px] font-black text-brand-orange">{discountPercent}%</span>
              )}
              <span className="text-[15px] font-black text-black">
                {format(post.priceKRW, post.priceCNY)}
              </span>
            </div>
          </div>

          {/* 뱃지 */}
          <div className="flex flex-wrap gap-1 mb-2">
            {post.hasEscrow && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-escrow-700 bg-escrow-50 border border-escrow-200">
                <Shield className="h-2.5 w-2.5" />
                {language === 'ko' ? '안전거래' : '担保'}
              </span>
            )}
          </div>

          {/* 판매자 */}
          {showSeller && post.user && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Avatar className="h-5 w-5 border border-gray-200">
                <AvatarImage src={post.user.profileImage || ''} />
                <AvatarFallback className="text-[9px] bg-gray-100 font-bold">
                  {post.user.nickname?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-gray-500 truncate flex-1">
                {post.user.nickname}
              </span>
              {post.user.hasExcellentBadge && (
                <span className="text-[10px] px-1.5 py-0.5 bg-black text-white font-bold">
                  TOP
                </span>
              )}
            </div>
          )}

          {/* 통계 */}
          {showStats && (
            <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
              {post.user?.averageRating && (
                <span className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  {post.user.averageRating.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                {post.viewCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-0.5">
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
