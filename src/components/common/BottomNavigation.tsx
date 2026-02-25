'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from 'next-auth/react';

interface NavItem {
  href: string;
  icon: typeof Home;
  labelKo: string;
  labelZh: string;
  requireAuth?: boolean;
}

export function BottomNavigation() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    {
      href: '/',
      icon: Home,
      labelKo: '홈',
      labelZh: '首页',
    },
    {
      href: '/search',
      icon: Search,
      labelKo: '검색',
      labelZh: '搜索',
    },
    {
      href: '/posts/create',
      icon: PlusCircle,
      labelKo: '등록',
      labelZh: '发布',
      requireAuth: true,
    },
    {
      href: '/mypage/wishlist',
      icon: Heart,
      labelKo: '찜',
      labelZh: '收藏',
      requireAuth: true,
    },
    {
      href: session ? '/mypage' : '/login',
      icon: User,
      labelKo: session ? '마이' : '로그인',
      labelZh: session ? '我的' : '登录',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-bottom">
      <div className="flex items-center justify-around h-[52px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const href = item.requireAuth && !session ? '/login' : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-[2px] transition-colors',
                active ? 'text-black' : 'text-gray-400'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              <span className={cn(
                'text-[10px]',
                active ? 'font-bold' : 'font-medium'
              )}>
                {language === 'ko' ? item.labelKo : item.labelZh}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
