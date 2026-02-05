import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
                     req.nextUrl.pathname.startsWith('/register');
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
  const isProtectedPage = req.nextUrl.pathname.startsWith('/mypage') ||
                          req.nextUrl.pathname.startsWith('/orders') ||
                          req.nextUrl.pathname.startsWith('/messages') ||
                          req.nextUrl.pathname.startsWith('/posts/create');

  // 로그인 페이지 접근 시 이미 로그인되어 있으면 홈으로 리다이렉트
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 보호된 페이지 접근 시 로그인 필요
  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 관리자 페이지 접근 제어
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // TODO: 관리자 권한 확인 로직 추가
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
