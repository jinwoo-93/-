'use client';

import { getUserBadge, type UserBadgeType, cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface UserBadgeProps {
  type: UserBadgeType;
  variant?: 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function UserBadge({
  type,
  variant = 'filled',
  size = 'md',
  showIcon = true,
  className,
}: UserBadgeProps) {
  const { language } = useLanguage();
  const badgeInfo = getUserBadge(type);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const getVariantStyles = () => {
    if (variant === 'minimal') {
      switch (type) {
        case 'excellent':
          return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        case 'business':
          return 'bg-blue-50 text-blue-700 border border-blue-200';
        case 'top':
          return 'bg-purple-50 text-purple-700 border border-purple-200';
        case 'new':
          return 'bg-green-50 text-green-700 border border-green-200';
        case 'verified':
          return 'bg-teal-50 text-teal-700 border border-teal-200';
        default:
          return 'bg-gray-50 text-gray-700 border border-gray-200';
      }
    }

    // filled variant
    return cn(badgeInfo.bgColor, badgeInfo.textColor);
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        sizeStyles[size],
        getVariantStyles(),
        className
      )}
    >
      {showIcon && <span>{badgeInfo.icon}</span>}
      <span>{badgeInfo.label[language]}</span>
    </span>
  );
}
