'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/useToast';

type Step = 'input' | 'verify' | 'complete';
type CountryCode = '+82' | '+86';

export default function PhoneVerifyPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('input');
  const [countryCode, setCountryCode] = useState<CountryCode>('+82');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  const lang = language === 'zh' ? 'zh' : 'ko';

  // 타이머
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  // 전화번호 포맷팅
  const formatPhoneDisplay = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (countryCode === '+82') {
      // 한국 번호: 010-1234-5678
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    // 중국 번호: 138-1234-5678
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length <= 11) {
      setPhone(digits);
    }
  };

  // 인증번호 발송
  const handleSendCode = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: lang === 'ko' ? '올바른 전화번호를 입력해주세요' : '请输入正确的手机号',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const fullPhone = `${countryCode}${phone.startsWith('0') ? phone.slice(1) : phone}`;
      const country = countryCode === '+82' ? 'KR' : 'CN';

      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, country }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
        setTimer(300); // 5분
        toast({
          title: lang === 'ko' ? '인증번호가 발송되었습니다' : '验证码已发送',
        });
      } else {
        toast({
          title: data.error?.message || (lang === 'ko' ? '발송에 실패했습니다' : '发送失败'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: lang === 'ko' ? '네트워크 오류' : '网络错误',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // 인증번호 확인
  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: lang === 'ko' ? '6자리 인증번호를 입력해주세요' : '请输入6位验证码',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      const fullPhone = `${countryCode}${phone.startsWith('0') ? phone.slice(1) : phone}`;

      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('complete');
        toast({
          title: lang === 'ko' ? '인증이 완료되었습니다' : '验证完成',
        });
      } else {
        toast({
          title: data.error?.message || (lang === 'ko' ? '인증에 실패했습니다' : '验证失败'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: lang === 'ko' ? '네트워크 오류' : '网络错误',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 재발송
  const handleResend = async () => {
    setCode('');
    await handleSendCode();
  };

  // 인증 완료 상태
  if (step === 'complete') {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {lang === 'ko' ? '인증 완료!' : '验证完成！'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {lang === 'ko'
              ? '휴대폰 인증이 성공적으로 완료되었습니다.'
              : '手机验证已成功完成。'}
          </p>
          <Button onClick={() => router.push('/mypage')}>
            {lang === 'ko' ? '마이페이지로 돌아가기' : '返回我的页面'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6" />
            {lang === 'ko' ? '휴대폰 인증' : '手机验证'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'ko'
              ? '본인 확인을 위해 휴대폰을 인증해주세요'
              : '请验证手机号以确认身份'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* 단계 1: 휴대폰 번호 입력 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {lang === 'ko' ? '휴대폰 번호' : '手机号码'}
            </Label>
            <div className="flex gap-2">
              {/* 국가 코드 선택 */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value as CountryCode)}
                disabled={step === 'verify'}
                className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="+82">+82 🇰🇷</option>
                <option value="+86">+86 🇨🇳</option>
              </select>

              {/* 전화번호 입력 */}
              <div className="flex-1 relative">
                <Input
                  type="tel"
                  placeholder={
                    countryCode === '+82' ? '010-1234-5678' : '138-1234-5678'
                  }
                  value={formatPhoneDisplay(phone)}
                  onChange={handlePhoneChange}
                  disabled={step === 'verify'}
                  maxLength={13}
                />
              </div>
            </div>

            {step === 'input' && (
              <Button
                className="w-full"
                onClick={handleSendCode}
                disabled={isSending || phone.length < 10}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {lang === 'ko' ? '발송 중...' : '发送中...'}
                  </>
                ) : (
                  lang === 'ko' ? '인증번호 받기' : '获取验证码'
                )}
              </Button>
            )}
          </div>

          {/* 단계 2: 인증번호 입력 */}
          {step === 'verify' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {lang === 'ko' ? '인증번호' : '验证码'}
                </Label>
                {timer > 0 && (
                  <span className="text-sm font-mono text-destructive">
                    {formatTimer(timer)}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits.length <= 6) setCode(digits);
                  }}
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleResend}
                  disabled={isSending || timer > 240}
                >
                  {lang === 'ko' ? '재전송' : '重新发送'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerify}
                  disabled={isVerifying || code.length !== 6 || timer <= 0}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {lang === 'ko' ? '확인 중...' : '验证中...'}
                    </>
                  ) : (
                    lang === 'ko' ? '인증 확인' : '确认验证'
                  )}
                </Button>
              </div>

              {timer <= 0 && (
                <p className="text-xs text-destructive text-center">
                  {lang === 'ko'
                    ? '인증번호가 만료되었습니다. 재전송을 눌러주세요.'
                    : '验证码已过期。请点击重新发送。'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 안내 */}
      <Card className="mt-4 bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 space-y-1">
            <p>
              {lang === 'ko'
                ? '입력하신 전화번호는 본인 확인 용도로만 사용되며, 안전하게 보호됩니다.'
                : '您输入的手机号仅用于身份验证，并将得到安全保护。'}
            </p>
            <p>
              {lang === 'ko'
                ? '인증번호는 5분간 유효합니다.'
                : '验证码有效期为5分钟。'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
