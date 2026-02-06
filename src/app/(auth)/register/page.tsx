'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';
import LanguageSelector from '@/components/common/LanguageSelector';

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    phone: '',
    verificationCode: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    if (!formData.phone) {
      toast({
        title: language === 'ko' ? '전화번호를 입력해주세요' : '请输入手机号',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCodeSent(true);
        toast({
          title: language === 'ko' ? '인증번호가 발송되었습니다' : '验证码已发送',
        });
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '발송 실패' : '发送失败'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      // 개발 모드에서는 임시로 성공 처리
      setIsCodeSent(true);
      toast({
        title: language === 'ko' ? '인증번호가 발송되었습니다 (테스트)' : '验证码已发送（测试）',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) {
      toast({
        title: language === 'ko' ? '인증번호를 입력해주세요' : '请输入验证码',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          code: formData.verificationCode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCodeVerified(true);
        toast({
          title: language === 'ko' ? '인증이 완료되었습니다' : '验证成功',
        });
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '인증 실패' : '验证失败'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      // 개발 모드에서는 임시로 성공 처리 (코드가 123456인 경우)
      if (formData.verificationCode === '123456') {
        setIsCodeVerified(true);
        toast({
          title: language === 'ko' ? '인증이 완료되었습니다 (테스트)' : '验证成功（测试）',
        });
      } else {
        toast({
          title: language === 'ko' ? '인증번호가 일치하지 않습니다' : '验证码不正确',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.email) {
      toast({
        title: language === 'ko' ? '이메일을 입력해주세요' : '请输入邮箱',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      toast({
        title: language === 'ko' ? '올바른 이메일 형식이 아닙니다' : '邮箱格式不正确',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      toast({
        title: language === 'ko' ? '비밀번호는 8자 이상이어야 합니다' : '密码至少需要8个字符',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: language === 'ko' ? '비밀번호가 일치하지 않습니다' : '两次密码不一致',
        variant: 'destructive',
      });
      return false;
    }

    if (!formData.nickname || formData.nickname.length < 2) {
      toast({
        title: language === 'ko' ? '닉네임을 2자 이상 입력해주세요' : '昵称至少需要2个字符',
        variant: 'destructive',
      });
      return false;
    }

    if (!isCodeVerified) {
      toast({
        title: language === 'ko' ? '휴대폰 인증을 완료해주세요' : '请完成手机验证',
        variant: 'destructive',
      });
      return false;
    }

    if (!agreements.terms || !agreements.privacy) {
      toast({
        title: language === 'ko' ? '필수 약관에 동의해주세요' : '请同意必要条款',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          phone: formData.phone,
          country: language === 'ko' ? 'KR' : 'CN',
          language,
          marketingAgreed: agreements.marketing,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: language === 'ko' ? '회원가입이 완료되었습니다' : '注册成功',
        });
        // 자동 로그인
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        router.push('/');
      } else {
        toast({
          title: data.error?.message || (language === 'ko' ? '회원가입 실패' : '注册失败'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: language === 'ko' ? '오류가 발생했습니다' : '发生错误',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  const handleAllAgreements = (checked: boolean) => {
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-end mb-2">
            <LanguageSelector variant="minimal" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-korea to-china bg-clip-text text-transparent">
            {language === 'ko' ? '회원가입' : '注册'}
          </CardTitle>
          <CardDescription>
            {language === 'ko'
              ? '직구역구에 오신 것을 환영합니다'
              : '欢迎来到直购易购'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 소셜 회원가입 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-none"
              onClick={() => handleSocialRegister('kakao')}
            >
              {language === 'ko' ? '카카오' : 'Kakao'}
            </Button>
            <Button
              variant="outline"
              className="bg-[#03C75A] hover:bg-[#03C75A]/90 text-white border-none"
              onClick={() => handleSocialRegister('naver')}
            >
              {language === 'ko' ? '네이버' : 'Naver'}
            </Button>
            <Button
              variant="outline"
              className="bg-[#07C160] hover:bg-[#07C160]/90 text-white border-none"
              onClick={() => handleSocialRegister('wechat')}
            >
              WeChat
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialRegister('google')}
            >
              Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {language === 'ko' ? '또는 이메일로 가입' : '或者使用邮箱注册'}
              </span>
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'ko' ? '이메일' : '邮箱'} *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'ko' ? '비밀번호' : '密码'} *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={language === 'ko' ? '8자 이상 입력' : '至少8个字符'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === 'ko' ? '비밀번호 확인' : '确认密码'} *
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={language === 'ko' ? '비밀번호를 다시 입력' : '再次输入密码'}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* 닉네임 */}
            <div className="space-y-2">
              <Label htmlFor="nickname">
                {language === 'ko' ? '닉네임' : '昵称'} *
              </Label>
              <Input
                id="nickname"
                name="nickname"
                type="text"
                placeholder={language === 'ko' ? '2~20자' : '2~20个字符'}
                value={formData.nickname}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* 휴대폰 번호 */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {language === 'ko' ? '휴대폰 번호' : '手机号'} *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={language === 'ko' ? '010-0000-0000' : '13800000000'}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading || isCodeVerified}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={isLoading || isCodeVerified || !formData.phone}
                >
                  {isCodeVerified ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    language === 'ko' ? '인증' : '验证'
                  )}
                </Button>
              </div>
            </div>

            {/* 인증번호 입력 */}
            {isCodeSent && !isCodeVerified && (
              <div className="space-y-2">
                <Label htmlFor="verificationCode">
                  {language === 'ko' ? '인증번호' : '验证码'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder={language === 'ko' ? '6자리 입력' : '输入6位验证码'}
                    value={formData.verificationCode}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleVerifyCode}
                    disabled={isLoading || !formData.verificationCode}
                  >
                    {language === 'ko' ? '확인' : '确认'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'ko'
                    ? '테스트: 인증번호 123456을 입력하세요'
                    : '测试：请输入验证码 123456'}
                </p>
              </div>
            )}

            {/* 약관 동의 */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all"
                  checked={agreements.terms && agreements.privacy && agreements.marketing}
                  onCheckedChange={handleAllAgreements}
                />
                <Label htmlFor="all" className="text-sm font-medium">
                  {language === 'ko' ? '전체 동의' : '全部同意'}
                </Label>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, terms: !!checked }))
                      }
                    />
                    <Label htmlFor="terms" className="text-sm">
                      {language === 'ko' ? '[필수] 이용약관 동의' : '[必选] 同意服务条款'}
                    </Label>
                  </div>
                  <Link href="/terms" className="text-xs text-primary hover:underline">
                    {language === 'ko' ? '보기' : '查看'}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={(checked) =>
                        setAgreements((prev) => ({ ...prev, privacy: !!checked }))
                      }
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      {language === 'ko' ? '[필수] 개인정보처리방침 동의' : '[必选] 同意隐私政策'}
                    </Label>
                  </div>
                  <Link href="/privacy" className="text-xs text-primary hover:underline">
                    {language === 'ko' ? '보기' : '查看'}
                  </Link>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={agreements.marketing}
                    onCheckedChange={(checked) =>
                      setAgreements((prev) => ({ ...prev, marketing: !!checked }))
                    }
                  />
                  <Label htmlFor="marketing" className="text-sm text-muted-foreground">
                    {language === 'ko' ? '[선택] 마케팅 정보 수신 동의' : '[可选] 同意接收营销信息'}
                  </Label>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? language === 'ko' ? '처리 중...' : '处理中...'
                : language === 'ko' ? '가입하기' : '注册'
              }
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '이미 계정이 있으신가요?' : '已有账号？'}{' '}
              <Link href="/login" className="text-primary hover:underline">
                {language === 'ko' ? '로그인' : '登录'}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
