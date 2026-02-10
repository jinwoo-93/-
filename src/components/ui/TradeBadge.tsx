'use client';

import { getTradeInfo, type TradeDirection, cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface TradeBadgeProps {
  direction: TradeDirection;
  variant?: 'filled' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function TradeBadge({
  direction,
  variant = 'filled',
  size = 'md',
  showIcon = true,
  className,
}: TradeBadgeProps) {
  const { language } = useLanguage();
  const tradeInfo = getTradeInfo(direction);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const variantStyles = {
    filled: direction === 'KR_TO_CN'
      ? 'bg-korea-500 text-white border-korea-500'
      : 'bg-china-500 text-white border-china-500',
    outline: direction === 'KR_TO_CN'
      ? 'bg-white text-korea-500 border-korea-500 border-2'
      : 'bg-white text-china-500 border-china-500 border-2',
    minimal: direction === 'KR_TO_CN'
      ? 'bg-korea-50 text-korea-700 border-korea-200 border'
      : 'bg-china-50 text-china-700 border-china-200 border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {showIcon && <span>{tradeInfo.icon}</span>}
      <span>{tradeInfo.label[language]}</span>
    </span>
  );
}
