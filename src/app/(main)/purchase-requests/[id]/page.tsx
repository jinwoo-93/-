'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  ArrowLeft,
  Package,
  ExternalLink,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  Star,
  Check,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime } from '@/lib/utils';

interface Offer {
  id: string;
  sellerId: string;
  priceKRW: number;
  priceCNY: number;
  shippingFeeKRW: number;
  shippingFeeCNY: number;
  estimatedDays: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    profileImage?: string;
    hasExcellentBadge: boolean;
    isBusinessVerified: boolean;
    averageRating: number;
    totalSales: number;
  };
}

interface PurchaseRequest {
  id: string;
  requesterId: string;
  productName: string;
  productNameZh?: string;
  productUrl?: string;
  productImage?: string;
  estimatedPrice?: number;
  quantity: number;
  description?: string;
  maxBudget?: number;
  deadline?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  selectedOfferId?: string;
  createdAt: string;
  requester: {
    id: string;
    nickname: string;
    profileImage?: string;
  };
  offers: Offer[];
}

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);

  // 제안 폼
  const [offerPrice, setOfferPrice] = useState('');
  const [offerShipping, setOfferShipping] = useState('');
  const [offerDays, setOfferDays] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/purchase-requests/${params.id}`);
      const data = await res.json();

      if (data.success) {
        setRequest(data.data);
      } else {
        router.push('/purchase-requests');
      }
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offerPrice || !offerDays) {
      toast({
        title: language === 'ko' ? '가격과 예상 소요일을 입력해주세요' : '请输入价格和预计天数',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/purchase-requests/${params.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceKRW: parseInt(offerPrice),
          shippingFeeKRW: parseInt(offerShipping) || 0,
          estimatedDays: parseInt(offerDays),
          message: offerMessage || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '제안이 등록되었습니다' : '报价已提交',
        });
        setShowOfferForm(false);
        fetchRequest();
      } else {
        toast({
          title: data.error?.message || '오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOffer = async (offerId: string) => {
    if (!confirm(language === 'ko' ? '이 제안을 선택하시겠습니까?' : '确定选择此报价吗？')) {
      return;
    }

    try {
      const res = await fetch(`/api/purchase-requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'selectOffer', offerId }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: language === 'ko' ? '제안이 선택되었습니다' : '已选择此报价',
        });
        fetchRequest();
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-green-100 text-green-700">{language === 'ko' ? '모집 중' : '招募中'}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-700">{language === 'ko' ? '진행 중' : '进行中'}</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">{language === 'ko' ? '완료' : '已完成'}</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">{language === 'ko' ? '취소' : '已取消'}</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!request) return null;

  const isOwner = session?.user?.id === request.requesterId;
  const hasOffered = request.offers.some((o) => o.sellerId === session?.user?.id);
  const canOffer = session?.user?.id && !isOwner && !hasOffered && request.status === 'OPEN';

  const title = language === 'zh' && request.productNameZh ? request.productNameZh : request.productName;

  return (
    <div className="container-app py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">
          {language === 'ko' ? '구매대행 요청' : '代购请求'}
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 요청 상세 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* 이미지 */}
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {request.productImage ? (
                    <Image
                      src={request.productImage}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    {request.estimatedPrice && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {language === 'ko' ? '예상 ' : '预计 '}₩{request.estimatedPrice.toLocaleString()}
                      </span>
                    )}
                    {request.maxBudget && (
                      <span className="flex items-center gap-1">
                        {language === 'ko' ? '예산 ' : '预算 '}₩{request.maxBudget.toLocaleString()}
                      </span>
                    )}
                    <span>{request.quantity}{language === 'ko' ? '개' : '件'}</span>
                    {request.deadline && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {request.productUrl && (
                    <a
                      href={request.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {language === 'ko' ? '상품 링크 보기' : '查看商品链接'}
                    </a>
                  )}
                </div>
              </div>

              {request.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm whitespace-pre-wrap">{request.description}</p>
                </div>
              )}

              {/* 요청자 */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={request.requester.profileImage || ''} />
                    <AvatarFallback>{request.requester.nickname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{request.requester.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(request.createdAt), language)}
                    </p>
                  </div>
                </div>

                {canOffer && (
                  <Button onClick={() => setShowOfferForm(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    {language === 'ko' ? '제안하기' : '提交报价'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 제안 폼 */}
          {showOfferForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {language === 'ko' ? '제안 작성' : '提交报价'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOffer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ko' ? '상품 가격 (원)' : '商品价格 (韩元)'} *</Label>
                      <Input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ko' ? '배송비 (원)' : '运费 (韩元)'}</Label>
                      <Input
                        type="number"
                        value={offerShipping}
                        onChange={(e) => setOfferShipping(e.target.value)}
                        placeholder="0"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{language === 'ko' ? '예상 소요일' : '预计天数'} *</Label>
                    <Input
                      type="number"
                      value={offerDays}
                      onChange={(e) => setOfferDays(e.target.value)}
                      placeholder="7"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ko' ? '메시지' : '留言'}</Label>
                    <Textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder={language === 'ko' ? '요청자에게 전달할 메시지' : '给买家的留言'}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowOfferForm(false)}>
                      {language === 'ko' ? '취소' : '取消'}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {language === 'ko' ? '제안 등록' : '提交报价'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 제안 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {language === 'ko' ? '받은 제안' : '收到的报价'} ({request.offers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {request.offers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{language === 'ko' ? '아직 받은 제안이 없습니다' : '暂无报价'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {request.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`p-4 rounded-lg border ${
                        offer.status === 'ACCEPTED'
                          ? 'border-green-500 bg-green-50'
                          : offer.status === 'REJECTED'
                          ? 'opacity-50'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={offer.seller.profileImage || ''} />
                            <AvatarFallback>{offer.seller.nickname?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{offer.seller.nickname}</span>
                              {offer.seller.hasExcellentBadge && (
                                <Badge variant="excellent" className="text-[10px]">
                                  {language === 'ko' ? '우수' : '优'}
                                </Badge>
                              )}
                              {offer.status === 'ACCEPTED' && (
                                <Badge className="bg-green-500 text-white text-[10px]">
                                  <Check className="h-3 w-3 mr-0.5" />
                                  {language === 'ko' ? '선택됨' : '已选择'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {offer.seller.averageRating.toFixed(1)}
                              </span>
                              <span>{offer.seller.totalSales} {language === 'ko' ? '거래' : '交易'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ₩{(offer.priceKRW + offer.shippingFeeKRW).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {language === 'ko' ? '상품 ' : '商品 '}₩{offer.priceKRW.toLocaleString()}
                            {offer.shippingFeeKRW > 0 && ` + ${language === 'ko' ? '배송 ' : '运费 '}₩${offer.shippingFeeKRW.toLocaleString()}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {offer.estimatedDays}{language === 'ko' ? '일 소요' : '天'}
                        </span>
                        <span>{formatRelativeTime(new Date(offer.createdAt), language)}</span>
                      </div>

                      {offer.message && (
                        <p className="mt-3 text-sm p-3 bg-muted rounded">
                          {offer.message}
                        </p>
                      )}

                      {isOwner && offer.status === 'PENDING' && request.status === 'OPEN' && (
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" onClick={() => handleSelectOffer(offer.id)}>
                            {language === 'ko' ? '이 제안 선택' : '选择此报价'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">
                {language === 'ko' ? '요청 요약' : '请求摘要'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ko' ? '상태' : '状态'}</span>
                  {getStatusBadge(request.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ko' ? '수량' : '数量'}</span>
                  <span>{request.quantity}{language === 'ko' ? '개' : '件'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === 'ko' ? '제안' : '报价'}</span>
                  <span>{request.offers.length}{language === 'ko' ? '개' : '个'}</span>
                </div>
                {request.maxBudget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === 'ko' ? '예산' : '预算'}</span>
                    <span>₩{request.maxBudget.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {hasOffered && (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">
                  {language === 'ko' ? '이미 제안을 등록했습니다' : '您已提交过报价'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
