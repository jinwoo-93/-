import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge Runtime 호환 - PrismaAdapter를 포함하지 않는 auth.config 사용
const { auth } = NextAuth(authConfig);

// 보안 헤더 설정
function setSecurityHeaders(response: NextResponse): NextResponse {
  // XSS 방어
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (기본 설정)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.tosspayments.com https://t1.kakaocdn.net; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://*.pusher.com wss://*.pusher.com https://api.tosspayments.com; " +
    "frame-src 'self' https://js.tosspayments.com;"
  );

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  );

  return response;
}

// CORS 헤더 설정 (API 요청용)
function setCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');

  // 허용된 도메인 목록
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://jikguyeokgu.vercel.app',
    // 프로덕션 도메인 추가
  ];

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24시간

  return response;
}

// 커스텀 미들웨어
export default auth(async function middleware(request: NextRequest) {
  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    return setCorsHeaders(response, request);
  }

  // 인증 처리는 auth()가 자동으로 처리
  const response = NextResponse.next();

  // API 요청에만 CORS 헤더 추가
  if (request.nextUrl.pathname.startsWith('/api')) {
    setCorsHeaders(response, request);
  }

  // 모든 요청에 보안 헤더 추가
  setSecurityHeaders(response);

  return response;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
