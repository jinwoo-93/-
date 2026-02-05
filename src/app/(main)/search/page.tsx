'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Grid3X3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface Post {
  id: string;
  title: string;
  titleZh: string | null;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  direction: string;
  status: string;
  viewCount: number;
  createdAt: string;
  category: {
    id: string;
    nameKo: string;
    nameZh: string;
  };
  seller: {
    id: string;
    name: string;
    image: string | null;
    averageRating: number;
  };
  _count: {
    reviews: number;
  };
}

interface SearchResult {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  query: string;
}

const sortOptions = [
  { value: 'recent', labelKo: '최신순', labelZh: '最新' },
  { value: 'price_low', labelKo: '가격 낮은순', labelZh: '价格从低到高' },
  { value: 'price_high', labelKo: '가격 높은순', labelZh: '价格从高到低' },
  { value: 'popular', labelKo: '인기순', labelZh: '热门' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();

  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 필터 상태
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    direction: searchParams.get('direction') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'recent',
  });

  const fetchResults = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.direction) params.set('direction', filters.direction);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      params.set('sort', filters.sort);
      params.set('page', searchParams.get('page') || '1');

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // URL 파라미터 업데이트
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.query) params.set('q', updated.query);
    if (updated.category) params.set('category', updated.category);
    if (updated.direction) params.set('direction', updated.direction);
    if (updated.minPrice) params.set('minPrice', updated.minPrice);
    if (updated.maxPrice) params.set('maxPrice', updated.maxPrice);
    if (updated.sort !== 'recent') params.set('sort', updated.sort);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      query: filters.query,
      category: '',
      direction: '',
      minPrice: '',
      maxPrice: '',
      sort: 'recent',
    });
    router.push(`/search?q=${filters.query}`);
  };

  const hasActiveFilters =
    filters.category ||
    filters.direction ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sort !== 'recent';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 검색 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && updateFilters({ query: filters.query })}
                placeholder={language === 'ko' ? '상품 검색...' : '搜索商品...'}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(hasActiveFilters && 'border-blue-500 text-blue-600')}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {language === 'ko' ? '필터' : '筛选'}
              {hasActiveFilters && (
                <Badge className="ml-2 bg-blue-500">!</Badge>
              )}
            </Button>
          </div>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 거래 방향 */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ko' ? '거래 방향' : '交易方向'}
                  </label>
                  <select
                    value={filters.direction}
                    onChange={(e) => updateFilters({ direction: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">{language === 'ko' ? '전체' : '全部'}</option>
                    <option value="KR_TO_CN">
                      {language === 'ko' ? '한국 → 중국' : '韩国 → 中国'}
                    </option>
                    <option value="CN_TO_KR">
                      {language === 'ko' ? '중국 → 한국' : '中国 → 韩国'}
                    </option>
                  </select>
                </div>

                {/* 최소 가격 */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ko' ? '최소 가격' : '最低价格'}
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* 최대 가격 */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ko' ? '최대 가격' : '最高价格'}
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                    placeholder="∞"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                {/* 정렬 */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === 'ko' ? '정렬' : '排序'}
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {language === 'ko' ? option.labelKo : option.labelZh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {language === 'ko' ? '필터 초기화' : '清除筛选'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="container-app py-6">
        {/* 결과 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {result && (
              <p className="text-gray-600">
                {filters.query && (
                  <span className="font-medium text-gray-900">"{filters.query}"</span>
                )}{' '}
                {language === 'ko'
                  ? `검색 결과 ${result.pagination.total.toLocaleString()}개`
                  : `搜索结果 ${result.pagination.total.toLocaleString()}个`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded',
                viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded',
                viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 로딩 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : result?.posts.length === 0 ? (
          /* 결과 없음 */
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'ko' ? '검색 결과가 없습니다' : '没有搜索结果'}
            </h3>
            <p className="text-gray-500">
              {language === 'ko'
                ? '다른 검색어나 필터를 시도해보세요.'
                : '请尝试其他关键词或筛选条件。'}
            </p>
          </Card>
        ) : (
          /* 결과 목록 */
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-4'
            )}
          >
            {result?.posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Card
                  className={cn(
                    'overflow-hidden hover:shadow-lg transition-shadow',
                    viewMode === 'list' && 'flex'
                  )}
                >
                  {/* 이미지 */}
                  <div
                    className={cn(
                      'relative bg-gray-100',
                      viewMode === 'grid' ? 'aspect-square' : 'w-32 h-32 flex-shrink-0'
                    )}
                  >
                    {post.images[0] ? (
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes={viewMode === 'grid' ? '(max-width: 768px) 50vw, 25vw' : '128px'}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    {/* 거래 방향 뱃지 */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        className={cn(
                          'text-xs',
                          post.direction === 'KR_TO_CN'
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        )}
                      >
                        {post.direction === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
                      </Badge>
                    </div>
                  </div>

                  {/* 정보 */}
                  <div className="p-3 flex-1">
                    <h3 className="font-medium line-clamp-2 mb-1">
                      {language === 'ko' ? post.title : post.titleZh || post.title}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      ₩{post.priceKRW.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      ≈ ¥{post.priceCNY.toLocaleString()}
                    </p>
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span>{post.seller.name}</span>
                        <span>•</span>
                        <span>
                          {language === 'ko' ? post.category.nameKo : post.category.nameZh}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {result && result.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, result.pagination.page - 3),
                Math.min(result.pagination.totalPages, result.pagination.page + 2)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', page.toString());
                    router.push(`/search?${params.toString()}`);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg',
                    page === result.pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
