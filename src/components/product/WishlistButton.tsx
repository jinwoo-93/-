'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
  postId: string;
  initialWishlisted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'detail';
  className?: string;
  onToggle?: (isWishlisted: boolean) => void;
}

export default function WishlistButton({
  postId,
  initialWishlisted = false,
  size = 'md',
  variant = 'default',
  className,
  onToggle,
}: WishlistButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 초기 상태 체크
  useEffect(() => {
    if (status === 'authenticated' && !initialWishlisted) {
      checkWishlistStatus();
    }
  }, [status, postId]);

  const checkWishlistStatus = async () => {
    try {
      const res = await fetch(`/api/wishlist/check?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.data?.isWishlisted || false);
      }
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      router.push('/auth/login');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setIsAnimating(true);

    try {
      if (isWishlisted) {
        // 찜 해제
        const res = await fetch(`/api/wishlist?postId=${postId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsWishlisted(false);
          onToggle?.(false);
        }
      } else {
        // 찜 추가
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });
        if (res.ok) {
          setIsWishlisted(true);
          onToggle?.(true);
        } else {
          const data = await res.json();
          if (data.error?.code === 'FORBIDDEN') {
            alert('자신의 상품은 찜할 수 없습니다.');
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isWishlisted, isLoading, status, postId, router, onToggle]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const variantClasses = {
    default: cn(
      'rounded-full flex items-center justify-center transition-all duration-200',
      isWishlisted
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500',
      'shadow-md hover:shadow-lg'
    ),
    card: cn(
      'absolute top-2 right-2 rounded-full flex items-center justify-center transition-all duration-200',
      isWishlisted
        ? 'bg-red-500 text-white'
        : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500',
      'shadow-sm'
    ),
    detail: cn(
      'rounded-lg flex items-center justify-center gap-2 px-4 py-2 font-medium transition-all duration-200',
      isWishlisted
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    ),
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        variant !== 'detail' && sizeClasses[size],
        variantClasses[variant],
        isAnimating && 'scale-110',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      title={isWishlisted ? '찜 해제' : '찜하기'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          isWishlisted && 'fill-current',
          isAnimating && 'animate-pulse'
        )}
      />
      {variant === 'detail' && (
        <span>{isWishlisted ? '찜 해제' : '찜하기'}</span>
      )}
    </button>
  );
}
