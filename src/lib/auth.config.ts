import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Credentials from 'next-auth/providers/credentials';

// Edge Runtime 호환 설정 (미들웨어에서 사용)
// PrismaAdapter, Prisma Client 등 Node.js 전용 모듈을 포함하지 않음
export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Kakao는 Client ID/Secret 설정 후 활성화
    // Kakao({
    //   clientId: process.env.KAKAO_CLIENT_ID!,
    //   clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    // }),
    Credentials({
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize() {
        // 실제 인증 로직은 auth.ts에서 처리
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      // Edge Runtime에서 JWT 토큰의 userType을 세션에 반영
      if (session.user && token) {
        session.user.id = token.id as string;
        if (token.userType) {
          session.user.userType = token.userType as string;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login') ||
                         nextUrl.pathname.startsWith('/register');
      const isAdminPage = nextUrl.pathname.startsWith('/admin');
      const isProtectedPage = nextUrl.pathname.startsWith('/mypage') ||
                              nextUrl.pathname.startsWith('/orders') ||
                              nextUrl.pathname.startsWith('/messages') ||
                              nextUrl.pathname.startsWith('/posts/create');

      // 로그인 페이지: 이미 로그인 되어 있으면 홈으로
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // 관리자 페이지: 로그인 + ADMIN 역할 필요
      if (isAdminPage) {
        if (!isLoggedIn) {
          const loginUrl = new URL('/login', nextUrl);
          loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
          return Response.redirect(loginUrl);
        }
        // JWT 토큰의 userType 확인 (auth.ts의 jwt 콜백에서 설정)
        const userType = (auth as any)?.user?.userType;
        if (userType !== 'ADMIN') {
          return Response.redirect(new URL('/', nextUrl));
        }
      }

      // 보호된 페이지: 로그인 필요
      if (isProtectedPage && !isLoggedIn) {
        const loginUrl = new URL('/login', nextUrl);
        loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
};
