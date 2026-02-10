'use client';

import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { Shield, ShieldCheck } from 'lucide-react';

interface EscrowBadgeProps {
  variant?: 'filled' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function EscrowBadge({
  variant = 'filled',
  size = 'md',
  showIcon = true,
  className,
}: EscrowBadgeProps) {
  const { language } = useLanguage();

  const label = language === 'ko' ? '에스크로 안전거래' : '担保安全交易';
  const shortLabel = language === 'ko' ? '안전거래' : '安全交易';

  const sizeStyles = {
    sm: {
      container: 'text-xs px-2 py-0.5 gap-1',
      icon: 'w-3 h-3',
      useShortLabel: true,
    },
    md: {
      container: 'text-sm px-3 py-1 gap-1.5',
      icon: 'w-4 h-4',
      useShortLabel: false,
    },
    lg: {
      container: 'text-base px-4 py-1.5 gap-2',
      icon: 'w-5 h-5',
      useShortLabel: false,
    },
  };

  const variantStyles = {
    filled: 'bg-escrow-500 text-white border-escrow-500',
    outline: 'bg-white text-escrow-600 border-escrow-500 border-2',
    minimal: 'bg-escrow-50 text-escrow-700 border-escrow-200 border',
  };

  const styles = sizeStyles[size];
  const Icon = variant === 'filled' ? ShieldCheck : Shield;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        styles.container,
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <Icon className={styles.icon} />}
      <span>{styles.useShortLabel ? shortLabel : label}</span>
    </span>
  );
}
