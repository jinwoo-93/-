'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  User,
  Hash,
  MapPin,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  FileText,
} from 'lucide-react';

export default function BusinessVerificationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedData, setVerifiedData] = useState<{
    businessNumber?: string;
    businessName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessNumber: '',
    businessName: '',
    representativeName: '',
    businessType: '',
    businessItem: '',
    businessAddress: '',
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
      const res = await fetch('/api/verify/business');
      const data = await res.json();
      if (data.success && data.data.isVerified) {
        setIsVerified(true);
        setVerifiedData({
          businessNumber: data.data.businessNumber,
          businessName: data.data.businessName,
        });
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBusinessNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessNumber || !formData.businessName || !formData.representativeName) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }

    const cleanNumber = formData.businessNumber.replace(/-/g, '');
    if (cleanNumber.length !== 10) {
      setError('올바른 사업자등록번호 10자리를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/verify/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setIsVerified(true);
        setVerifiedData({
          businessNumber: cleanNumber,
          businessName: formData.businessName,
        });
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
              <h1 className="text-xl font-bold">사업자 인증</h1>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">사업자 인증 완료</h2>
            <p className="text-gray-500 mb-4">사업자 인증이 성공적으로 완료되었습니다.</p>

            {verifiedData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">상호명</span>
                    <span className="font-medium">{verifiedData.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">사업자번호</span>
                    <span className="font-medium">
                      {formatBusinessNumber(verifiedData.businessNumber || '')}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
            <h1 className="text-xl font-bold">사업자 인증</h1>
          </div>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* 안내 */}
        <div className="bg-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-purple-900 mb-1">사업자 인증 안내</h3>
              <p className="text-sm text-purple-700">
                사업자 인증을 완료하면 사업자 뱃지가 부여되어 구매자의 신뢰도가 높아집니다.
                국세청 홈택스에 등록된 정보로 자동 검증됩니다.
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

          {/* 사업자등록번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              사업자등록번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.businessNumber}
              onChange={(e) => {
                const formatted = formatBusinessNumber(e.target.value);
                setFormData({ ...formData, businessNumber: formatted });
              }}
              placeholder="000-00-00000"
              maxLength={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 상호명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              상호명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="사업자등록증상의 상호명"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 대표자명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              대표자명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.representativeName}
              onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
              placeholder="대표자 성명"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* 업종/업태 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                업종
              </label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                placeholder="예: 도소매업"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                업태
              </label>
              <input
                type="text"
                value={formData.businessItem}
                onChange={(e) => setFormData({ ...formData, businessItem: e.target.value })}
                placeholder="예: 전자상거래"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* 사업장 주소 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              사업장 주소
            </label>
            <input
              type="text"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              placeholder="사업장 주소"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                인증 중...
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                사업자 인증하기
              </>
            )}
          </button>
        </form>

        {/* 주의사항 */}
        <div className="mt-6 text-xs text-gray-500 space-y-1">
          <p>* 사업자등록번호는 국세청에서 실시간 검증됩니다.</p>
          <p>* 휴폐업 상태의 사업자는 인증이 불가합니다.</p>
          <p>* 허위 정보 입력 시 서비스 이용이 제한될 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
