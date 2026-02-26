'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Search,
  Bell,
  ShoppingCart,
  Menu,
  X,
  User,
  Package,
  Heart,
  Clock,
  LogOut,
  Settings,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import LanguageSelector from './LanguageSelector';
import { signOut } from 'next-auth/react';
import { getSavedDirection, type TradeDirection } from './TradeDirectionModal';

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useLanguage();
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { unreadNotifications } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<TradeDirection | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 직구/역직구 현재 선택값 읽기 + 변경 이벤트 감지
  useEffect(() => {
    const updateDirection = () => {
      setTradeDirection(getSavedDirection());
    };
    updateDirection();
    // page.tsx에서 모달 선택 후 dispatchEvent로 갱신
    window.addEventListener('trade-direction-changed', updateDirection);
    return () => window.removeEventListener('trade-direction-changed', updateDirection);
  }, []);

  const handleOpenDirectionModal = () => {
    // sessionStorage 초기화 후 이벤트 발송 → page.tsx에서 모달 오픈
    sessionStorage.removeItem('jikguyeokgu_popup_shown');
    window.dispatchEvent(new Event('open-trade-direction-modal'));
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);

    if (value.trim().length > 1) {
      // 실제 API 호출 대신 간단한 인기 키워드 표시
      const keywords = language === 'ko'
        ? ['패션', '뷰티', '전자기기', 'K-뷰티', 'K-패션', '식품', '건강식품']
        : ['时尚', '美妆', '电子产品', 'K-Beauty', 'K-Fashion', '食品', '保健食品'];

      const filtered = keywords.filter(k =>
        k.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);

      setSearchSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const navTabs = language === 'ko'
    ? [
        { label: '소개', href: '/about' },
        { label: '역직구', href: '/posts?direction=KR_TO_CN' },
        { label: '직구', href: '/posts?direction=CN_TO_KR' },
        { label: '판매', href: '/posts/create' },
      ]
    : [
        { label: '关于', href: '/about' },
        { label: '代购', href: '/posts?direction=KR_TO_CN' },
        { label: '直购', href: '/posts?direction=CN_TO_KR' },
        { label: '出售', href: '/posts/create' },
      ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white transition-shadow duration-150',
          isScrolled && 'shadow-[0_1px_0_0_rgba(0,0,0,0.07)]'
        )}
      >
        {/* 상단 유틸리티 바 (데스크톱) */}
        <div className="hidden md:block border-b border-gray-100">
          <div className="container-app">
            <div className="flex h-8 items-center justify-end gap-4 text-[11px] text-gray-500">
              <LanguageSelector variant="minimal" />
              <span className="w-px h-3 bg-gray-200" />
              <Link href="/help" className="hover:text-black transition-colors">
                {language === 'ko' ? '고객센터' : '帮助中心'}
              </Link>
              <span className="w-px h-3 bg-gray-200" />
              <button
                onClick={handleOpenDirectionModal}
                className="hover:text-black transition-colors flex items-center gap-1"
              >
                <span>
                  {tradeDirection === 'KR_TO_CN'
                    ? (language === 'ko' ? '역직구' : '代购')
                    : (language === 'ko' ? '직구' : '直购')}
                </span>
                <span className="text-[10px]">
                  {tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
                </span>
              </button>
              <span className="w-px h-3 bg-gray-200" />
              {!session ? (
                <>
                  <Link href="/login" className="hover:text-black transition-colors">
                    {language === 'ko' ? '로그인' : '登录'}
                  </Link>
                  <span className="w-px h-3 bg-gray-200" />
                  <Link href="/register" className="hover:text-black transition-colors">
                    {language === 'ko' ? '회원가입' : '注册'}
                  </Link>
                </>
              ) : (
                <Link href="/mypage" className="hover:text-black transition-colors">
                  {language === 'ko' ? '마이페이지' : '我的'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 메인 헤더 */}
        <div className="border-b border-gray-100">
          <div className="container-app">
            <div className="flex h-[52px] items-center gap-6">
              {/* 로고 */}
              <Link href="/" className="shrink-0">
                <span className="text-[20px] font-black tracking-tight text-black">
                  직구역구
                </span>
              </Link>

              {/* 내비게이션 탭 (데스크톱) */}
              <nav className="hidden md:flex items-center gap-8 ml-4">
                {navTabs.map((tab) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="text-[15px] font-bold text-black hover:text-brand-orange transition-colors whitespace-nowrap"
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>

              {/* 검색바 (데스크톱) */}
              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-[400px] ml-auto relative"
              >
                <div className="relative flex items-center w-full h-[38px] bg-gray-100 rounded-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={language === 'ko' ? '상품 검색' : '搜索商品'}
                    className="flex-1 h-full px-3 bg-transparent text-[13px] text-black placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-full px-3 flex items-center justify-center"
                  >
                    <Search className="h-[18px] w-[18px] text-gray-500" />
                  </button>
                </div>

                {/* 자동완성 드롭다운 */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full px-4 py-2.5 text-left text-[13px] text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <Search className="h-3.5 w-3.5 text-gray-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* 우측 아이콘 */}
              <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                {/* 모바일 검색 */}
                <button
                  className="md:hidden p-1"
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-5 w-5 text-black" />
                </button>

                {/* 알림 */}
                {session && (
                  <Link href="/notifications" className="relative p-1 hidden md:block">
                    <Bell className="h-5 w-5 text-black" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold px-1">
                        {unreadNotifications > 99 ? '99+' : unreadNotifications}
                      </span>
                    )}
                  </Link>
                )}

                {/* 장바구니 */}
                <Link href="/cart" className="relative p-1">
                  <ShoppingCart className="h-5 w-5 text-black" />
                  {cartItems > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-brand-orange text-white text-[10px] font-bold px-1">
                      {cartItems > 99 ? '99+' : cartItems}
                    </span>
                  )}
                </Link>

                {/* 사용자 메뉴 (데스크톱) */}
                {session && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hidden md:flex items-center p-1">
                        <Avatar className="h-7 w-7 border border-gray-200">
                          <AvatarImage src={session.user?.image || ''} />
                          <AvatarFallback className="text-[11px] bg-gray-100 text-gray-600 font-bold">
                            {session.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-none border-gray-200">
                      <DropdownMenuItem asChild>
                        <Link href="/mypage" className="flex items-center gap-2 text-[13px]">
                          <User className="h-4 w-4" />
                          {language === 'ko' ? '마이페이지' : '我的'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mypage/orders" className="flex items-center gap-2 text-[13px]">
                          <Package className="h-4 w-4" />
                          {language === 'ko' ? '주문내역' : '订单'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mypage/wishlist" className="flex items-center gap-2 text-[13px]">
                          <Heart className="h-4 w-4" />
                          {language === 'ko' ? '찜목록' : '收藏'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mypage/recently-viewed" className="flex items-center gap-2 text-[13px]">
                          <Clock className="h-4 w-4" />
                          {language === 'ko' ? '최근 본 상품' : '最近浏览'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/mypage/settings" className="flex items-center gap-2 text-[13px]">
                          <Settings className="h-4 w-4" />
                          {language === 'ko' ? '설정' : '设置'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-[13px] text-red-500"
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        <LogOut className="h-4 w-4" />
                        {language === 'ko' ? '로그아웃' : '退出'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 md:hidden overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between h-[52px] px-5 border-b border-gray-100">
              {session ? (
                <Link
                  href="/mypage"
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback className="text-[11px] bg-gray-100 font-bold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[14px] font-bold text-black">
                    {session.user?.name || 'User'}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="text-[14px] font-bold text-black">
                      {language === 'ko' ? '로그인' : '登录'}
                    </span>
                  </Link>
                </div>
              )}
              <button
                className="p-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5 text-black" />
              </button>
            </div>

            {/* 메뉴 */}
            <div className="py-4">
              {navTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="block px-5 py-3 text-[15px] font-bold text-black"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-100 py-4">
              <Link
                href="/purchase-requests"
                className="block px-5 py-3 text-[14px] text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ko' ? '구매대행' : '代购'}
              </Link>
              <Link
                href="/help"
                className="block px-5 py-3 text-[14px] text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {language === 'ko' ? '고객센터' : '帮助中心'}
              </Link>
              <Link
                href="/faq"
                className="block px-5 py-3 text-[14px] text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
            </div>

            <div className="border-t border-gray-100 py-4 px-5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                {language === 'ko' ? '언어' : '语言'}
              </p>
              <LanguageSelector variant="full" />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
