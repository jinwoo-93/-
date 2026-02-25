'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ServiceRoute {
  from: 'KR' | 'CN';
  to: 'KR' | 'CN';
}

interface FormData {
  name: string;
  nameZh: string;
  logo: string;
  description: string;
  businessLicenseUrl: string;
  serviceRoutes: ServiceRoute[];
  pricePerKg: string;
  minimumFee: string;
  depositAmount: string;
  apiProvider: string;
  apiKey: string;
}

export default function ShippingRegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingCompany, setExistingCompany] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    nameZh: '',
    logo: '',
    description: '',
    businessLicenseUrl: '',
    serviceRoutes: [{ from: 'KR', to: 'CN' }],
    pricePerKg: '',
    minimumFee: '',
    depositAmount: '1000000',
    apiProvider: '',
    apiKey: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/shipping/register');
    }

    if (status === 'authenticated' && session?.user) {
      // UserType 확인
      if (session.user.userType !== 'SHIPPING') {
        router.push('/');
        return;
      }

      // 기존 배송업체 정보 조회
      fetchExistingCompany();
    }
  }, [status, session, router]);

  const fetchExistingCompany = async () => {
    try {
      const res = await fetch('/api/shipping/register');
      const data = await res.json();

      if (data.success && data.data) {
        setExistingCompany(data.data);
        // 폼 데이터 채우기
        setFormData({
          name: data.data.name || '',
          nameZh: data.data.nameZh || '',
          logo: data.data.logo || '',
          description: data.data.description || '',
          businessLicenseUrl: data.data.businessLicenseUrl || '',
          serviceRoutes: data.data.serviceRoutes || [{ from: 'KR', to: 'CN' }],
          pricePerKg: data.data.pricePerKg?.toString() || '',
          minimumFee: data.data.minimumFee?.toString() || '',
          depositAmount: data.data.depositAmount?.toString() || '1000000',
          apiProvider: data.data.apiProvider || '',
          apiKey: data.data.apiKey || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch existing company:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 유효성 검사
      if (!formData.name || !formData.nameZh) {
        setError('회사명을 모두 입력해주세요.');
        setLoading(false);
        return;
      }

      if (!formData.businessLicenseUrl) {
        setError('사업자등록증을 업로드해주세요.');
        setLoading(false);
        return;
      }

      if (formData.serviceRoutes.length === 0) {
        setError('최소 1개 이상의 서비스 노선을 추가해주세요.');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        nameZh: formData.nameZh,
        logo: formData.logo || undefined,
        description: formData.description || undefined,
        businessLicenseUrl: formData.businessLicenseUrl,
        serviceRoutes: formData.serviceRoutes,
        pricePerKg: formData.pricePerKg ? parseInt(formData.pricePerKg) : undefined,
        minimumFee: formData.minimumFee ? parseInt(formData.minimumFee) : undefined,
        depositAmount: parseInt(formData.depositAmount),
        apiProvider: formData.apiProvider || undefined,
        apiKey: formData.apiKey || undefined,
      };

      const method = existingCompany ? 'PATCH' : 'POST';
      const res = await fetch('/api/shipping/register', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error?.message || '등록에 실패했습니다.');
        setLoading(false);
        return;
      }

      setSuccess(
        existingCompany
          ? '배송업체 정보가 수정되었습니다.'
          : '배송업체 등록이 완료되었습니다. 관리자 승인 후 이용 가능합니다.'
      );
      setExistingCompany(data.data);

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        router.push('/shipping/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Submit error:', error);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addRoute = () => {
    setFormData({
      ...formData,
      serviceRoutes: [...formData.serviceRoutes, { from: 'KR', to: 'CN' }],
    });
  };

  const removeRoute = (index: number) => {
    setFormData({
      ...formData,
      serviceRoutes: formData.serviceRoutes.filter((_, i) => i !== index),
    });
  };

  const updateRoute = (index: number, field: 'from' | 'to', value: 'KR' | 'CN') => {
    const newRoutes = [...formData.serviceRoutes];
    newRoutes[index][field] = value;
    setFormData({ ...formData, serviceRoutes: newRoutes });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6">
          <Link
            href="/shipping/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>대시보드로 돌아가기</span>
          </Link>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {existingCompany ? '배송업체 정보 수정' : '배송업체 등록'}
              </h1>
              <p className="text-gray-600 mt-1">
                {existingCompany
                  ? '배송업체 정보를 수정합니다.'
                  : '새로운 배송업체를 등록합니다. 관리자 승인 후 이용 가능합니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 승인 상태 */}
        {existingCompany && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              existingCompany.isVerified
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            {existingCompany.isVerified ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">승인 완료</p>
                  <p className="text-sm text-green-700">
                    배송업체가 승인되어 서비스 이용이 가능합니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">승인 대기 중</p>
                  <p className="text-sm text-yellow-700">
                    관리자 승인을 기다리고 있습니다. 승인되면 이메일로 알려드립니다.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-900">{success}</p>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회사명 (한국어) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 직구역구 배송"
                    required
                    disabled={existingCompany?.isVerified}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    公司名称 (中文) *
                  </label>
                  <input
                    type="text"
                    value={formData.nameZh}
                    onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="例: 直购逆购配送"
                    required
                    disabled={existingCompany?.isVerified}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">로고 URL</label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">회사 소개</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="회사 소개를 작성해주세요."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업자등록증 URL *
                </label>
                <input
                  type="url"
                  value={formData.businessLicenseUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, businessLicenseUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/license.pdf"
                  required
                  disabled={existingCompany?.isVerified}
                />
                <p className="text-sm text-gray-500 mt-1">
                  사업자등록증을 업로드하고 URL을 입력해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 서비스 노선 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">서비스 노선</h2>
            <div className="space-y-3">
              {formData.serviceRoutes.map((route, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    value={route.from}
                    onChange={(e) => updateRoute(index, 'from', e.target.value as 'KR' | 'CN')}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={existingCompany?.isVerified}
                  >
                    <option value="KR">한국 (KR)</option>
                    <option value="CN">중국 (CN)</option>
                  </select>
                  <span className="text-gray-500">→</span>
                  <select
                    value={route.to}
                    onChange={(e) => updateRoute(index, 'to', e.target.value as 'KR' | 'CN')}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={existingCompany?.isVerified}
                  >
                    <option value="KR">한국 (KR)</option>
                    <option value="CN">중국 (CN)</option>
                  </select>
                  {!existingCompany?.isVerified && (
                    <button
                      type="button"
                      onClick={() => removeRoute(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={formData.serviceRoutes.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {!existingCompany?.isVerified && (
                <button
                  type="button"
                  onClick={addRoute}
                  className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>노선 추가</span>
                </button>
              )}
            </div>
          </div>

          {/* 가격 정보 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">가격 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  kg당 가격 (KRW)
                </label>
                <input
                  type="number"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10000"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최소 배송비 (KRW)
                </label>
                <input
                  type="number"
                  value={formData.minimumFee}
                  onChange={(e) => setFormData({ ...formData, minimumFee: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* 보증금 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">보증금</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예치 보증금 (KRW) *
              </label>
              <input
                type="number"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1000000"
                required
                disabled={existingCompany?.isVerified}
              />
              <p className="text-sm text-gray-500 mt-1">
                최소 100만원 이상이어야 합니다. 파손/분실 시 보증금에서 차감됩니다.
              </p>
            </div>
          </div>

          {/* API 연동 (선택사항) */}
          <div>
            <h2 className="text-lg font-semibold mb-4">API 연동 (선택사항)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API 제공업체
                </label>
                <select
                  value={formData.apiProvider}
                  onChange={(e) => setFormData({ ...formData, apiProvider: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택 안 함</option>
                  <option value="smartparcel">SmartParcel</option>
                  <option value="sfexpress">SF Express</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API 키</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="API 키를 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>처리 중...</span>
                </>
              ) : (
                <span>{existingCompany ? '정보 수정' : '등록 신청'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
