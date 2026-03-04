'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
    setSocialLoading(provider);

    try {
      // URL에서 callbackUrl 파라미터 확인
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl') || '/';

      // NextAuth의 signIn 함수로 간단하게 처리
      await signIn(provider, {
        callbackUrl: callbackUrl,
        redirect: true, // 자동 리다이렉트
      });

      // redirect: true이므로 아래 코드는 실행되지 않음
      // 로그인 성공 시 자동으로 callbackUrl로 이동
    } catch (error) {
      console.error('Social login error:', error);
      toast({
        title: language === 'ko' ? '로그인 중 오류가 발생했습니다' : '登录过程中发生错误',
        variant: 'destructive'
      });
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[380px]">
        {/* 로고 */}
        <Link href="/" className="block text-center mb-10 cursor-pointer hover:opacity-80 transition-opacity">
          <h1 className="text-[22px] font-black tracking-tight text-black">
            JIKGUYEOKGU
          </h1>
          <p className="text-[13px] text-gray-400 mt-1">
            {language === 'ko' ? '한중 크로스보더 마켓플레이스' : '韩中跨境交易平台'}
          </p>
        </Link>

        {/* 소셜 로그인 */}
        <div className="space-y-2.5 mb-8">
          <button
            className="w-full h-[48px] bg-[#FEE500] text-black text-[14px] font-bold hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin('kakao')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'kakao' && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('auth.kakaoLogin')}
          </button>
          <button
            className="w-full h-[48px] bg-[#03C75A] text-white text-[14px] font-bold hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin('naver')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'naver' && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('auth.naverLogin')}
          </button>
          <button
            className="w-full h-[48px] border border-gray-200 text-black text-[14px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading}
          >
            {socialLoading === 'google' && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('auth.googleLogin')}
          </button>
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-[13px] text-gray-400">
            {language === 'ko' ? '계정이 없으신가요?' : '还没有账号？'}{' '}
            <Link href="/register" className="text-black font-bold hover:underline">
              {t('auth.register')}
            </Link>
          </p>
          <p className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100">
            {language === 'ko'
              ? '소셜 로그인 후 자동으로 회원가입됩니다'
              : '社交登录后自动注册'}
          </p>
        </div>
      </div>
    </div>
  );
}
