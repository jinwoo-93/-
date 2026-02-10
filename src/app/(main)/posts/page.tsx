'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/posts/PostCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import type { Post } from '@/types';

function PostsContent() {
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const direction = searchParams.get('direction');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchPosts();
  }, [direction, category, search]);

  const fetchPosts = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (direction) params.set('direction', direction);
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      params.set('page', String(pageNum));
      params.set('limit', '20');

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setPosts(data.data);
        } else {
          setPosts((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.meta.page < data.meta.totalPages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {direction === 'KR_TO_CN' && (
            <Badge variant="korea" className="text-sm">
              {t('home.koreaToChina')}
            </Badge>
          )}
          {direction === 'CN_TO_KR' && (
            <Badge variant="china" className="text-sm">
              {t('home.chinaToKorea')}
            </Badge>
          )}
          <h1 className="text-2xl font-bold">
            {search
              ? `"${search}" ${language === 'ko' ? '검색 결과' : '搜索结果'}`
              : category
              ? category
              : t('home.popularProducts')}
          </h1>
        </div>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {t('common.filter')}
        </Button>
      </div>

      {/* 거래 방향 탭 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={!direction ? 'default' : 'outline'}
          size="sm"
          onClick={() => window.history.pushState({}, '', '/posts')}
        >
          {t('common.all')}
        </Button>
        <Button
          variant={direction === 'KR_TO_CN' ? 'korea' : 'outline'}
          size="sm"
          onClick={() => window.history.pushState({}, '', '/posts?direction=KR_TO_CN')}
        >
          {t('home.koreaToChina')}
        </Button>
        <Button
          variant={direction === 'CN_TO_KR' ? 'china' : 'outline'}
          size="sm"
          onClick={() => window.history.pushState({}, '', '/posts?direction=CN_TO_KR')}
        >
          {t('home.chinaToKorea')}
        </Button>
      </div>

      {/* 상품 목록 */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : t('common.more')}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {language === 'ko'
                ? '등록된 상품이 없습니다.'
                : '暂无商品'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PostsPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="py-12" />}>
      <PostsContent />
    </Suspense>
  );
}
