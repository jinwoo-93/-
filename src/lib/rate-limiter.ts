/**
 * Rate Limiter Library
 *
 * API 요청 제한을 위한 간단한 메모리 기반 Rate Limiter
 * 프로덕션 환경에서는 Redis 기반으로 전환 권장
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // 시간 간격 (ms)
  uniqueTokenPerInterval: number; // 간격당 허용 요청 수
}

interface TokenBucket {
  count: number;
  resetTime: number;
}

// 메모리 기반 저장소 (프로덕션에서는 Redis 사용 권장)
const tokenStore = new Map<string, TokenBucket>();

/**
 * IP 주소 또는 사용자 ID 기반 Rate Limiting
 */
export class RateLimiter {
  private interval: number;
  private uniqueTokenPerInterval: number;

  constructor(config: RateLimitConfig) {
    this.interval = config.interval;
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval;
  }

  /**
   * Rate Limit 체크
   * @param identifier - IP 주소 또는 사용자 ID
   * @returns { success: boolean, remaining: number, resetTime: number }
   */
  async check(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const bucket = tokenStore.get(identifier);

    // 버킷이 없거나 리셋 시간이 지났으면 새로 생성
    if (!bucket || now > bucket.resetTime) {
      const newBucket: TokenBucket = {
        count: 1,
        resetTime: now + this.interval,
      };
      tokenStore.set(identifier, newBucket);

      return {
        success: true,
        remaining: this.uniqueTokenPerInterval - 1,
        resetTime: newBucket.resetTime,
      };
    }

    // 요청 횟수가 제한을 초과했는지 확인
    if (bucket.count >= this.uniqueTokenPerInterval) {
      return {
        success: false,
        remaining: 0,
        resetTime: bucket.resetTime,
      };
    }

    // 카운트 증가
    bucket.count++;
    tokenStore.set(identifier, bucket);

    return {
      success: true,
      remaining: this.uniqueTokenPerInterval - bucket.count,
      resetTime: bucket.resetTime,
    };
  }

  /**
   * Rate Limit 초기화
   * @param identifier - IP 주소 또는 사용자 ID
   */
  reset(identifier: string): void {
    tokenStore.delete(identifier);
  }
}

/**
 * 기본 Rate Limiters
 */

// API Rate Limiter (분당 60회)
export const apiLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 60,
});

// 인증 Rate Limiter (분당 5회)
export const authLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 5,
});

// 결제 Rate Limiter (분당 3회)
export const paymentLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 3,
});

// 파일 업로드 Rate Limiter (분당 10회)
export const uploadLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 10,
});

// 검색 Rate Limiter (분당 30회)
export const searchLimiter = new RateLimiter({
  interval: 60 * 1000, // 1분
  uniqueTokenPerInterval: 30,
});

/**
 * IP 주소 추출
 */
export function getClientIdentifier(request: NextRequest): string {
  // Vercel/Cloudflare 프록시를 통한 실제 IP 가져오기
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}

/**
 * Rate Limit 미들웨어 헬퍼
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): Promise<NextResponse | null> {
  const clientId = identifier || getClientIdentifier(request);
  const { success, remaining, resetTime } = await limiter.check(clientId);

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '요청 횟수가 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
          resetTime: new Date(resetTime).toISOString(),
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limiter['uniqueTokenPerInterval']),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetTime),
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}

/**
 * 메모리 정리 (1시간마다 만료된 항목 삭제)
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of tokenStore.entries()) {
    if (now > bucket.resetTime) {
      tokenStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // 1시간

/**
 * 사용 예시:
 *
 * // API Route에서 사용
 * export async function GET(request: NextRequest) {
 *   const rateLimitError = await withRateLimit(request, apiLimiter);
 *   if (rateLimitError) return rateLimitError;
 *
 *   // 정상 처리
 *   return NextResponse.json({ data: 'success' });
 * }
 *
 * // 사용자 ID 기반 제한
 * const rateLimitError = await withRateLimit(
 *   request,
 *   authLimiter,
 *   session.user.id
 * );
 */
