'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingCart,
  MessageSquare,
  Star,
  Shield,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import WishlistButton from '@/components/product/WishlistButton';
import ShareButton from '@/components/common/ShareButton';
import FollowButton from '@/components/user/FollowButton';
import CustomsCalculator from '@/components/common/CustomsCalculator';
import ProductQA from '@/components/product/ProductQA';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import ShippingInfo from '@/components/product/ShippingInfo';
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
        <div className="space-y-3">
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {post.images.length > 0 ? (
              <Image
                src={post.images[currentImageIndex]}
                alt={title}
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="h-24 w-24 text-gray-300" />
              </div>
            )}

            {post.images.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === 0 ? post.images.length - 1 : prev - 1
                    )
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev === post.images.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 text-[11px] font-bold text-white bg-black">
                {post.tradeDirection === 'KR_TO_CN' ? 'KR → CN' : 'CN → KR'}
              </span>
            </div>
          </div>

          {post.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {post.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-[60px] h-[60px] overflow-hidden flex-shrink-0 border-2 ${
                    currentImageIndex === index
                      ? 'border-black'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  } transition-all`}
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
        <div className="space-y-5">
          {post.category && (
            <Link href={`/posts?category=${post.category.slug}`}>
              <span className="text-[12px] font-bold text-gray-400 hover:text-black transition-colors">
                {language === 'ko' ? post.category.nameKo : post.category.nameZh}
              </span>
            </Link>
          )}

          <h1 className="text-[20px] font-black text-black leading-tight">{title}</h1>

          <div className="text-[28px] font-black text-black">
            {format(post.priceKRW, post.priceCNY)}
          </div>

          <div className="flex items-center gap-4 text-[12px] text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              {post.salesCount} {language === 'ko' ? '판매' : '销量'}
            </span>
            <span>{formatRelativeTime(post.createdAt, language)}</span>
          </div>

          <div className="border-t border-gray-100" />

          {/* 수량 */}
          <div className="flex items-center gap-4">
            <span className="text-[13px] font-bold text-black">{t('post.quantity')}</span>
            <div className="flex items-center">
              <button
                className="w-8 h-8 border border-gray-200 flex items-center justify-center text-[14px] hover:border-black transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="w-10 h-8 border-y border-gray-200 flex items-center justify-center text-[13px] font-bold">
                {quantity}
              </span>
              <button
                className="w-8 h-8 border border-gray-200 flex items-center justify-center text-[14px] hover:border-black transition-colors"
                onClick={() => setQuantity(Math.min(post.quantity, quantity + 1))}
              >
                +
              </button>
              <span className="ml-3 text-[12px] text-gray-400">
                ({post.quantity} {language === 'ko' ? '개 남음' : '件剩余'})
              </span>
            </div>
          </div>

          {/* 구매 버튼 */}
          <div className="flex gap-2">
            <button
              className="flex-1 h-[52px] bg-black text-white text-[15px] font-bold hover:bg-gray-900 disabled:opacity-40 transition-colors"
              onClick={handleBuyNow}
              disabled={post.status !== 'ACTIVE'}
            >
              {t('post.buyNow')}
            </button>
            <button
              className="w-[52px] h-[52px] border border-gray-200 flex items-center justify-center hover:border-black transition-colors"
              onClick={handleAddToCart}
              disabled={post.status !== 'ACTIVE'}
            >
              <ShoppingCart className="h-5 w-5 text-black" />
            </button>
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

          {/* 에스크로 */}
          <div className="border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-escrow-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-black">
                  {language === 'ko' ? '에스크로 안전 결제' : '担保安全支付'}
                </p>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {language === 'ko'
                    ? '결제 금액은 에스크로로 안전하게 보관되며, 구매 확정 후 판매자에게 정산됩니다.'
                    : '付款金额将安全托管，确认收货后结算给卖家。'}
                </p>
              </div>
            </div>
          </div>

          {/* 배송 정보 */}
          {post.postType === 'SELL' && (post as any).shippingCompany && (
            <div className="border border-gray-200 p-4">
              <h3 className="text-[13px] font-bold text-black mb-3">
                {language === 'ko' ? '배송 정보' : '配送信息'}
              </h3>
              <ShippingInfo
                shippingCompany={(post as any).shippingCompany}
                shippingFeeType={(post as any).shippingFeeType}
                shippingFeeAmount={(post as any).shippingFeeAmount}
                freeShippingThreshold={(post as any).freeShippingThreshold}
                language={language}
              />
            </div>
          )}

          {/* 관부가세 */}
          {post.tradeDirection === 'CN_TO_KR' && (
            <CustomsCalculator
              productPriceKRW={post.priceKRW * quantity}
              category={post.category?.slug}
              quantity={quantity}
            />
          )}

          {/* 판매자 */}
          {post.user && (
            <div className="border border-gray-200 p-4">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                {t('post.seller')}
              </p>
              <div className="flex items-center gap-4">
                <Avatar className="h-11 w-11 border border-gray-200">
                  <AvatarImage src={post.user.profileImage || ''} />
                  <AvatarFallback className="text-[13px] font-bold bg-gray-100">
                    {post.user.nickname?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-black">{post.user.nickname}</span>
                    {post.user.hasExcellentBadge && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-black text-white font-bold">
                        {language === 'ko' ? '우수' : '优秀'}
                      </span>
                    )}
                    {post.user.isBusinessVerified && (
                      <span className="text-[10px] px-1.5 py-0.5 border border-gray-300 text-gray-600 font-bold">
                        {language === 'ko' ? '사업자' : '企业'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-gray-400 mt-0.5">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {post.user.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span>
                      {post.user.totalSales} {language === 'ko' ? '거래' : '交易'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <FollowButton userId={post.user.id} size="sm" />
                  <Link href={`/messages/${post.user.id}`}>
                    <button className="h-8 px-3 border border-gray-200 text-[12px] font-bold text-black flex items-center gap-1 hover:border-black transition-colors">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {t('post.contact')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상품 설명 */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-[16px] font-black text-black mb-4">
          {language === 'ko' ? '상품 설명' : '商品描述'}
        </h2>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[14px] text-gray-700 leading-relaxed">
          {description}
        </div>
      </div>

      {/* Q&A */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <ProductQA
          postId={post.id}
          sellerId={post.user?.id || ''}
        />
      </div>

      {/* 비슷한 상품 */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-[16px] font-black text-black mb-4">
          {language === 'ko' ? '비슷한 상품' : '相似商品'}
        </h2>
        <ProductRecommendations
          type="similar"
          postId={post.id}
          limit={4}
          showTitle={false}
        />
      </div>
    </div>
  );
}
