'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Megaphone, ArrowLeft, AlertCircle, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface AdSlot {
  id: string;
  name: string;
  slotType: string;
  weekStart: string;
  weekEnd: string;
  currentHighestBid: number | null;
  minimumBid: number;
  bids: {
    id: string;
    bidAmount: number;
    user: {
      id: string;
      nickname: string;
    };
  }[];
}

export default function AdBidPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { format, currency } = useCurrency();
  const { toast } = useToast();

  const [slot, setSlot] = useState<AdSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [postId, setPostId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchSlot();
  }, [params.slotId, isAuthenticated, authLoading]);

  const fetchSlot = async () => {
    try {
      const response = await fetch(`/api/ads/slots/${params.slotId}`);
      const data = await response.json();
      if (data.success) {
        setSlot(data.data);
        // 최소 입찰가 설정
        const minBid = data.data.currentHighestBid
          ? data.data.currentHighestBid + 1000
          : data.data.minimumBid;
        setBidAmount(minBid.toString());
      }
    } catch (error) {
      console.error('Failed to fetch slot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount || parseInt(bidAmount) <= 0) {
      toast({
        title: language === 'ko' ? '입찰 금액을 입력해주세요' : '请输入出价金额',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseInt(bidAmount);
    const minRequired = slot?.currentHighestBid
      ? slot.currentHighestBid + 1000
      : slot?.minimumBid || 0;

    if (amount < minRequired) {
      toast({
        title: language === 'ko'
          ? `최소 ${format(minRequired, minRequired / 185)} 이상 입찰해야 합니다`
          : `最低出价需 ${format(minRequired, minRequired / 185)} 以上`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ads/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: params.slotId,
          bidAmount: amount,
          postId: postId || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '입찰이 완료되었습니다' : '竞拍成功',
        });
        router.push('/ads/my-bids');
      } else {
        toast({
          title: data.error.message,
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

  if (authLoading || isLoading) return <LoadingPage />;
  if (!slot) return null;

  const minBid = slot.currentHighestBid
    ? slot.currentHighestBid + 1000
    : slot.minimumBid;

  const slotTypeLabels: Record<string, { ko: string; zh: string }> = {
    PRODUCT: { ko: '상품 광고', zh: '商品广告' },
    SHIPPING: { ko: '배송사 광고', zh: '物流广告' },
    MAIN_BANNER: { ko: '메인 배너', zh: '主横幅' },
    CATEGORY_TOP: { ko: '카테고리 상단', zh: '分类顶部' },
    SEARCH_TOP: { ko: '검색 상단', zh: '搜索顶部' },
    SIDEBAR: { ko: '사이드바', zh: '侧边栏' },
  };

  return (
    <div className="container-app py-6 max-w-2xl">
      {/* 뒤로가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {language === 'ko' ? '뒤로가기' : '返回'}
      </button>

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">
          {language === 'ko' ? '광고 입찰하기' : '竞拍广告位'}
        </h1>
      </div>

      {/* 슬롯 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{slot.name}</CardTitle>
            <Badge variant="secondary">
              {slotTypeLabels[slot.slotType]?.[language === 'ko' ? 'ko' : 'zh'] || slot.slotType}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                {language === 'ko' ? '광고 기간' : '广告期间'}
              </p>
              <p className="font-medium">
                {formatDate(slot.weekStart, language)} ~ {formatDate(slot.weekEnd, language)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {language === 'ko' ? '현재 최고가' : '当前最高价'}
              </p>
              <p className="font-bold text-primary">
                {slot.currentHighestBid
                  ? format(slot.currentHighestBid, slot.currentHighestBid / 185)
                  : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 입찰 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {language === 'ko' ? '입찰 정보 입력' : '输入竞拍信息'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 입찰 금액 */}
            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '입찰 금액' : '出价金额'} *
              </label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min={minBid}
                  step={1000}
                  className="pr-12"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currency === 'KRW' ? '원' : '元'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko'
                  ? `최소 ${format(minBid, minBid / 185)} 이상 입찰해야 합니다`
                  : `最低出价需 ${format(minBid, minBid / 185)} 以上`}
              </p>
            </div>

            {/* 연결할 게시글 ID */}
            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '홍보할 게시글 ID' : '推广帖子ID'} ({language === 'ko' ? '선택' : '可选'})
              </label>
              <Input
                type="text"
                value={postId}
                onChange={(e) => setPostId(e.target.value)}
                placeholder={language === 'ko' ? '게시글 ID 입력' : '输入帖子ID'}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko'
                  ? '클릭 시 이동할 게시글을 연결합니다'
                  : '点击广告后跳转的帖子'}
              </p>
            </div>

            {/* 광고 이미지 URL */}
            <div>
              <label className="text-sm font-medium">
                {language === 'ko' ? '광고 이미지 URL' : '广告图片URL'} ({language === 'ko' ? '선택' : '可选'})
              </label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                <Button type="button" variant="outline" size="icon">
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko'
                  ? '권장 크기: 1200x400px (배너), 300x250px (사이드바)'
                  : '推荐尺寸: 1200x400px (横幅), 300x250px (侧边栏)'}
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium mb-1">
                  {language === 'ko' ? '입찰 전 확인사항' : '竞拍须知'}
                </p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • {language === 'ko'
                      ? '입찰 후에는 취소가 불가능합니다.'
                      : '竞拍后无法取消。'}
                  </li>
                  <li>
                    • {language === 'ko'
                      ? '낙찰 시 등록된 결제 수단으로 자동 결제됩니다.'
                      : '中标后将自动从注册的支付方式中扣款。'}
                  </li>
                  <li>
                    • {language === 'ko'
                      ? '광고 이미지가 없으면 게시글 이미지가 사용됩니다.'
                      : '如未上传广告图片，将使用帖子图片。'}
                  </li>
                </ul>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? (language === 'ko' ? '처리 중...' : '处理中...')
                : (language === 'ko' ? '입찰하기' : '确认竞拍')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
