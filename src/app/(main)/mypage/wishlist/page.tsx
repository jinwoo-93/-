'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Trash2, Package, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import WishlistButton from '@/components/product/WishlistButton';

interface WishlistItem {
  id: string;
  title: string;
  titleZh?: string;
  priceKRW: number;
  priceCNY: number;
  images: string[];
  status: string;
  wishlistId: string;
  addedAt: string;
  seller: {
    id: string;
    nickname: string;
    averageRating: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWishlist();
    }
  }, [status, pagination.page]);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/wishlist?page=${pagination.page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (postId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== postId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">판매중</span>;
      case 'SOLD_OUT':
        return <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">품절</span>;
      case 'HIDDEN':
        return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded">숨김</span>;
      default:
        return null;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              <h1 className="text-xl font-bold">찜 목록</h1>
            </div>
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-sm font-medium rounded-full">
              {pagination.total}
            </span>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">찜한 상품이 없습니다</h2>
            <p className="text-gray-500 mb-6">마음에 드는 상품을 찜해보세요!</p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Package className="w-5 h-5" />
              상품 둘러보기
            </Link>
          </div>
        ) : (
          <>
            {/* 상품 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* 이미지 */}
                  <Link href={`/posts/${item.id}`} className="block relative aspect-square">
                    <Image
                      src={item.images[0] || '/images/placeholder.png'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.status === 'SOLD_OUT' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">품절</span>
                      </div>
                    )}
                    {/* 찜 버튼 */}
                    <WishlistButton
                      postId={item.id}
                      initialWishlisted={true}
                      size="sm"
                      variant="card"
                      onToggle={(isWishlisted) => {
                        if (!isWishlisted) handleRemove(item.id);
                      }}
                    />
                  </Link>

                  {/* 정보 */}
                  <div className="p-3">
                    <Link href={`/posts/${item.id}`}>
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      ₩{formatPrice(item.priceKRW)}
                    </p>

                    {/* 판매자 정보 */}
                    <Link
                      href={`/users/${item.seller.id}`}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <span>{item.seller.nickname}</span>
                      {item.seller.averageRating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          {item.seller.averageRating.toFixed(1)}
                        </span>
                      )}
                    </Link>

                    {/* 찜한 날짜 */}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(item.addedAt)} 찜함
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
