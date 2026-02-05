'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { formatRelativeTime } from '@/lib/utils';

export default function RecentlyViewedPage() {
  const { language } = useLanguage();
  const { format } = useCurrency();
  const { posts, removePost, clearAll } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container-app py-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/mypage">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {language === 'ko' ? '최근 본 상품' : '最近浏览'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'ko'
                ? `총 ${posts.length}개의 상품`
                : `共 ${posts.length} 件商品`}
            </p>
          </div>
        </div>

        {posts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {language === 'ko' ? '전체 삭제' : '清空'}
          </Button>
        )}
      </div>

      {/* 상품 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {language === 'ko' ? '최근 본 상품이 없습니다' : '暂无浏览记录'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'ko'
              ? '상품을 둘러보면 여기에 기록됩니다'
              : '浏览商品后会显示在这里'}
          </p>
          <Link href="/posts">
            <Button className="mt-6">
              {language === 'ko' ? '상품 둘러보기' : '浏览商品'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => {
            const title = language === 'zh' && post.titleZh ? post.titleZh : post.title;

            return (
              <div
                key={post.id}
                className="group relative bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/posts/${post.id}`}>
                  {/* 이미지 */}
                  <div className="relative aspect-square bg-muted">
                    {post.images.length > 0 ? (
                      <Image
                        src={post.images[0]}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      variant={post.tradeDirection === 'KR_TO_CN' ? 'korea' : 'china'}
                      className="absolute top-2 left-2"
                    >
                      {post.tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
                    </Badge>
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <p className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">
                      {title}
                    </p>
                    <p className="text-base font-bold text-primary mt-2">
                      {format(post.priceKRW, post.priceCNY)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'ko' ? '조회: ' : '浏览: '}
                      {formatRelativeTime(new Date(post.viewedAt), language)}
                    </p>
                  </div>
                </Link>

                {/* 삭제 버튼 */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
                  onClick={(e) => {
                    e.preventDefault();
                    removePost(post.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
