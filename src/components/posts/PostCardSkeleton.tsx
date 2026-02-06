'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PostCardSkeletonProps {
  variant?: 'default' | 'compact' | 'horizontal';
}

export function PostCardSkeleton({ variant = 'default' }: PostCardSkeletonProps) {
  // 수평 레이아웃 스켈레톤
  if (variant === 'horizontal') {
    return (
      <div className="flex gap-4 p-4 bg-card rounded-lg">
        <Skeleton className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-lg" />
        <div className="flex-1 min-w-0 flex flex-col">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20 mb-4" />
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 컴팩트 레이아웃 스켈레톤
  if (variant === 'compact') {
    return (
      <div className="product-card">
        <Skeleton className="aspect-square w-full" />
        <div className="p-2">
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  // 기본 레이아웃 스켈레톤
  return (
    <div className="product-card h-full">
      {/* 이미지 영역 */}
      <Skeleton className="aspect-square w-full" />

      {/* 상품 정보 */}
      <div className="p-3">
        {/* 제목 */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />

        {/* 가격 */}
        <Skeleton className="h-3 w-20 mb-1" />
        <Skeleton className="h-6 w-28 mb-3" />

        {/* 뱃지 */}
        <div className="flex gap-1 mb-3">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>

        {/* 판매자 정보 */}
        <div className="flex items-center gap-2 mb-2 pt-2 border-t">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// 여러 개의 스켈레톤을 렌더링하는 헬퍼 컴포넌트
export function PostCardSkeletonGrid({
  count = 8,
  variant = 'default',
  className,
}: {
  count?: number;
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}) {
  if (variant === 'horizontal') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <PostCardSkeleton key={i} variant="horizontal" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        variant === 'compact'
          ? 'grid-cols-3 md:grid-cols-6'
          : 'grid-cols-2 md:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

export default PostCardSkeleton;
