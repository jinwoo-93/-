import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import type { Adapter } from 'next-auth/adapters';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { authConfig } from './auth.config';

// Node.js Runtime 전용 설정 (API 라우트에서 사용)
// PrismaAdapter, DB 접근 등 포함
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    // authConfig의 providers를 그대로 사용하되, Credentials만 실제 로직으로 교체
    ...authConfig.providers.filter((p: any) => p.id !== 'credentials'),
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
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;

        try {
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
        } catch (error) {
          console.error('Session callback DB error:', error);
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
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

// 레거시 API 호환성을 위한 exports
export const authOptions = authConfig;
export const getServerSession = auth;

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
