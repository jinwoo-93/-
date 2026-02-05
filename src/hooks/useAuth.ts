'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const login = useCallback(async (provider: 'google' | 'kakao' | 'credentials', credentials?: { phone: string; code: string }) => {
    try {
      if (provider === 'credentials' && credentials) {
        const result = await signIn('credentials', {
          phone: credentials.phone,
          code: credentials.code,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push('/');
        return { success: true };
      }

      await signIn(provider, { callbackUrl: '/' });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      };
    }
  }, [router]);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  const requireAuth = useCallback((callback?: () => void) => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }
    callback?.();
    return true;
  }, [isAuthenticated, router]);

  const requireVerification = useCallback((type: 'phone' | 'identity' | 'business', callback?: () => void) => {
    if (!isAuthenticated) {
      router.push('/login');
      return false;
    }

    if (type === 'phone' && !user?.isPhoneVerified) {
      router.push('/verify/phone');
      return false;
    }

    if (type === 'identity' && !user?.isIdentityVerified) {
      router.push('/verify/identity');
      return false;
    }

    if (type === 'business' && !user?.isBusinessVerified) {
      router.push('/verify/business');
      return false;
    }

    callback?.();
    return true;
  }, [isAuthenticated, user, router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    requireAuth,
    requireVerification,
    isSeller: user?.userType === 'SELLER' || user?.userType === 'BOTH',
    isBuyer: user?.userType === 'BUYER' || user?.userType === 'BOTH',
    isAdmin: user?.userType === 'ADMIN',
    isShipping: user?.userType === 'SHIPPING',
    isBusinessVerified: user?.isBusinessVerified,
    hasExcellentBadge: user?.hasExcellentBadge,
  };
}

export default useAuth;
