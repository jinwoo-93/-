'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Lock,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

type Step = 'phone' | 'verify' | 'reset' | 'complete';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 폼 데이터
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<'KR' | 'CN'>('KR');
  const [verificationCode, setVerificationCode] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 타이머
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    setError(null);

    if (!phone) {
      setError('휴대폰 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, phoneCountry }),
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.data.token);
        setStep('verify');
        // 재발송 타이머 시작 (60초)
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error?.message || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      setError('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }
    setError(null);
    setStep('reset');
  };

  const handleResetPassword = async () => {
    setError(null);

    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          token,
          code: verificationCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('complete');
      } else {
        setError(data.error?.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      setError('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step === 'phone' ? router.back() : setStep('phone')}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">
              {language === 'ko' ? '비밀번호 찾기' : '找回密码'}
            </h1>
          </div>
        </div>
      </div>

      {/* 진행 표시 */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {['phone', 'verify', 'reset'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? 'bg-blue-500 text-white'
                      : ['verify', 'reset', 'complete'].indexOf(step) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {['verify', 'reset', 'complete'].indexOf(step) > index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-1 mx-1 ${
                      ['verify', 'reset', 'complete'].indexOf(step) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {/* 휴대폰 입력 */}
        {step === 'phone' && (
          <div className="bg-white rounded-xl p-6 space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold mb-2">
                {language === 'ko' ? '휴대폰 번호 확인' : '验证手机号码'}
              </h2>
              <p className="text-sm text-gray-500">
                {language === 'ko'
                  ? '가입 시 등록한 휴대폰 번호를 입력해주세요.'
                  : '请输入注册时使用的手机号码'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* 국가 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPhoneCountry('KR')}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                  phoneCountry === 'KR'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🇰🇷 +82
              </button>
              <button
                type="button"
                onClick={() => setPhoneCountry('CN')}
                className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                  phoneCountry === 'CN'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                🇨🇳 +86
              </button>
            </div>

            {/* 전화번호 */}
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder={phoneCountry === 'KR' ? '01012345678' : '13812345678'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading || !phone}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                language === 'ko' ? '인증번호 받기' : '获取验证码'
              )}
            </button>
          </div>
        )}

        {/* 인증번호 입력 */}
        {step === 'verify' && (
          <div className="bg-white rounded-xl p-6 space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold mb-2">
                {language === 'ko' ? '인증번호 입력' : '输入验证码'}
              </h2>
              <p className="text-sm text-gray-500">
                {phoneCountry === 'KR' ? '+82 ' : '+86 '}{phone}
                {language === 'ko' ? '로 발송된 인증번호를 입력해주세요.' : ' 收到的验证码'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">
                {language === 'ko' ? '인증번호가 오지 않나요?' : '没有收到验证码?'}
              </span>
              <button
                onClick={handleSendCode}
                disabled={countdown > 0 || isLoading}
                className="text-blue-500 font-medium disabled:text-gray-400"
              >
                {countdown > 0
                  ? `${countdown}초 후 재발송`
                  : language === 'ko' ? '재발송' : '重新发送'}
              </button>
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === 'ko' ? '확인' : '确认'}
            </button>
          </div>
        )}

        {/* 새 비밀번호 설정 */}
        {step === 'reset' && (
          <div className="bg-white rounded-xl p-6 space-y-5">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold mb-2">
                {language === 'ko' ? '새 비밀번호 설정' : '设置新密码'}
              </h2>
              <p className="text-sm text-gray-500">
                {language === 'ko'
                  ? '8자 이상의 새 비밀번호를 입력해주세요.'
                  : '请输入8位以上的新密码'}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={language === 'ko' ? '새 비밀번호' : '新密码'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'ko' ? '비밀번호 확인' : '确认密码'}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                language === 'ko' ? '비밀번호 변경' : '修改密码'
              )}
            </button>
          </div>
        )}

        {/* 완료 */}
        {step === 'complete' && (
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'ko' ? '비밀번호 변경 완료' : '密码修改成功'}
            </h2>
            <p className="text-gray-500 mb-6">
              {language === 'ko'
                ? '새 비밀번호로 로그인해주세요.'
                : '请使用新密码登录'}
            </p>
            <Link href="/auth/login">
              <button className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">
                {language === 'ko' ? '로그인하기' : '去登录'}
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
