'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Grid, List, ChevronRight, Loader2, SlidersHorizontal } from 'lucide-react';

interface Category {
  id: string;
  nameKo: string;
  nameZh: string;
  slug: string;
  icon: string | null;
  children: Category[];
}

export default function SubCategoryPage() {
  const params = useParams();
  const { language } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'price-low' | 'price-high'>('latest');
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategory, setSubCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // 카테고리 정보 불러오기
  useEffect(() => {
    fetchCategory();
  }, [params.slug, params.subSlug]);

  const fetchCategory = async () => {
    setCategoryLoading(true);
    try {
      const res = await fetch('/api/categories/nav');
      const data = await res.json();
      if (data.success) {
        const foundCategory = data.data.find((cat: Category) => cat.slug === params.slug);
        if (foundCategory) {
          setCategory(foundCategory);
          const foundSubCategory = foundCategory.children?.find((sub: Category) => sub.slug === params.subSlug);
          setSubCategory(foundSubCategory || null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [params.slug, params.subSlug, sortBy]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출
      // const res = await fetch(`/api/posts?category=${params.slug}&subCategory=${params.subSlug}&sort=${sortBy}`);
      // const data = await res.json();

      // 임시 더미 데이터
      setPosts([]);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (categoryLoading) {
    return (
      <div className="container-app py-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!category || !subCategory) {
    return (
      <div className="container-app py-12 text-center">
        <p className="text-gray-600">카테고리를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container-app py-6">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-gray-900">
          {language === 'ko' ? '홈' : '首页'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/category/${category.slug}`} className="hover:text-gray-900">
          {language === 'ko' ? category.nameKo : category.nameZh}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">
          {language === 'ko' ? subCategory.nameKo : subCategory.nameZh}
        </span>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {language === 'ko' ? subCategory.nameKo : subCategory.nameZh}
        </h1>

        <div className="flex items-center gap-2">
          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="latest">{language === 'ko' ? '최신순' : '最新'}</option>
            <option value="popular">{language === 'ko' ? '인기순' : '热门'}</option>
            <option value="price-low">{language === 'ko' ? '낮은 가격순' : '价格从低到高'}</option>
            <option value="price-high">{language === 'ko' ? '높은 가격순' : '价格从高到低'}</option>
          </select>

          {/* 필터 버튼 */}
          <button className="p-2 border rounded-lg hover:bg-gray-50">
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* 보기 모드 */}
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 다른 서브 카테고리 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {category.children && category.children.map((sub) => {
            const isActive = sub.slug === params.subSlug;
            return (
              <Link
                key={sub.id}
                href={`/category/${category.slug}/${sub.slug}`}
                className={`
                  whitespace-nowrap py-3 px-1 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:text-black hover:border-gray-300'
                  }
                `}
              >
                {language === 'ko' ? sub.nameKo : sub.nameZh}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 상품 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">
            {language === 'ko' ? '상품이 없습니다.' : '暂无商品'}
          </p>
          <Link
            href="/posts/create"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {language === 'ko' ? '첫 상품 등록하기' : '发布第一个商品'}
          </Link>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-4'
          }
        >
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border p-4">
              {/* 상품 카드 내용 */}
              <p>{post.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
