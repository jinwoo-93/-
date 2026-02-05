'use client';

import { useState } from 'react';
import { MessageCircle, X, Headphones, HelpCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

export function FloatingKakaoChat() {
  const { language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  // 카카오톡 채널 URL (실제 채널 ID로 교체 필요)
  const kakaoChannelUrl = 'https://pf.kakao.com/_xkxkxkx/chat';

  return (
    <>
      {/* 플로팅 버튼 컨테이너 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end">
        {/* 확장된 메뉴 */}
        <div
          className={cn(
            "flex flex-col gap-2 mb-2 transition-all duration-300 origin-right",
            isExpanded
              ? "opacity-100 scale-100 translate-x-0"
              : "opacity-0 scale-95 translate-x-4 pointer-events-none"
          )}
        >
          {/* FAQ */}
          <Link
            href="/faq"
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-l-full pl-4 pr-3 py-2.5 shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group"
          >
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {language === 'ko' ? 'FAQ' : '常见问题'}
            </span>
          </Link>

          {/* 고객센터 */}
          <Link
            href="/help"
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-l-full pl-4 pr-3 py-2.5 shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group"
          >
            <Headphones className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {language === 'ko' ? '고객센터' : '客服中心'}
            </span>
          </Link>

          {/* 전화 문의 */}
          <a
            href="tel:1588-0000"
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-l-full pl-4 pr-3 py-2.5 shadow-lg hover:shadow-xl transition-all hover:bg-gray-50 group"
          >
            <Phone className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {language === 'ko' ? '1588-0000' : '400-000-0000'}
            </span>
          </a>

          {/* 카카오톡 1:1 상담 */}
          <a
            href={kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FEE500] rounded-l-full pl-4 pr-3 py-2.5 shadow-lg hover:shadow-xl transition-all hover:bg-[#F5DC00] group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.27 4.55 6.72-.2.73-.77 2.65-.88 3.06-.14.52.19.51.4.37.17-.11 2.69-1.81 3.78-2.55.7.1 1.42.15 2.15.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
            </svg>
            <span className="text-sm font-bold text-[#3C1E1E] whitespace-nowrap">
              {language === 'ko' ? '카카오톡 상담' : '카카오톡咨询'}
            </span>
          </a>
        </div>

        {/* 메인 토글 버튼 - 위아래로 움직이는 애니메이션 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 rounded-l-full pl-4 pr-3 py-3 shadow-lg transition-all duration-300",
            isExpanded
              ? "bg-gray-700 hover:bg-gray-800"
              : "bg-[#FEE500] hover:bg-[#F5DC00] animate-bounce-gentle"
          )}
        >
          {isExpanded ? (
            <>
              <X className="w-6 h-6 text-white" />
              <span className="text-sm font-bold text-white whitespace-nowrap">
                {language === 'ko' ? '닫기' : '关闭'}
              </span>
            </>
          ) : (
            <>
              <MessageCircle className="w-6 h-6 text-[#3C1E1E]" />
              <span className="text-sm font-bold text-[#3C1E1E] whitespace-nowrap">
                {language === 'ko' ? '상담하기' : '咨询'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 스타일 추가 - 부드러운 위아래 움직임 */}
      <style jsx global>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default FloatingKakaoChat;
