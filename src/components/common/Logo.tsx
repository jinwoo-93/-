'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <Link href="/" className={cn('flex items-center', s.gap, className)}>
      {/* 로고 아이콘 - 비행기 + 배 (옵션 B) */}
      <div className={cn('relative', s.icon)}>
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* 배경 - 둥근 사각형 */}
          <rect x="2" y="2" width="52" height="52" rx="12" fill="url(#logoGradientB)" />

          {/* 비행기 (상단 - 한국발) */}
          <g transform="translate(8, 8)">
            <path
              d="M18 4L22 8L18 10L14 8L18 4Z"
              fill="white"
              fillOpacity="0.95"
            />
            <path
              d="M4 14L18 10L22 12L8 18L4 14Z"
              fill="white"
              fillOpacity="0.95"
            />
            <path
              d="M18 10L18 16L14 18L14 12L18 10Z"
              fill="white"
              fillOpacity="0.8"
            />
          </g>

          {/* 화물선 (하단 - 중국발) */}
          <g transform="translate(24, 28)">
            {/* 선체 */}
            <path
              d="M2 12L6 20H22L26 12H2Z"
              fill="white"
              fillOpacity="0.95"
            />
            {/* 갑판 */}
            <rect x="8" y="6" width="12" height="6" rx="1" fill="white" fillOpacity="0.9" />
            {/* 굴뚝 */}
            <rect x="12" y="2" width="4" height="5" rx="0.5" fill="white" fillOpacity="0.85" />
            {/* 연기 */}
            <circle cx="14" cy="0" r="1.5" fill="white" fillOpacity="0.5" />
          </g>

          {/* 양방향 화살표 (중앙) */}
          <g transform="translate(20, 24)">
            <path d="M0 4L6 0V8L0 4Z" fill="#93C5FD" /> {/* 왼쪽 화살표 */}
            <path d="M16 4L10 0V8L16 4Z" fill="#FCA5A5" /> {/* 오른쪽 화살표 */}
            <rect x="5" y="3" width="6" height="2" rx="1" fill="white" fillOpacity="0.8" />
          </g>

          {/* 그라데이션 정의 */}
          <defs>
            <linearGradient id="logoGradientB" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 로고 텍스트 */}
      {showText && (
        <span className={cn('font-bold tracking-tight', s.text)}>
          <span className="text-blue-600">직구</span>
          <span className="text-red-500">역구</span>
        </span>
      )}
    </Link>
  );
}

// 심볼 로고 (아이콘만)
export function LogoSymbol({ size = 'md', className }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} showText={false} className={className} />;
}

// 풀 로고 (텍스트 포함, 다크/화이트 버전)
export function LogoWhite({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 'w-9 h-9', text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <Link href="/" className={cn('flex items-center', s.gap, className)}>
      <div className={cn('relative', s.icon)}>
        <svg
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect x="2" y="2" width="52" height="52" rx="12" fill="white" />

          {/* 비행기 */}
          <g transform="translate(8, 8)">
            <path d="M18 4L22 8L18 10L14 8L18 4Z" fill="#2563EB" />
            <path d="M4 14L18 10L22 12L8 18L4 14Z" fill="#2563EB" />
            <path d="M18 10L18 16L14 18L14 12L18 10Z" fill="#1D4ED8" />
          </g>

          {/* 화물선 */}
          <g transform="translate(24, 28)">
            <path d="M2 12L6 20H22L26 12H2Z" fill="#DC2626" />
            <rect x="8" y="6" width="12" height="6" rx="1" fill="#DC2626" />
            <rect x="12" y="2" width="4" height="5" rx="0.5" fill="#B91C1C" />
          </g>

          {/* 양방향 화살표 */}
          <g transform="translate(20, 24)">
            <path d="M0 4L6 0V8L0 4Z" fill="#3B82F6" />
            <path d="M16 4L10 0V8L16 4Z" fill="#EF4444" />
            <rect x="5" y="3" width="6" height="2" rx="1" fill="#9CA3AF" />
          </g>
        </svg>
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-white', s.text)}>
          직구역구
        </span>
      )}
    </Link>
  );
}
