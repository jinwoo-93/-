'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    // TODO: 실제 SMS 발송 API 호출
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
      // CSRF 토큰 가져오기
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      // 폼을 생성하여 POST 방식으로 소셜 로그인 요청
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl bg-gradient-to-r from-korea to-china bg-clip-text text-transparent">
            {t('common.appName')}
          </CardTitle>
          <CardDescription>
            {language === 'ko' ? '한중 크로스보더 C2C 마켓플레이스' : '韩中跨境C2C交易平台'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 소셜 로그인 */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-none"
              onClick={() => handleSocialLogin('kakao')}
            >
              {t('auth.kakaoLogin')}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#03C75A] hover:bg-[#03C75A]/90 text-white border-none"
              onClick={() => handleSocialLogin('naver')}
            >
              {t('auth.naverLogin')}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-[#07C160] hover:bg-[#07C160]/90 text-white border-none"
              onClick={() => handleSocialLogin('wechat')}
            >
              {t('auth.wechatLogin')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSocialLogin('google')}
            >
              {t('auth.googleLogin')}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {language === 'ko' ? '또는' : '或者'}
              </span>
            </div>
          </div>

          {/* 휴대폰 로그인 */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder={t('auth.phone')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
              />
              <Button
                variant="outline"
                onClick={handleSendCode}
                disabled={isLoading || isCodeSent}
              >
                {t('auth.sendCode')}
              </Button>
            </div>
            {isCodeSent && (
              <Input
                type="text"
                placeholder={t('auth.verificationCode')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
              />
            )}
            <Button
              className="w-full"
              onClick={handlePhoneLogin}
              disabled={isLoading || !isCodeSent}
            >
              {t('auth.login')}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '계정이 없으신가요?' : '还没有账号？'}{' '}
              <Link href="/register" className="text-primary hover:underline">
                {t('auth.register')}
              </Link>
            </p>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              {language === 'ko' ? '비밀번호를 잊으셨나요?' : '忘记密码？'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
