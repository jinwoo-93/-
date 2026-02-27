'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) {
      toast({ title: language === 'ko' ? '전화번호를 입력해주세요' : '请输入手机号', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsCodeSent(true);
      setIsLoading(false);
      toast({ title: language === 'ko' ? '인증번호가 발송되었습니다' : '验证码已发送' });
    }, 1000);
  };

  const handlePhoneLogin = async () => {
    if (!phone || !code) {
      toast({ title: language === 'ko' ? '전화번호와 인증번호를 입력해주세요' : '请输入手机号和验证码', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        phone,
        code,
        redirect: false,
      });
      if (result?.error) {
        toast({ title: language === 'ko' ? '로그인에 실패했습니다' : '登录失败', variant: 'destructive' });
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      toast({ title: language === 'ko' ? '오류가 발생했습니다' : '发生错误', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/auth/signin/${provider}`;

      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfToken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      const callbackInput = document.createElement('input');
      callbackInput.type = 'hidden';
      callbackInput.name = 'callbackUrl';
      callbackInput.value = window.location.origin;
      form.appendChild(callbackInput);

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error('Social login error:', error);
      toast({ title: language === 'ko' ? '로그인 중 오류가 발생했습니다' : '登录过程中发生错误', variant: 'destructive' });
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
            className="w-full h-[48px] bg-[#FEE500] text-black text-[14px] font-bold hover:brightness-95 transition-all"
            onClick={() => handleSocialLogin('kakao')}
          >
            {t('auth.kakaoLogin')}
          </button>
          <button
            className="w-full h-[48px] bg-[#03C75A] text-white text-[14px] font-bold hover:brightness-95 transition-all"
            onClick={() => handleSocialLogin('naver')}
          >
            {t('auth.naverLogin')}
          </button>
          <button
            className="w-full h-[48px] border border-gray-200 text-black text-[14px] font-bold hover:bg-gray-50 transition-colors"
            onClick={() => handleSocialLogin('google')}
          >
            {t('auth.googleLogin')}
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[12px] text-gray-400">
              {language === 'ko' ? '또는' : '或者'}
            </span>
          </div>
        </div>

        {/* 휴대폰 로그인 */}
        <div className="space-y-2.5">
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder={t('auth.phone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="h-[48px] border-gray-200 rounded-none text-[14px] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-black"
            />
            <button
              className="shrink-0 h-[48px] px-4 border border-gray-200 text-[13px] font-bold text-black hover:bg-gray-50 disabled:opacity-40 transition-colors"
              onClick={handleSendCode}
              disabled={isLoading || isCodeSent}
            >
              {t('auth.sendCode')}
            </button>
          </div>
          {isCodeSent && (
            <Input
              type="text"
              placeholder={t('auth.verificationCode')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isLoading}
              className="h-[48px] border-gray-200 rounded-none text-[14px] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:border-black"
            />
          )}
          <button
            className="w-full h-[48px] bg-black text-white text-[14px] font-bold hover:bg-gray-900 disabled:opacity-40 transition-colors"
            onClick={handlePhoneLogin}
            disabled={isLoading || !isCodeSent}
          >
            {t('auth.login')}
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
          <Link
            href="/auth/forgot-password"
            className="text-[13px] text-gray-400 hover:text-black transition-colors block"
          >
            {language === 'ko' ? '비밀번호를 잊으셨나요?' : '忘记密码？'}
          </Link>
        </div>
      </div>
    </div>
  );
}
