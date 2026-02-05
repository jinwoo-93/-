'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, PlusSquare, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from 'next-auth/react';

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: t('nav.home'),
    },
    {
      href: '/categories',
      icon: Grid,
      label: t('nav.categories'),
    },
    {
      href: '/posts/create',
      icon: PlusSquare,
      label: t('nav.sell'),
      requireAuth: true,
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: t('nav.messages'),
      requireAuth: true,
    },
    {
      href: session ? '/mypage' : '/login',
      icon: User,
      label: session ? t('nav.mypage') : t('auth.login'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const href = item.requireAuth && !session ? '/login' : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
