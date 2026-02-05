'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Shield,
  User,
  Calendar,
  CreditCard,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function IdentityVerificationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    idNumber: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      checkVerificationStatus();
    }
  }, [status]);

  const checkVerificationStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/verify/identity');
      const data = await res.json();
      if (data.success && data.data.isVerified) {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.birthDate || !formData.idNumber) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/verify/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerified(true);
      } else {
        setError(data.error?.message || '인증에 실패했습니다.');
      }
    } catch (error) {
      setError('인증 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold">본인 인증</h1>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">본인 인증 완료</h2>
            <p className="text-gray-500 mb-6">본인 인증이 성공적으로 완료되었습니다.</p>
            <button
              onClick={() => router.push('/mypage')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              마이페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">본인 인증</h1>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 안내 */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">본인 인증 안내</h3>
              <p className="text-sm text-blue-700">
                본인 인증을 완료하면 더 안전한 거래가 가능합니다.
                입력하신 정보는 암호화되어 안전하게 보관됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              이름 (실명)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="실명을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              생년월일
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 주민등록번호 앞자리 또는 외국인등록번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              주민등록번호 앞 6자리
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setFormData({ ...formData, idNumber: value });
              }}
              placeholder="생년월일 6자리"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              예: 901231 (주민등록번호 앞 6자리)
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                인증 중...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                본인 인증하기
              </>
            )}
          </button>
        </form>

        {/* 주의사항 */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>* 입력하신 개인정보는 본인 인증 목적으로만 사용됩니다.</p>
          <p>* 인증 정보는 암호화되어 안전하게 보관됩니다.</p>
          <p>* 허위 정보 입력 시 서비스 이용이 제한될 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
