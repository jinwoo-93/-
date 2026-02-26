'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // 3초 카운트다운 후 로그인 페이지로 이동
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectTo);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router, redirectTo]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {language === 'ko' ? '로딩 중...' : '加载中...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              {language === 'ko' ? '로그인이 필요합니다' : '需要登录'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'ko'
                ? '이 페이지는 로그인 후 이용할 수 있습니다'
                : '此页面需要登录后才能访问'}
            </p>
            <div className="mb-4">
              <p className="text-2xl font-bold text-blue-600">{countdown}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko'
                  ? '초 후 로그인 페이지로 이동합니다'
                  : '秒后跳转到登录页面'}
              </p>
            </div>
            <button
              onClick={() => router.push(redirectTo)}
              className="w-full h-11 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
            >
              {language === 'ko' ? '바로 로그인하기' : '立即登录'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
