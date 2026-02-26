import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis 환경변수가 없으면 메모리 기반으로 폴백
// 개발 환경에서는 환경변수 없이도 작동하도록
let ratelimit: Ratelimit;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // 프로덕션: Upstash Redis 사용
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초에 10회
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
} else {
  // 개발 환경: 메모리 기반 (Upstash 없이도 작동)
  const cache = new Map();
  ratelimit = new Ratelimit({
    redis: {
      sadd: async () => 0,
      eval: async () => [1, [1]] as any,
    } as any,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: false,
  });
}

export { ratelimit };

// IP 기반 제한
export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}

// API별로 다른 제한 설정
export const apiRateLimits = {
  // 로그인: 5분에 5회
  login: process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '5 m'),
      })
    : ratelimit,

  // 회원가입: 1시간에 3회
  register: process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(3, '1 h'),
      })
    : ratelimit,

  // SMS 발송: 1분에 1회
  sms: process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(1, '1 m'),
      })
    : ratelimit,

  // 일반 API: 10초에 10회
  general: ratelimit,
};
