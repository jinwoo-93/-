'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plane, Ship, Package, Truck, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface BannerSlide {
  id: number;
  bgGradient: string;
  titleKo: string;
  titleZh: string;
  subtitleKo: string;
  subtitleZh: string;
  ctaTextKo: string;
  ctaTextZh: string;
  ctaLink: string;
  icon: 'plane' | 'ship' | 'delivery' | 'global';
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    bgGradient: 'from-blue-600 via-blue-500 to-sky-400',
    titleKo: '전세계로 날아가는 K-상품',
    titleZh: '飞向全球的韩国商品',
    subtitleKo: '항공 특송으로 빠르고 안전하게 배송됩니다',
    subtitleZh: '航空特快，快速安全送达',
    ctaTextKo: '역직구 상품 보기',
    ctaTextZh: '查看代购商品',
    ctaLink: '/posts?direction=KR_TO_CN',
    icon: 'plane',
  },
  {
    id: 2,
    bgGradient: 'from-indigo-600 via-purple-500 to-pink-400',
    titleKo: '중국에서 한국으로',
    titleZh: '从中国到韩国',
    subtitleKo: '해상운송으로 대량 구매도 저렴하게',
    subtitleZh: '海运大批量采购更实惠',
    ctaTextKo: '직구 상품 보기',
    ctaTextZh: '查看直购商品',
    ctaLink: '/posts?direction=CN_TO_KR',
    icon: 'ship',
  },
  {
    id: 3,
    bgGradient: 'from-emerald-600 via-teal-500 to-cyan-400',
    titleKo: '안전한 에스크로 결제',
    titleZh: '安全托管支付',
    subtitleKo: '구매 확정 전까지 결제금이 안전하게 보관됩니다',
    subtitleZh: '确认收货前，货款安全托管',
    ctaTextKo: '자세히 알아보기',
    ctaTextZh: '了解更多',
    ctaLink: '/posts',
    icon: 'delivery',
  },
  {
    id: 4,
    bgGradient: 'from-orange-500 via-red-500 to-rose-500',
    titleKo: '한중 양방향 직거래',
    titleZh: '韩中双向直接交易',
    subtitleKo: '판매자와 구매자를 직접 연결합니다',
    subtitleZh: '直接连接卖家和买家',
    ctaTextKo: '지금 시작하기',
    ctaTextZh: '立即开始',
    ctaLink: '/posts/create',
    icon: 'global',
  },
];

const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  switch (icon) {
    case 'plane':
      return (
        <div className={cn("relative", className)}>
          <Plane className="w-32 h-32 md:w-48 md:h-48 text-white/20 transform -rotate-45" />
          <div className="absolute -bottom-4 -right-4 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full blur-xl" />
        </div>
      );
    case 'ship':
      return (
        <div className={cn("relative", className)}>
          <Ship className="w-32 h-32 md:w-48 md:h-48 text-white/20" />
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/10 blur-sm" />
        </div>
      );
    case 'delivery':
      return (
        <div className={cn("relative flex items-end gap-2", className)}>
          <Package className="w-20 h-20 md:w-28 md:h-28 text-white/20" />
          <Truck className="w-24 h-24 md:w-36 md:h-36 text-white/20" />
        </div>
      );
    case 'global':
      return (
        <div className={cn("relative", className)}>
          <Globe className="w-32 h-32 md:w-48 md:h-48 text-white/20 animate-pulse" />
          <Shield className="absolute bottom-0 right-0 w-16 h-16 md:w-20 md:h-20 text-white/15" />
        </div>
      );
    default:
      return null;
  }
};

export function HeroBanner() {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = bannerSlides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden">
      {/* 메인 배너 */}
      <div
        className={cn(
          "relative w-full h-[280px] md:h-[400px] transition-all duration-500 bg-gradient-to-r",
          slide.bgGradient
        )}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="container-app h-full flex items-center">
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
              {language === 'ko' ? slide.titleKo : slide.titleZh}
            </h2>
            <p className="text-base md:text-xl text-white/90 mb-4 md:mb-6 drop-shadow">
              {language === 'ko' ? slide.subtitleKo : slide.subtitleZh}
            </p>
            <Link href={slide.ctaLink}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg"
              >
                {language === 'ko' ? slide.ctaTextKo : slide.ctaTextZh}
              </Button>
            </Link>
          </div>

          {/* 아이콘 영역 */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <IconComponent icon={slide.icon} />
          </div>
        </div>

        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl" />
        </div>

        {/* 좌우 화살표 */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-lg transition-all hover:scale-105"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-lg transition-all hover:scale-105"
          aria-label="다음 슬라이드"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300",
              index === currentSlide
                ? "bg-white w-6 md:w-8"
                : "bg-white/50 hover:bg-white/70"
            )}
            aria-label={`슬라이드 ${index + 1}`}
          />
        ))}
      </div>

      {/* 슬라이드 카운터 */}
      <div className="absolute bottom-4 right-4 bg-white/90 text-gray-700 text-xs md:text-sm px-3 py-1 rounded-full shadow-sm font-medium">
        {currentSlide + 1} / {bannerSlides.length}
      </div>
    </div>
  );
}
