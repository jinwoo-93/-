'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Search,
  Bell,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  Package,
  Heart,
  Clock,
  LogOut,
  Settings,
  Shield,
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
import { cn, type TradeDirection } from '@/lib/utils';
import LanguageSelector from './LanguageSelector';
import { signOut } from 'next-auth/react';

export function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useLanguage();
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { unreadNotifications } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('KR_TO_CN');

  // 스크롤 감지
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
    }
  };

  // 언어에 따른 카테고리
  const categories = language === 'ko'
    ? [
        { id: 'fashion', label: '패션', href: '/posts?category=fashion' },
        { id: 'electronics', label: '전자기기', href: '/posts?category=electronics' },
        { id: 'beauty', label: '뷰티', href: '/posts?category=beauty' },
        { id: 'food', label: '식품', href: '/posts?category=food' },
        { id: 'home', label: '생활', href: '/posts?category=home' },
        { id: 'baby', label: '유아', href: '/posts?category=baby' },
      ]
    : [
        { id: 'kbeauty', label: 'K-Beauty', href: '/posts?category=beauty' },
        { id: 'kfashion', label: 'K-Fashion', href: '/posts?category=fashion' },
        { id: 'kfood', label: 'K-Food', href: '/posts?category=food' },
        { id: 'kpop', label: 'K-Pop', href: '/posts?category=kpop' },
        { id: 'electronics', label: '电子', href: '/posts?category=electronics' },
        { id: 'home', label: '生活', href: '/posts?category=home' },
      ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-white transition-shadow duration-200',
          isScrolled && 'shadow-md'
        )}
      >
        {/* 상단 바: 언어/고객센터 (데스크톱) */}
        <div className="hidden md:block border-b bg-gray-50">
          <div className="container-app">
            <div className="flex h-8 items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                {/* 거래 방향 토글 */}
                <button
                  onClick={() => setTradeDirection(tradeDirection === 'KR_TO_CN' ? 'CN_TO_KR' : 'KR_TO_CN')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                    tradeDirection === 'KR_TO_CN'
                      ? 'bg-korea-100 text-korea-700 hover:bg-korea-200'
                      : 'bg-china-100 text-china-700 hover:bg-china-200'
                  )}
                >
                  {tradeDirection === 'KR_TO_CN' ? '🇰🇷→🇨🇳' : '🇨🇳→🇰🇷'}
                  <span className="hidden lg:inline">
                    {tradeDirection === 'KR_TO_CN'
                      ? (language === 'ko' ? '한국→중국' : '韩国→中国')
                      : (language === 'ko' ? '중국→한국' : '中国→韩国')
                    }
                  </span>
                </button>
                <span className="w-px h-3 bg-gray-300" />
                <Link href="/seller-guide" className="hover:text-foreground transition-colors">
                  {language === 'ko' ? '판매자 센터' : '卖家中心'}
                </Link>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  {language === 'ko' ? '고객센터' : '帮助中心'}
                </Link>
                <span className="w-px h-3 bg-gray-300" />
                <span className="flex items-center gap-1 text-escrow-600 font-medium">
                  <Shield className="w-3 h-3" />
                  {language === 'ko' ? '에스크로 안전거래' : '担保安全交易'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSelector variant="minimal" />
                <span className="w-px h-3 bg-gray-300" />
                {!session ? (
                  <>
                    <Link href="/login" className="hover:text-foreground font-medium transition-colors">
                      {language === 'ko' ? '로그인' : '登录'}
                    </Link>
                    <span className="w-px h-3 bg-gray-300" />
                    <Link href="/register" className="hover:text-foreground font-medium transition-colors">
                      {language === 'ko' ? '회원가입' : '注册'}
                    </Link>
                  </>
                ) : (
                  <Link href="/mypage" className="hover:text-foreground font-medium transition-colors">
                    {language === 'ko' ? '마이페이지' : '我的'}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 헤더 */}
        <div className="border-b">
          <div className="container-app">
            <div className="flex h-14 md:h-16 items-center gap-4">
              {/* 모바일 메뉴 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* 로고 */}
              <Link href="/" className="shrink-0 flex items-center gap-2">
                <Image
                  src="/images/logo.png"
                  alt="직구역구"
                  width={40}
                  height={40}
                  className="h-8 w-8 md:h-10 md:w-10"
                />
                <span className="hidden sm:block font-bold text-lg md:text-xl bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
                  직구역구
                </span>
              </Link>

              {/* 검색바 - 네이버 쇼핑 스타일 */}
              <form
                onSubmit={handleSearch}
                className="flex-1 max-w-xl mx-4 hidden md:block"
              >
                <div className={cn(
                  "relative flex items-center rounded-full border-2 transition-all duration-200",
                  isSearchFocused
                    ? "border-brand-orange shadow-lg shadow-orange-100"
                    : "border-gray-200 hover:border-brand-orange/50"
                )}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder={language === 'ko' ? '상품명, 브랜드, 카테고리 검색' : '搜索商品、品牌、分类'}
                    className="flex-1 h-11 px-5 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="h-9 px-5 mr-1 rounded-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium text-sm transition-colors flex items-center gap-1.5"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden lg:inline">{language === 'ko' ? '검색' : '搜索'}</span>
                  </button>
                </div>
              </form>

              {/* 우측 아이콘들 */}
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                {/* 모바일 검색 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => router.push('/search')}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* 장바구니 */}
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems > 0 && (
                      <span className="notification-badge">{cartItems > 99 ? '99+' : cartItems}</span>
                    )}
                  </Button>
                </Link>

                {session ? (
                  <>
                    {/* 알림 */}
                    <Link href="/notifications" className="hidden md:block">
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadNotifications > 0 && (
                          <span className="notification-badge">
                            {unreadNotifications > 99 ? '99+' : unreadNotifications}
                          </span>
                        )}
                      </Button>
                    </Link>

                    {/* 사용자 메뉴 (데스크톱) */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="hidden md:flex items-center gap-2 px-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={session.user?.image || ''} />
                            <AvatarFallback className="text-xs">
                              {session.user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href="/mypage" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {language === 'ko' ? '마이페이지' : '我的'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/mypage/orders" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {language === 'ko' ? '주문내역' : '订单'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/mypage/wishlist" className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            {language === 'ko' ? '찜목록' : '收藏'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/mypage/recently-viewed" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {language === 'ko' ? '최근 본 상품' : '最近浏览'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/mypage/settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {language === 'ko' ? '설정' : '设置'}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => signOut({ callbackUrl: '/' })}
                        >
                          <LogOut className="h-4 w-4" />
                          {language === 'ko' ? '로그아웃' : '退出'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리 바 (데스크톱) */}
        <div className="hidden md:block border-b bg-white">
          <div className="container-app">
            <nav className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
              <Link
                href="/categories"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-primary shrink-0"
              >
                <Menu className="h-4 w-4" />
                {language === 'ko' ? '전체 카테고리' : '全部分类'}
              </Link>
              <span className="w-px h-4 bg-border mx-1" />
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  {category.label}
                </Link>
              ))}
              <span className="w-px h-4 bg-border mx-1" />
              <Link
                href="/live"
                className="px-3 py-2 text-sm text-red-500 font-medium whitespace-nowrap flex items-center gap-1"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 모바일 사이드 메뉴 */}
      {isMobileMenuOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* 메뉴 패널 */}
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden animate-slide-up overflow-y-auto">
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              {session ? (
                <Link
                  href="/mypage"
                  className="flex items-center gap-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={session.user?.image || ''} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ko' ? '마이페이지' : '我的'}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button size="sm">{language === 'ko' ? '로그인' : '登录'}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm">
                      {language === 'ko' ? '회원가입' : '注册'}
                    </Button>
                  </Link>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 메뉴 아이템들 */}
            <div className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {language === 'ko' ? '카테고리' : '分类'}
              </p>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {language === 'ko' ? '바로가기' : '快捷链接'}
              </p>
              <div className="space-y-1">
                <Link
                  href="/posts/create"
                  className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ko' ? '상품 등록' : '发布商品'}
                </Link>
                <Link
                  href="/live"
                  className="block px-3 py-2 rounded-lg hover:bg-muted text-sm text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ko' ? '라이브 방송' : '直播'}
                </Link>
                <Link
                  href="/purchase-requests"
                  className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ko' ? '구매대행' : '代购'}
                </Link>
              </div>
            </div>

            <div className="border-t p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {language === 'ko' ? '고객지원' : '客服'}
              </p>
              <div className="space-y-1">
                <Link
                  href="/help"
                  className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {language === 'ko' ? '고객센터' : '帮助中心'}
                </Link>
                <Link
                  href="/faq"
                  className="block px-3 py-2 rounded-lg hover:bg-muted text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* 언어 선택 */}
            <div className="border-t p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
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
