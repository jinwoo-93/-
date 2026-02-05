'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AlertTriangle, ThumbsUp, ThumbsDown, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { formatDate } from '@/lib/utils';

interface Dispute {
  id: string;
  reason: string;
  description: string;
  evidence: string[];
  status: string;
  votesForBuyer: number;
  votesForSeller: number;
  buyerRefundRate: number | null;
  createdAt: string;
  resolvedAt: string | null;
  order: {
    id: string;
    orderNumber: string;
    preShipPhotos: string[];
    buyer: {
      id: string;
      nickname: string;
      profileImage: string | null;
    };
    seller: {
      id: string;
      nickname: string;
      profileImage: string | null;
    };
  };
}

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchDispute();
  }, [params.id, isAuthenticated]);

  const fetchDispute = async () => {
    try {
      const response = await fetch(`/api/disputes/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setDispute(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dispute:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (voteFor: 'BUYER' | 'SELLER') => {
    setIsVoting(true);
    try {
      const response = await fetch(`/api/disputes/${params.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteFor, comment }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: language === 'ko' ? '투표가 완료되었습니다' : '投票成功' });
        fetchDispute();
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!dispute) return null;

  const totalVotes = dispute.votesForBuyer + dispute.votesForSeller;
  const buyerPercent = totalVotes > 0 ? (dispute.votesForBuyer / totalVotes) * 100 : 50;
  const sellerPercent = totalVotes > 0 ? (dispute.votesForSeller / totalVotes) * 100 : 50;

  const isParty =
    user?.id === dispute.order.buyer.id || user?.id === dispute.order.seller.id;

  return (
    <div className="container-app py-6 max-w-3xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h1 className="text-xl font-bold">{t('dispute.title')}</h1>
        </div>
        <Badge
          variant={
            dispute.status === 'RESOLVED'
              ? 'success'
              : dispute.status === 'VOTING'
              ? 'default'
              : 'secondary'
          }
        >
          {dispute.status === 'OPEN' && (language === 'ko' ? '접수됨' : '已受理')}
          {dispute.status === 'VOTING' && (language === 'ko' ? '투표 중' : '投票中')}
          {dispute.status === 'RESOLVED' && (language === 'ko' ? '해결됨' : '已解决')}
        </Badge>
      </div>

      {/* 분쟁 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t('dispute.reason')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">{dispute.reason}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {dispute.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(dispute.createdAt, language)}
          </p>
        </CardContent>
      </Card>

      {/* 당사자 정보 */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={dispute.order.buyer.profileImage || ''} />
                <AvatarFallback>
                  {dispute.order.buyer.nickname?.charAt(0) || 'B'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '구매자' : '买家'}
                </p>
                <p className="font-medium">{dispute.order.buyer.nickname}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={dispute.order.seller.profileImage || ''} />
                <AvatarFallback>
                  {dispute.order.seller.nickname?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ko' ? '판매자' : '卖家'}
                </p>
                <p className="font-medium">{dispute.order.seller.nickname}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 증거 이미지 */}
      {(dispute.evidence.length > 0 || dispute.order.preShipPhotos.length > 0) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t('dispute.evidence')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dispute.evidence.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ko' ? '신청자 제출 증거' : '申请人证据'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {dispute.evidence.map((img, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-md" />
                    ))}
                  </div>
                </div>
              )}
              {dispute.order.preShipPhotos.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === 'ko' ? '발송 전 사진' : '发货前照片'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {dispute.order.preShipPhotos.map((img, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 투표 현황 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t('dispute.votingProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${buyerPercent}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${sellerPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>
                  {language === 'ko' ? '구매자' : '买家'}: {dispute.votesForBuyer} (
                  {buyerPercent.toFixed(0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {language === 'ko' ? '판매자' : '卖家'}: {dispute.votesForSeller} (
                  {sellerPercent.toFixed(0)}%)
                </span>
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {language === 'ko' ? '총' : '共'} {totalVotes}{' '}
              {language === 'ko' ? '표' : '票'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 투표 버튼 (당사자가 아닌 경우만) */}
      {!isParty && dispute.status === 'VOTING' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dispute.vote')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              placeholder={language === 'ko' ? '의견을 남겨주세요 (선택)' : '留下您的意见（可选）'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-500 hover:bg-blue-50"
                onClick={() => handleVote('BUYER')}
                disabled={isVoting}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {t('dispute.voteForBuyer')}
              </Button>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => handleVote('SELLER')}
                disabled={isVoting}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {t('dispute.voteForSeller')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 해결 결과 */}
      {dispute.status === 'RESOLVED' && dispute.buyerRefundRate !== null && (
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-bold">{t('dispute.resolution')}</h3>
            </div>
            <p className="text-sm">
              {language === 'ko'
                ? `투표 결과에 따라 구매자에게 ${dispute.buyerRefundRate.toFixed(0)}%, 판매자에게 ${(100 - dispute.buyerRefundRate).toFixed(0)}%가 배분됩니다.`
                : `根据投票结果，买家获得${dispute.buyerRefundRate.toFixed(0)}%，卖家获得${(100 - dispute.buyerRefundRate).toFixed(0)}%。`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
