'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { formatRelativeTime } from '@/lib/utils';

interface RecentlyViewedProps {
  currentPostId?: string;
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export default function RecentlyViewed({
  currentPostId,
  maxItems = 10,
  showHeader = true,
  className,
}: RecentlyViewedProps) {
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { posts, removePost, clearAll } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 현재 보고 있는 상품 제외
  const filteredPosts = posts
    .filter((post) => post.id !== currentPostId)
    .slice(0, maxItems);

  if (filteredPosts.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {language === 'ko' ? '최근 본 상품' : '最近浏览'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {language === 'ko' ? '전체 삭제' : '清空'}
          </Button>
        </CardHeader>
      )}
      <CardContent className={showHeader ? 'pt-0' : 'pt-4'}>
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const title = language === 'zh' && post.titleZh ? post.titleZh : post.title;

            return (
              <div
                key={post.id}
                className="group relative flex gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Link
                  href={`/posts/${post.id}`}
                  className="flex gap-3 flex-1 min-w-0"
                >
                  {/* 이미지 */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {post.images.length > 0 ? (
                      <Image
                        src={post.images[0]}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      variant={post.tradeDirection === 'KR_TO_CN' ? 'korea' : 'china'}
                      className="absolute bottom-1 left-1 text-[10px] px-1 py-0"
                    >
                      {post.tradeDirection === 'KR_TO_CN' ? '🇰🇷' : '🇨🇳'}
                    </Badge>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{title}</p>
                    <p className="text-sm font-bold text-primary mt-1">
                      {format(post.priceKRW, post.priceCNY)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(new Date(post.viewedAt), language)}
                    </p>
                  </div>
                </Link>

                {/* 삭제 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    removePost(post.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {posts.length > maxItems && (
          <Link
            href="/mypage/recently-viewed"
            className="block mt-4 text-center text-sm text-primary hover:underline"
          >
            {language === 'ko'
              ? `전체 보기 (${posts.length}개)`
              : `查看全部 (${posts.length}件)`}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
