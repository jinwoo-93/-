'use client';

import { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Loader2,
  AlertCircle,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface ShippingCompany {
  id: string;
  name: string;
  nameZh: string;
  logo: string | null;
  businessLicenseUrl: string;
  isVerified: boolean;
  verifiedAt: string | null;
  serviceRoutes: { from: string; to: string }[];
  pricePerKg: number | null;
  minimumFee: number | null;
  depositAmount: number;
  depositBalance: number;
  totalShipments: number;
  damageRate: number;
  lossRate: number;
  onTimeRate: number;
  averageRating: number;
  hasExcellentBadge: boolean;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    createdAt: string;
  } | null;
}

interface ApprovalModalProps {
  company: ShippingCompany | null;
  onClose: () => void;
  onConfirm: (action: 'approve' | 'reject', reason?: string) => void;
  loading: boolean;
}

function ApprovalModal({ company, onClose, onConfirm, loading }: ApprovalModalProps) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');

  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">배송업체 승인 처리</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* 업체 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-sm text-gray-600">{company.nameZh}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">신청자:</span>
                <span className="ml-2 font-medium">{company.user?.name || company.user?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">연락처:</span>
                <span className="ml-2 font-medium">{company.user?.phone || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">보증금:</span>
                <span className="ml-2 font-medium">₩{company.depositAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">kg당 가격:</span>
                <span className="ml-2 font-medium">
                  {company.pricePerKg ? `₩${company.pricePerKg.toLocaleString()}` : '-'}
                </span>
              </div>
            </div>

            {/* 서비스 노선 */}
            <div>
              <span className="text-sm text-gray-600">서비스 노선:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {company.serviceRoutes.map((route: any, idx: number) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {route.from} → {route.to}
                  </span>
                ))}
              </div>
            </div>

            {/* 사업자등록증 */}
            <div>
              <span className="text-sm text-gray-600">사업자등록증:</span>
              <a
                href={company.businessLicenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:underline text-sm"
              >
                문서 확인 →
              </a>
            </div>
          </div>

          {/* 액션 선택 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">처리 유형</label>
            <div className="flex gap-3">
              <button
                onClick={() => setAction('approve')}
                className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 ${
                  action === 'approve'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">승인</span>
              </button>
              <button
                onClick={() => setAction('reject')}
                className={`flex-1 p-4 border rounded-lg flex items-center justify-center gap-2 ${
                  action === 'reject'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span className="font-medium">거부</span>
              </button>
            </div>
          </div>

          {/* 거부 사유 */}
          {action === 'reject' && (
            <div>
              <label className="block text-sm font-medium mb-2">거부 사유 (선택)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="거부 사유를 입력하세요..."
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(action, reason)}
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
              action === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <span>{action === 'approve' ? '승인하기' : '거부하기'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShippingCompaniesPage() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<ShippingCompany | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-companies?status=${filter}`);
      const data = await res.json();

      if (data.success) {
        setCompanies(data.data.companies);

        // 통계 계산
        const allRes = await fetch('/api/admin/shipping-companies?status=all');
        const allData = await allRes.json();
        if (allData.success) {
          const all = allData.data.companies;
          setStats({
            total: all.length,
            pending: all.filter((c: ShippingCompany) => !c.isVerified).length,
            verified: all.filter((c: ShippingCompany) => c.isVerified).length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject', reason?: string) => {
    if (!selectedCompany) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-companies/${selectedCompany.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();

      if (data.success) {
        setSelectedCompany(null);
        fetchCompanies();
      } else {
        alert(data.error?.message || '처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Approval error:', error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      company.nameZh.toLowerCase().includes(query) ||
      company.user?.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">배송업체 관리</h1>
        <p className="text-gray-600 mt-1">배송업체 등록 신청을 승인하거나 거부합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 업체</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Truck className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">승인 대기</p>
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">승인 완료</p>
              <p className="text-2xl font-bold text-green-800">{stats.verified}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['all', 'pending', 'verified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '전체' : f === 'pending' ? '승인 대기' : '승인 완료'}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="업체명, 이메일 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 배송업체 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">배송업체가 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Truck className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        <span className="text-gray-600">({company.nameZh})</span>
                        {company.hasExcellentBadge && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            <Star className="w-3 h-3" />
                            우수
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">신청자:</span>{' '}
                          {company.user?.name || company.user?.email}
                        </div>
                        <div>
                          <span className="font-medium">보증금:</span>{' '}
                          ₩{company.depositBalance.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">배송 건수:</span>{' '}
                          {company.totalShipments.toLocaleString()}건
                        </div>
                        <div>
                          <span className="font-medium">평점:</span>{' '}
                          {company.averageRating.toFixed(1)}★
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {company.serviceRoutes.map((route: any, idx: number) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                          >
                            {route.from} → {route.to}
                          </span>
                        ))}
                      </div>

                      {/* 품질 지표 */}
                      {company.isVerified && (
                        <div className="mt-2 flex gap-4 text-xs">
                          <span className={company.damageRate < 1 ? 'text-green-600' : 'text-red-600'}>
                            파손률: {company.damageRate.toFixed(2)}%
                          </span>
                          <span className={company.lossRate < 0.5 ? 'text-green-600' : 'text-red-600'}>
                            분실률: {company.lossRate.toFixed(2)}%
                          </span>
                          <span className="text-blue-600">
                            정시 배송률: {company.onTimeRate.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {company.isVerified ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        승인됨
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedCompany(company)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>검토</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 승인 모달 */}
      {selectedCompany && (
        <ApprovalModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onConfirm={handleApproval}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
