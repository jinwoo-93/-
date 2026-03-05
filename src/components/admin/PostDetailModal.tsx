'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Package,
  User,
  Eye,
  EyeOff,
  Trash2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface PostDetailModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const STATUS_CONFIG = {
  ACTIVE: { label: '판매중', color: 'bg-green-100 text-green-800' },
  SOLD_OUT: { label: '품절', color: 'bg-gray-100 text-gray-800' },
  INACTIVE: { label: '숨김', color: 'bg-yellow-100 text-yellow-800' },
  DELETED: { label: '삭제됨', color: 'bg-red-100 text-red-800' },
};

export function PostDetailModal({
  postId,
  isOpen,
  onClose,
  onUpdate,
}: PostDetailModalProps) {
  const { language } = useLanguage();
  const [postData, setPostData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (postId && isOpen) {
      fetchPostDetail();
    }
  }, [postId, isOpen]);

  const fetchPostDetail = async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`);
      const data = await res.json();
      if (data.success) {
        setPostData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch post detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!postId) return;

    const confirmMessage =
      newStatus === 'ACTIVE' ? '상품을 활성화하시겠습니까?' :
      newStatus === 'INACTIVE' ? '상품을 숨김 처리하시겠습니까?' :
      newStatus === 'DELETED' ? '상품을 삭제하시겠습니까?' :
      '상태를 변경하시겠습니까?';

    if (!confirm(confirmMessage)) return;

    if (newStatus === 'DELETED' && !deleteReason) {
      alert('삭제 사유를 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const body: any = { status: newStatus };
      if (newStatus === 'DELETED' && deleteReason) {
        body.deleteReason = deleteReason;
      }

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert('상태가 변경되었습니다.');
        fetchPostDetail();
        onUpdate?.();
      } else {
        alert('상태 변경 실패: ' + data.error.message);
      }
    } catch (error) {
      console.error('Failed to update post status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number, currency: 'KRW' | 'CNY') => {
    if (currency === 'KRW') {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
      }).format(amount);
    } else {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY',
      }).format(amount);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>상품 상세 정보</DialogTitle>
          <DialogDescription>
            상품 ID: {postData?.id || '-'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : postData ? (
          <div className="space-y-6">
            {/* 상태 및 빠른 액션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>상품 상태</span>
                  <Badge className={STATUS_CONFIG[postData.status as keyof typeof STATUS_CONFIG]?.color || ''}>
                    {STATUS_CONFIG[postData.status as keyof typeof STATUS_CONFIG]?.label || postData.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {postData.status !== 'ACTIVE' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('ACTIVE')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      활성화
                    </Button>
                  )}
                  {postData.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange('INACTIVE')}
                      disabled={isUpdating}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      숨김 처리
                    </Button>
                  )}
                  {postData.status !== 'DELETED' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt('삭제 사유를 입력해주세요:');
                        if (reason) {
                          setDeleteReason(reason);
                          handleStatusChange('DELETED');
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 상품 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  상품 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{postData.title}</h3>
                  {postData.titleZh && (
                    <p className="text-gray-600">{postData.titleZh}</p>
                  )}
                </div>

                {/* 이미지 갤러리 */}
                {postData.images && postData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {postData.images.map((img: string, idx: number) => (
                      <div key={idx} className="relative w-full h-24">
                        <Image
                          src={img}
                          alt={`상품 이미지 ${idx + 1}`}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">카테고리: </span>
                    <span className="font-medium">
                      {language === 'ko' ? postData.category.nameKo : postData.category.nameZh}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">상품 유형: </span>
                    <span className="font-medium">
                      {postData.postType === 'SELL' ? '판매' : '구매'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">거래 방향: </span>
                    <span className="font-medium">
                      {postData.tradeDirection === 'KR_TO_CN' ? '한국 → 중국' : '중국 → 한국'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">재고 수량: </span>
                    <span className="font-medium">{postData.quantity}개</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">상품 설명</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {postData.description}
                  </p>
                  {postData.descriptionZh && (
                    <>
                      <p className="text-sm font-medium mt-4 mb-2">상품 설명 (중국어)</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {postData.descriptionZh}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 가격 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  가격 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">한화 (KRW)</span>
                  <span className="font-bold text-lg">{formatCurrency(postData.priceKRW, 'KRW')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">위안화 (CNY)</span>
                  <span className="font-bold text-lg">{formatCurrency(postData.priceCNY, 'CNY')}</span>
                </div>
              </CardContent>
            </Card>

            {/* 판매자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  판매자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">닉네임</span>
                  <span className="font-medium">{postData.user.nickname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">이메일</span>
                  <span className="font-medium">{postData.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">국가</span>
                  <span className="font-medium">
                    {postData.user.country === 'KR' ? '🇰🇷 한국' : '🇨🇳 중국'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  통계
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">조회수</p>
                  <p className="text-2xl font-bold">{postData.viewCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">판매 수</p>
                  <p className="text-2xl font-bold">{postData.salesCount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">재주문율</p>
                  <p className="text-2xl font-bold">{(postData.reorderRate * 100).toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>

            {/* 등록 일시 */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">등록일시</span>
                  <span>{formatDate(postData.createdAt, language)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">수정일시</span>
                  <span>{formatDate(postData.updatedAt, language)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">상품 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
