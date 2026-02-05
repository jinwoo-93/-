import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Kakao from 'next-auth/providers/kakao';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import type { Adapter } from 'next-auth/adapters';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          return null;
        }

        // TODO: 실제 SMS 인증 로직 구현
        // 현재는 개발용으로 간단히 처리
        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone as string },
        });

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.profileImage,
          };
        }

        // 새 사용자 생성
        const newUser = await prisma.user.create({
          data: {
            phone: credentials.phone as string,
            phoneCountry: 'KR',
            isPhoneVerified: true,
          },
        });

        return {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          image: newUser.profileImage,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    newUser: '/register/complete',
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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // 사용자 정보 가져오기
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            userType: true,
            country: true,
            language: true,
            isPhoneVerified: true,
            isIdentityVerified: true,
            isBusinessVerified: true,
            hasExcellentBadge: true,
            nickname: true,
          },
        });

        if (dbUser) {
          session.user.userType = dbUser.userType;
          session.user.country = dbUser.country;
          session.user.language = dbUser.language;
          session.user.isPhoneVerified = dbUser.isPhoneVerified;
          session.user.isIdentityVerified = dbUser.isIdentityVerified;
          session.user.isBusinessVerified = dbUser.isBusinessVerified;
          session.user.hasExcellentBadge = dbUser.hasExcellentBadge;
          session.user.nickname = dbUser.nickname;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // 새 사용자 생성 시 기본값 설정
      await prisma.user.update({
        where: { id: user.id },
        data: {
          country: 'KR',
          language: 'KO',
          userType: 'BUYER',
        },
      });
    },
  },
});

// NextAuth 타입 확장
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      userType?: string;
      country?: string;
      language?: string;
      isPhoneVerified?: boolean;
      isIdentityVerified?: boolean;
      isBusinessVerified?: boolean;
      hasExcellentBadge?: boolean;
      nickname?: string | null;
    };
  }
}
