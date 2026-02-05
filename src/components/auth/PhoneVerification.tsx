'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface PhoneVerificationProps {
  onVerified?: (phone: string) => void;
  initialPhone?: string;
  required?: boolean;
}

export function PhoneVerification({
  onVerified,
  initialPhone = '',
  required = false,
}: PhoneVerificationProps) {
  const { language } = useLanguage();

  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'verified'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 코드 입력 후 자동 포커스
  useEffect(() => {
    if (step === 'verify' && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [step]);

  // 전화번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');

    // 한국 번호 포맷
    if (digits.startsWith('010') || digits.startsWith('011')) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    // 중국 번호 포맷
    if (digits.startsWith('1') && digits.length > 2) {
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }

    return digits;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setError(null);
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('verify');
        setCountdown(60);
      } else {
        setError(result.error?.message || '인증 코드 발송에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ''),
          code,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('verified');
        onVerified?.(result.data.phone);
      } else {
        setError(result.error?.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setCode('');
    handleSendCode();
  };

  if (step === 'verified') {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">
              {language === 'ko' ? '인증 완료' : '验证成功'}
            </p>
            <p className="text-sm text-green-600">{phone}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'input' && (
        <>
          {/* 전화번호 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ko' ? '휴대폰 번호' : '手机号码'}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder={language === 'ko' ? '010-0000-0000' : '138-0000-0000'}
                  className="pl-10"
                  maxLength={13}
                />
              </div>
              <Button
                onClick={handleSendCode}
                disabled={isLoading || phone.replace(/\D/g, '').length < 10}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {language === 'ko' ? '인증요청' : '获取验证码'}
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {language === 'ko'
                ? '한국(+82) 또는 중국(+86) 휴대폰 번호를 입력해주세요.'
                : '请输入韩国(+82)或中国(+86)手机号码。'}
            </p>
          </div>
        </>
      )}

      {step === 'verify' && (
        <>
          {/* 인증 코드 입력 */}
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-3">
              {language === 'ko'
                ? `${phone}로 전송된 6자리 인증번호를 입력해주세요.`
                : `请输入发送至 ${phone} 的6位验证码。`}
            </p>

            <div className="flex gap-2">
              <Input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError(null);
                }}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  language === 'ko' ? '확인' : '确认'
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setCode('');
                  setError(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {language === 'ko' ? '번호 변경' : '更换号码'}
              </button>

              {countdown > 0 ? (
                <span className="text-sm text-gray-400">
                  {language === 'ko' ? '재전송' : '重新发送'} ({countdown}s)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {language === 'ko' ? '인증번호 재전송' : '重新发送验证码'}
                </button>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
