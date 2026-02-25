'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BreadcrumbItem {
  labelKo: string;
  labelZh: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const { language } = useLanguage();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>{language === 'ko' ? '홈' : '首页'}</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {language === 'ko' ? item.labelKo : item.labelZh}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {language === 'ko' ? item.labelKo : item.labelZh}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
