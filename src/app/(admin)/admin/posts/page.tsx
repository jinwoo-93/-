'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';
import { PostDetailModal } from '@/components/admin/PostDetailModal';

interface Post {
  id: string;
  title: string;
  titleZh: string | null;
  images: string[];
  priceKRW: number;
  priceCNY: number;
  quantity: number;
  status: 'ACTIVE' | 'SOLD_OUT' | 'INACTIVE' | 'DELETED';
  postType: 'SELL' | 'BUY';
  tradeDirection: 'KR_TO_CN' | 'CN_TO_KR';
  viewCount: number;
  salesCount: number;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
    country: string;
  };
  category: {
    id: string;
    nameKo: string;
    nameZh: string;
  };
}

const STATUS_CONFIG = {
  ACTIVE: { label: '판매중', labelZh: '销售中', color: 'bg-green-100 text-green-800' },
  SOLD_OUT: { label: '품절', labelZh: '售罄', color: 'bg-gray-100 text-gray-800' },
  INACTIVE: { label: '숨김', labelZh: '隐藏', color: 'bg-yellow-100 text-yellow-800' },
  DELETED: { label: '삭제됨', labelZh: '已删除', color: 'bg-red-100 text-red-800' },
};

export default function AdminPostsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, isAdmin } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
        return;
      }
      fetchPosts();
    }
  }, [authLoading, isAuthenticated, isAdmin, statusFilter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 관리자는 모든 상태의 상품을 조회할 수 있음
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/admin/posts?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (postId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const response = await fetch(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: newStatus === 'ACTIVE'
            ? (language === 'ko' ? '상품이 활성화되었습니다' : '商品已激活')
            : (language === 'ko' ? '상품이 숨김 처리되었습니다' : '商品已隐藏'),
        });
        fetchPosts();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm(language === 'ko' ? '정말 삭제하시겠습니까?' : '确定要删除吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '상품이 삭제되었습니다' : '商品已删除',
        });
        fetchPosts();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || isLoading) return <LoadingPage />;

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.titleZh?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user.nickname.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: posts.length,
    active: posts.filter((p) => p.status === 'ACTIVE').length,
    soldOut: posts.filter((p) => p.status === 'SOLD_OUT').length,
    inactive: posts.filter((p) => p.status === 'INACTIVE').length,
    deleted: posts.filter((p) => p.status === 'DELETED').length,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {language === 'ko' ? '상품 관리' : '商品管理'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {language === 'ko'
            ? '플랫폼의 모든 상품을 관리합니다'
            : '管理平台所有商品'}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '전체' : '全部'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-600 mb-1">
                {language === 'ko' ? '판매중' : '销售中'}
              </p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">
                {language === 'ko' ? '품절' : '售罄'}
              </p>
              <p className="text-2xl font-bold text-gray-600">{stats.soldOut}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-yellow-600 mb-1">
                {language === 'ko' ? '숨김' : '隐藏'}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-red-600 mb-1">
                {language === 'ko' ? '삭제됨' : '已删除'}
              </p>
              <p className="text-2xl font-bold text-red-600">{stats.deleted}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={
                  language === 'ko'
                    ? '상품명, 판매자로 검색'
                    : '搜索商品名或卖家'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'ko' ? '전체' : '全部'}</option>
                <option value="ACTIVE">{language === 'ko' ? '판매중' : '销售中'}</option>
                <option value="SOLD_OUT">{language === 'ko' ? '품절' : '售罄'}</option>
                <option value="INACTIVE">{language === 'ko' ? '숨김' : '隐藏'}</option>
                <option value="DELETED">{language === 'ko' ? '삭제됨' : '已删除'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상품 목록 */}
      <Card>
        <CardContent className="pt-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {language === 'ko' ? '상품이 없습니다' : '暂无商品'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* 상품 이미지 */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {post.images?.[0] ? (
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={STATUS_CONFIG[post.status].color}>
                        {language === 'ko'
                          ? STATUS_CONFIG[post.status].label
                          : STATUS_CONFIG[post.status].labelZh}
                      </Badge>
                      <Badge variant="outline">
                        {post.postType === 'SELL'
                          ? language === 'ko' ? '판매' : '出售'
                          : language === 'ko' ? '구매요청' : '求购'}
                      </Badge>
                    </div>
                    <p className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {language === 'ko' ? post.title : post.titleZh || post.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={post.user.profileImage || undefined} />
                          <AvatarFallback>
                            {post.user.nickname.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.user.nickname}</span>
                      </div>
                      <span>₩{post.priceKRW.toLocaleString()}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {post.salesCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(post.createdAt, language)}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPostId(post.id);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Link href={`/posts/${post.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    {post.status !== 'DELETED' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(post.id, post.status)}
                        >
                          {post.status === 'ACTIVE' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결과 카운트 */}
      {filteredPosts.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {language === 'ko' ? '총' : '共'} {filteredPosts.length}{language === 'ko' ? '개' : '个'}
        </div>
      )}

      {/* 상품 상세 모달 */}
      <PostDetailModal
        postId={selectedPostId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPostId(null);
        }}
        onUpdate={fetchPosts}
      />
    </div>
  );
}
