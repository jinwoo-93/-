'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface BannerSlide {
  id: number;
  bg: string;
  bgImage?: string; // 배경 이미지 URL (선택)
  titleKo: string;
  titleZh: string;
  subtitleKo: string;
  subtitleZh: string;
  ctaTextKo: string;
  ctaTextZh: string;
  ctaLink: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 1,
    bg: 'from-black via-gray-900 to-gray-800',
    bgImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop', // 한국 도시 야경
    titleKo: 'K-상품을 전세계로',
    titleZh: '韩国商品走向世界',
    subtitleKo: '항공 특송으로 빠르고 안전하게',
    subtitleZh: '航空特快，快速安全',
    ctaTextKo: '역직구 보기',
    ctaTextZh: '查看代购',
    ctaLink: '/posts?direction=KR_TO_CN',
  },
  {
    id: 2,
    bg: 'from-[#EF6253] via-[#FF7A66] to-[#FF8F7A]',
    bgImage: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&auto=format&fit=crop', // 중국 풍경
    titleKo: '중국에서 한국으로',
    titleZh: '从中国到韩国',
    subtitleKo: '해상운송으로 대량 구매도 저렴하게',
    subtitleZh: '海运大批量采购更实惠',
    ctaTextKo: '직구 보기',
    ctaTextZh: '查看直购',
    ctaLink: '/posts?direction=CN_TO_KR',
  },
  {
    id: 3,
    bg: 'from-gray-900 via-gray-800 to-black',
    bgImage: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&auto=format&fit=crop', // 보안/결제 이미지
    titleKo: '에스크로 안전 결제',
    titleZh: '担保安全支付',
    subtitleKo: '구매 확정 전까지 결제금 안전 보관',
    subtitleZh: '确认收货前货款安全托管',
    ctaTextKo: '자세히 보기',
    ctaTextZh: '了解更多',
    ctaLink: '/posts',
  },
  {
    id: 4,
    bg: 'from-[#41B979] via-[#4EC985] to-[#5CD991]',
    bgImage: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=1200&auto=format&fit=crop', // 비즈니스/거래
    titleKo: '판매자와 직거래',
    titleZh: '与卖家直接交易',
    subtitleKo: '낮은 수수료, 높은 투명성',
    subtitleZh: '低手续费，高透明度',
    ctaTextKo: '시작하기',
    ctaTextZh: '立即开始',
    ctaLink: '/posts/create',
  },
];

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
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = bannerSlides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="relative w-full h-[200px] md:h-[320px] overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* 배경 그라디언트 + 이미지 */}
        <div className={cn('absolute inset-0 bg-gradient-to-r transition-all duration-500', slide.bg)} />
        {slide.bgImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{ backgroundImage: `url(${slide.bgImage})` }}
            />
            {/* 오버레이 (텍스트 가독성) */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}

        {/* 콘텐츠 */}
        <div className="relative container-app h-full flex flex-col justify-center z-10">
          <p className="text-[12px] md:text-[13px] text-white/60 font-bold uppercase tracking-widest mb-2">
            JIKGUYEOKGU
          </p>
          <h2 className="text-[24px] md:text-[40px] font-black text-white leading-tight mb-2">
            {language === 'ko' ? slide.titleKo : slide.titleZh}
          </h2>
          <p className="text-[14px] md:text-[16px] text-white/70 mb-5">
            {language === 'ko' ? slide.subtitleKo : slide.subtitleZh}
          </p>
          <Link
            href={slide.ctaLink}
            className="inline-flex items-center justify-center h-[40px] px-6 bg-white text-black text-[13px] font-bold hover:bg-gray-100 transition-colors w-fit"
          >
            {language === 'ko' ? slide.ctaTextKo : slide.ctaTextZh}
          </Link>
        </div>

        {/* 좌우 화살표 */}
        <button
          onClick={prevSlide}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label="이전"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label="다음"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-[2px] transition-all duration-300',
              index === currentSlide
                ? 'bg-white w-6'
                : 'bg-white/40 w-3 hover:bg-white/60'
            )}
            aria-label={`슬라이드 ${index + 1}`}
          />
        ))}
      </div>

      {/* 슬라이드 카운터 */}
      <div className="absolute bottom-3 right-4 text-[11px] text-white/50 font-bold">
        {currentSlide + 1} / {bannerSlides.length}
      </div>
    </div>
  );
}
