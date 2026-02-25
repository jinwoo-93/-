'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
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
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, price-low, price-high, popular
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const direction = searchParams.get('direction');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  useEffect(() => {
    fetchPosts();
  }, [direction, category, search, sortBy, priceMin, priceMax]);

  const fetchPosts = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (direction) params.set('direction', direction);
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      // 정렬 옵션 매핑
      const sortMapping: Record<string, string> = {
        'recent': 'latest',
        'price-low': 'price_asc',
        'price-high': 'price_desc',
        'popular': 'sales',
      };
      if (sortBy && sortBy !== 'recent') {
        params.set('sort', sortMapping[sortBy] || 'latest');
      }

      if (priceMin) params.set('minPrice', priceMin);
      if (priceMax) params.set('maxPrice', priceMax);
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

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    setPage(1);
    fetchPosts(1);
  };

  const handleResetFilters = () => {
    setSortBy('recent');
    setPriceMin('');
    setPriceMax('');
    setShowFilterModal(false);
    setPage(1);
  };

  const sortOptions = [
    { value: 'recent', labelKo: '최신순', labelZh: '最新' },
    { value: 'price-low', labelKo: '낮은 가격순', labelZh: '价格低到高' },
    { value: 'price-high', labelKo: '높은 가격순', labelZh: '价格高到低' },
    { value: 'popular', labelKo: '인기순', labelZh: '最热门' },
  ];

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  const directionTabs = [
    { value: null, labelKo: '전체', labelZh: '全部' },
    { value: 'KR_TO_CN', labelKo: '한국→중국', labelZh: '韩国→中国' },
    { value: 'CN_TO_KR', labelKo: '중국→한국', labelZh: '中国→韩国' },
  ];

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-black text-black">
          {search
            ? `"${search}" ${language === 'ko' ? '검색 결과' : '搜索结果'}`
            : category
            ? category
            : t('home.popularProducts')}
        </h1>
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[12px] font-bold text-black hover:border-black transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {t('common.filter')}
        </button>
      </div>

      {/* 정렬 옵션 표시 */}
      {(sortBy !== 'recent' || priceMin || priceMax) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {sortBy !== 'recent' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full">
              {sortOptions.find(opt => opt.value === sortBy)?.[language === 'ko' ? 'labelKo' : 'labelZh']}
              <button onClick={() => setSortBy('recent')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {(priceMin || priceMax) && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full">
              {priceMin && priceMax
                ? `₩${parseInt(priceMin).toLocaleString()} - ₩${parseInt(priceMax).toLocaleString()}`
                : priceMin
                ? `₩${parseInt(priceMin).toLocaleString()} ${language === 'ko' ? '이상' : '以上'}`
                : `₩${parseInt(priceMax).toLocaleString()} ${language === 'ko' ? '이하' : '以下'}`}
              <button onClick={() => { setPriceMin(''); setPriceMax(''); }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-gray-500 hover:text-black underline"
          >
            {language === 'ko' ? '필터 초기화' : '重置筛选'}
          </button>
        </div>
      )}

      {/* 필터 모달 */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:max-w-md md:rounded-lg overflow-hidden animate-slide-up md:animate-none">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {language === 'ko' ? '필터 및 정렬' : '筛选和排序'}
              </h2>
              <button onClick={() => setShowFilterModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 콘텐츠 */}
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 정렬 옵션 */}
              <div>
                <h3 className="text-sm font-bold mb-3">
                  {language === 'ko' ? '정렬' : '排序'}
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {language === 'ko' ? option.labelKo : option.labelZh}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 가격 범위 */}
              <div>
                <h3 className="text-sm font-bold mb-3">
                  {language === 'ko' ? '가격 범위' : '价格范围'}
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '최소' : '最低'}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder={language === 'ko' ? '최대' : '最高'}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {language === 'ko' ? '단위: 원 (KRW)' : '单位：韩元 (KRW)'}
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                {language === 'ko' ? '초기화' : '重置'}
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900"
              >
                {language === 'ko' ? '적용' : '应用'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 거래 방향 탭 */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        {directionTabs.map((tab) => (
          <button
            key={String(tab.value)}
            className={`pb-3 px-1 text-[13px] font-bold transition-colors border-b-2 ${
              direction === tab.value
                ? 'text-black border-black'
                : 'text-gray-400 border-transparent hover:text-black'
            }`}
            onClick={() => {
              const url = tab.value ? `/posts?direction=${tab.value}` : '/posts';
              window.history.pushState({}, '', url);
            }}
          >
            {language === 'ko' ? tab.labelKo : tab.labelZh}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      {isLoading && page === 1 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                className="h-[44px] px-10 border border-gray-200 text-[13px] font-bold text-black hover:border-black transition-colors disabled:opacity-40"
                onClick={loadMore}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (language === 'ko' ? '더보기' : '查看更多')}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-[14px] text-gray-400">
            {language === 'ko' ? '등록된 상품이 없습니다.' : '暂无商品'}
          </p>
        </div>
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
