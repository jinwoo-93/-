'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  TrendingUp,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  titleZh: string | null;
  images: string[];
  priceKRW: number;
  priceCNY: number;
  stock: number;
  status: string;
  viewCount: number;
  salesCount: number;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, { ko: string; zh: string; color: string }> = {
  ACTIVE: { ko: '판매중', zh: '销售中', color: 'bg-green-100 text-green-800' },
  SOLD_OUT: { ko: '품절', zh: '售罄', color: 'bg-red-100 text-red-800' },
  INACTIVE: { ko: '숨김', zh: '隐藏', color: 'bg-gray-100 text-gray-800' },
  DELETED: { ko: '삭제됨', zh: '已删除', color: 'bg-red-100 text-red-800' },
};

export default function SellerProductsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, soldOut: 0, inactive: 0 });

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const res = await fetch(`/api/posts?${params.toString()}&myPosts=true`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.data.posts || []);

        // 통계 계산
        const allRes = await fetch('/api/posts?myPosts=true&limit=1000');
        const allData = await allRes.json();
        if (allData.success) {
          const all = allData.data.posts;
          setStats({
            total: all.length,
            active: all.filter((p: Post) => p.status === 'ACTIVE').length,
            soldOut: all.filter((p: Post) => p.status === 'SOLD_OUT').length,
            inactive: all.filter((p: Post) => p.status === 'INACTIVE').length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        fetchPosts();
      } else {
        alert(data.error?.message || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.titleZh?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container-app py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 관리</h1>
          <p className="text-gray-600 mt-1">등록한 상품을 관리합니다.</p>
        </div>
        <Link href="/posts/create">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>새 상품 등록</span>
          </button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 상품</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">판매중</p>
              <p className="text-2xl font-bold text-green-800">{stats.active}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">품절</p>
              <p className="text-2xl font-bold text-red-800">{stats.soldOut}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">숨김</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
            </div>
            <Eye className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['all', 'ACTIVE', 'SOLD_OUT', 'INACTIVE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '전체' : STATUS_LABELS[f].ko}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="상품명 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
            </p>
            {!searchQuery && (
              <Link href="/posts/create">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  첫 상품 등록하기
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* 이미지 */}
                  <div className="relative w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {post.images[0] ? (
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
                        {post.titleZh && (
                          <p className="text-sm text-gray-600">{post.titleZh}</p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_LABELS[post.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[post.status]?.ko || post.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">가격:</span>{' '}
                        ₩{post.priceKRW.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">재고:</span> {post.stock}개
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4" />
                        <span>{post.salesCount}건 판매</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/posts/${post.id}`}>
                        <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>보기</span>
                        </button>
                      </Link>
                      <Link href={`/posts/${post.id}/edit`}>
                        <button className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                          <Edit className="w-4 h-4" />
                          <span>수정</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
