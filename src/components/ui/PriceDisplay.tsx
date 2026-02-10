'use client';

import { formatPrice, convertCurrency, cn } from '@/lib/utils';

interface PriceDisplayProps {
  priceKRW: number;
  priceCNY?: number;
  exchangeRate?: number;
  originalPriceKRW?: number;
  discountPercent?: number;
  showBothCurrencies?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  priceKRW,
  priceCNY,
  exchangeRate = 0.0054,
  originalPriceKRW,
  discountPercent,
  showBothCurrencies = true,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const calculatedCNY = priceCNY ?? Math.round(priceKRW * exchangeRate * 100) / 100;

  const sizeStyles = {
    sm: {
      current: 'text-sm font-semibold',
      secondary: 'text-xs',
      original: 'text-xs',
      discount: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      current: 'text-lg font-bold',
      secondary: 'text-sm',
      original: 'text-sm',
      discount: 'text-xs px-2 py-0.5',
    },
    lg: {
      current: 'text-2xl font-bold',
      secondary: 'text-base',
      original: 'text-base',
      discount: 'text-sm px-2.5 py-1',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* 할인율 & 원래 가격 */}
      {(discountPercent || originalPriceKRW) && (
        <div className="flex items-center gap-2">
          {discountPercent && (
            <span className={cn(
              'inline-flex items-center rounded font-bold text-white bg-red-500',
              styles.discount
            )}>
              {discountPercent}%
            </span>
          )}
          {originalPriceKRW && (
            <span className={cn('text-gray-400 line-through', styles.original)}>
              {formatPrice(originalPriceKRW, 'KRW')}
            </span>
          )}
        </div>
      )}

      {/* 현재 가격 (한국 원화) */}
      <div className="flex items-baseline gap-2">
        <span className={cn('text-brand-orange', styles.current)}>
          {formatPrice(priceKRW, 'KRW')}
        </span>
      </div>

      {/* 중국 위안화 (선택적) */}
      {showBothCurrencies && (
        <span className={cn('text-gray-500', styles.secondary)}>
          ≈ {formatPrice(calculatedCNY, 'CNY')}
        </span>
      )}
    </div>
  );
}
