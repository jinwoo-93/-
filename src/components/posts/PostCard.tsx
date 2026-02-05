'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WishlistButton from '@/components/product/WishlistButton';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { language } = useLanguage();
  const { format } = useCurrency();

  const title = language === 'zh' && post.titleZh ? post.titleZh : post.title;
  const directionBadge =
    post.tradeDirection === 'KR_TO_CN' ? 'korea' : 'china';

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="overflow-hidden card-hover h-full">
        {/* 이미지 */}
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
          <Badge
            variant={directionBadge}
            className="absolute top-2 left-2 text-xs"
          >
            {post.tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
          </Badge>
          <WishlistButton postId={post.id} size="sm" variant="card" />
        </div>

        <CardContent className="p-3">
          {/* 제목 */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {title}
          </h3>

          {/* 가격 */}
          <p className="text-lg font-bold text-primary mb-2">
            {format(post.priceKRW, post.priceCNY)}
          </p>

          {/* 판매자 정보 */}
          {post.user && (
            <div className="flex items-center gap-2 mb-2">
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
                <Badge variant="excellent" className="text-[10px] px-1 py-0">
                  ⭐
                </Badge>
              )}
            </div>
          )}

          {/* 통계 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {post.salesCount}
            </span>
            {post.user?.averageRating && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {post.user.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PostCard;
