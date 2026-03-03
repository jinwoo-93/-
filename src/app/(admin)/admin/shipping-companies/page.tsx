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
  Edit,
  Pause,
  Play,
  DollarSign,
  Award,
  TrendingUp,
  FileText,
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

// 배송업체 상세 모달
interface DetailModalProps {
  company: ShippingCompany;
  onClose: () => void;
  onUpdate: () => void;
}

function DetailModal({ company, onClose, onUpdate }: DetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    depositBalance: company.depositBalance,
    hasExcellentBadge: company.hasExcellentBadge,
  });

  const handleSuspend = async () => {
    if (!confirm('이 배송업체를 일시 정지하시겠습니까?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suspend' }),
      });

      const data = await res.json();
      if (data.success) {
        alert('배송업체가 일시 정지되었습니다.');
        onUpdate();
        onClose();
      } else {
        alert(data.error?.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!confirm('이 배송업체를 다시 활성화하시겠습니까?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate' }),
      });

      const data = await res.json();
      if (data.success) {
        alert('배송업체가 활성화되었습니다.');
        onUpdate();
        onClose();
      } else {
        alert(data.error?.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipping-companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          depositBalance: formData.depositBalance,
          hasExcellentBadge: formData.hasExcellentBadge,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('배송업체 정보가 수정되었습니다.');
        setEditMode(false);
        onUpdate();
      } else {
        alert(data.error?.message || '오류가 발생했습니다.');
      }
    } catch (error) {
      console.error(error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Truck className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  <span className="text-gray-600">({company.nameZh})</span>
                  {company.hasExcellentBadge && (
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      <Star className="w-4 h-4" />
                      우수업체
                    </span>
                  )}
                  {!company.isVerified && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      승인대기
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {company.isVerified
                    ? `승인일: ${new Date(company.verifiedAt!).toLocaleDateString()}`
                    : '미승인 상태'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              기본 정보
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">신청자</p>
                <p className="font-medium">{company.user?.name || company.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">연락처</p>
                <p className="font-medium">{company.user?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">이메일</p>
                <p className="font-medium">{company.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">등록일</p>
                <p className="font-medium">{new Date(company.user!.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* 서비스 노선 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              서비스 노선
            </h3>
            <div className="flex flex-wrap gap-2">
              {company.serviceRoutes.map((route: any, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {route.from} → {route.to}
                </span>
              ))}
            </div>
          </div>

          {/* 요금 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              요금 정보
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">kg당 가격</p>
                <p className="font-medium">₩{company.pricePerKg?.toLocaleString() || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">최소 배송비</p>
                <p className="font-medium">₩{company.minimumFee?.toLocaleString() || '-'}</p>
              </div>
            </div>
          </div>

          {/* 보증금 및 배지 관리 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" />
              보증금 및 배지 관리
            </h3>
            {editMode ? (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-2">보증금 잔액</label>
                  <input
                    type="number"
                    value={formData.depositBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, depositBalance: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="excellentBadge"
                    checked={formData.hasExcellentBadge}
                    onChange={(e) =>
                      setFormData({ ...formData, hasExcellentBadge: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="excellentBadge" className="text-sm font-medium">
                    우수업체 배지 부여
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">보증금 잔액</p>
                    <p className="text-xl font-bold">₩{company.depositBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      초기 보증금: ₩{company.depositAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">우수업체 배지</p>
                    <p className="text-lg font-semibold">
                      {company.hasExcellentBadge ? (
                        <span className="text-blue-600">✓ 부여됨</span>
                      ) : (
                        <span className="text-gray-400">미부여</span>
                      )}
                    </p>
                  </div>
                </div>
                {company.isVerified && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    수정
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 품질 지표 */}
          {company.isVerified && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                품질 지표
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">총 배송 건수</p>
                  <p className="text-2xl font-bold">{company.totalShipments.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">평균 평점</p>
                  <p className="text-2xl font-bold">{company.averageRating.toFixed(1)}★</p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    company.damageRate < 1 ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p
                    className={`text-sm mb-1 ${
                      company.damageRate < 1 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    파손률
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      company.damageRate < 1 ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {company.damageRate.toFixed(2)}%
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    company.lossRate < 0.5 ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p
                    className={`text-sm mb-1 ${
                      company.lossRate < 0.5 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    분실률
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      company.lossRate < 0.5 ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {company.lossRate.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">정시 배송률</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full"
                      style={{ width: `${company.onTimeRate}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-blue-800">
                    {company.onTimeRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 사업자 등록증 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              사업자 등록증
            </h3>
            <a
              href={company.businessLicenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <FileText className="w-4 h-4" />
              사업자 등록증 보기
            </a>
          </div>

          {/* 정산 내역 링크 */}
          {company.isVerified && (
            <div>
              <h3 className="text-lg font-semibold mb-3">정산 관리</h3>
              <Link
                href="/admin/settlements?tab=shipping"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <DollarSign className="w-4 h-4" />
                정산 내역 보기
              </Link>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {company.isVerified && (
          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={handleSuspend}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Pause className="w-4 h-4" />
              일시 정지
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              닫기
            </button>
          </div>
        )}
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
  const [detailCompany, setDetailCompany] = useState<ShippingCompany | null>(null);
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
                      <>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          승인됨
                        </span>
                        <button
                          onClick={() => setDetailCompany(company)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>상세</span>
                        </button>
                      </>
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

      {/* 상세 모달 */}
      {detailCompany && (
        <DetailModal
          company={detailCompany}
          onClose={() => setDetailCompany(null)}
          onUpdate={fetchCompanies}
        />
      )}
    </div>
  );
}
