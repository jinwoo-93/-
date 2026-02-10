import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Edge Runtime 호환 - PrismaAdapter를 포함하지 않는 auth.config 사용
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
