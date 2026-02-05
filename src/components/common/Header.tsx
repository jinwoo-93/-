'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Search, Bell, Menu, ShoppingCart, Headphones, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { LanguageSwitch } from './LanguageSwitch';
import { CurrencySwitch } from './CurrencySwitch';
import { Logo } from './Logo';

export function Header() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const { openMobileMenu, openSearch, unreadNotifications } = useUIStore();
  const cartItems = useCartStore((state) => state.getTotalItems());

  // 카카오톡 채널 URL (실제 채널 ID로 교체 필요)
  const kakaoChannelUrl = 'https://pf.kakao.com/_xkxkxkx/chat';

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* 상단 고객센터 바 */}
      <div className="bg-gray-50 border-b">
        <div className="container-app">
          <div className="flex h-9 items-center justify-end gap-4 text-xs">
            <Link
              href="/help"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{language === 'ko' ? '고객센터' : '客服中心'}</span>
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </Link>
            <a
              href={kakaoChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#FEE500] text-[#3C1E1E] px-2 py-1 rounded hover:bg-[#F5DC00] transition-colors font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#3C1E1E">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.27 4.55 6.72-.2.73-.77 2.65-.88 3.06-.14.52.19.51.4.37.17-.11 2.69-1.81 3.78-2.55.7.1 1.42.15 2.15.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
              </svg>
              <span>{language === 'ko' ? '카카오톡 상담' : '카카오톡咨询'}</span>
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              {language === 'ko' ? '☎ 1588-0000' : '☎ 400-000-0000'}
            </span>
          </div>
        </div>
      </div>

      {/* 메인 헤더 */}
      <div className="border-b">
        <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={openMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo size="md" />
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              href="/posts?direction=KR_TO_CN"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <span>🇰🇷</span>
              <span>→</span>
              <span>🇨🇳</span>
              <span className="ml-1">{t('home.koreaToChina')}</span>
            </Link>
            <Link
              href="/posts?direction=CN_TO_KR"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
            >
              <span>🇨🇳</span>
              <span>→</span>
              <span>🇰🇷</span>
              <span className="ml-1">{t('home.chinaToKorea')}</span>
            </Link>
            <Link
              href="/categories"
              className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {t('nav.categories')}
            </Link>
          </nav>

          {/* 검색 및 사용자 메뉴 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSearch}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            <LanguageSwitch />
            <CurrencySwitch />

            {session ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/mypage">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm">{t('auth.login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}

export default Header;
