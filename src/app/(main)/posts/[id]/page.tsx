'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  Share2,
  MessageSquare,
  Star,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import WishlistButton from '@/components/product/WishlistButton';
import ShareButton from '@/components/common/ShareButton';
import FollowButton from '@/components/user/FollowButton';
import CustomsCalculator from '@/components/common/CustomsCalculator';
import ProductQA from '@/components/product/ProductQA';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import { useCartStore } from '@/stores/cartStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import { useToast } from '@/hooks/useToast';
import { formatRelativeTime } from '@/lib/utils';
import type { Post } from '@/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { format } = useCurrency();
  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addItem);
  const addToRecentlyViewed = useRecentlyViewedStore((state) => state.addPost);

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data);
        // 최근 본 상품에 추가
        addToRecentlyViewed({
          id: data.data.id,
          title: data.data.title,
          titleZh: data.data.titleZh,
          priceKRW: data.data.priceKRW,
          priceCNY: data.data.priceCNY,
          images: data.data.images,
          tradeDirection: data.data.tradeDirection,
        });
      } else {
        toast({ title: data.error.message, variant: 'destructive' });
        router.push('/posts');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (post) {
      addToCart(post, quantity);
      toast({ title: language === 'ko' ? '장바구니에 추가되었습니다' : '已添加到购物车' });
    }
  };

  const handleBuyNow = () => {
    if (post) {
      addToCart(post, quantity);
      router.push('/checkout');
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!post) return null;

  const title = language === 'zh' && post.titleZh ? post.titleZh : post.title;
  const description = language === 'zh' && post.descriptionZh ? post.descriptionZh : post.description;

  return (
    <div className="container-app py-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 이미지 갤러리 */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {post.images.length > 0 ? (
              <Image
                src={post.images[currentImageIndex]}
                alt={title}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="h-24 w-24 text-muted-foreground" />
              </div>
            )}

            {post.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? post.images.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === post.images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <Badge
              variant={post.tradeDirection === 'KR_TO_CN' ? 'korea' : 'china'}
              className="absolute top-4 left-4"
            >
              {post.tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
            </Badge>
          </div>

          {/* 썸네일 */}
          {post.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {post.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 ${
                    currentImageIndex === index
                      ? 'ring-2 ring-primary'
                      : 'opacity-70'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {/* 카테고리 */}
          {post.category && (
            <Link href={`/posts?category=${post.category.slug}`}>
              <Badge variant="secondary">
                {language === 'ko' ? post.category.nameKo : post.category.nameZh}
              </Badge>
            </Link>
          )}

          {/* 제목 */}
          <h1 className="text-2xl font-bold">{title}</h1>

          {/* 가격 */}
          <div className="text-3xl font-bold text-primary">
            {format(post.priceKRW, post.priceCNY)}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              {post.salesCount} {language === 'ko' ? '판매' : '销量'}
            </span>
            <span>{formatRelativeTime(post.createdAt, language)}</span>
          </div>

          {/* 수량 선택 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{t('post.quantity')}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuantity(Math.min(post.quantity, quantity + 1))
                }
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">
                ({post.quantity} {language === 'ko' ? '개 남음' : '件剩余'})
              </span>
            </div>
          </div>

          {/* 구매 버튼 */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleBuyNow}
              disabled={post.status !== 'ACTIVE'}
            >
              {t('post.buyNow')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleAddToCart}
              disabled={post.status !== 'ACTIVE'}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <WishlistButton
              postId={post.id}
              size="lg"
              variant="detail"
            />
            <ShareButton
              title={title}
              description={description}
              imageUrl={post.images[0]}
              size="lg"
            />
          </div>

          {/* 에스크로 안내 */}
          <Card className="bg-muted/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    {language === 'ko' ? '안전 결제' : '安全支付'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ko'
                      ? '결제 금액은 에스크로로 안전하게 보관되며, 구매 확정 후 판매자에게 정산됩니다.'
                      : '付款金额将安全托管，确认收货后结算给卖家。'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 관부가세 계산기 (중국→한국만 표시) */}
          {post.tradeDirection === 'CN_TO_KR' && (
            <CustomsCalculator
              productPriceKRW={post.priceKRW * quantity}
              category={post.category?.slug}
              quantity={quantity}
            />
          )}

          {/* 판매자 정보 */}
          {post.user && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('post.seller')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.user.profileImage || ''} />
                    <AvatarFallback>
                      {post.user.nickname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.user.nickname}</span>
                      {post.user.hasExcellentBadge && (
                        <Badge variant="excellent" className="text-xs">
                          {language === 'ko' ? '우수' : '优秀'}
                        </Badge>
                      )}
                      {post.user.isBusinessVerified && (
                        <Badge variant="business" className="text-xs">
                          {language === 'ko' ? '사업자' : '企业'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {post.user.averageRating?.toFixed(1) || '0.0'}
                      </span>
                      <span>
                        {post.user.totalSales} {language === 'ko' ? '거래' : '交易'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <FollowButton
                      userId={post.user.id}
                      size="sm"
                    />
                    <Link href={`/messages/${post.user.id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {t('post.contact')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 상품 설명 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{language === 'ko' ? '상품 설명' : '商品描述'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {description}
          </div>
        </CardContent>
      </Card>

      {/* 상품 Q&A */}
      <div className="mt-8">
        <ProductQA
          postId={post.id}
          sellerId={post.user?.id || ''}
        />
      </div>

      {/* 비슷한 상품 추천 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'ko' ? '비슷한 상품' : '相似商品'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductRecommendations
              type="similar"
              postId={post.id}
              limit={4}
              showTitle={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
