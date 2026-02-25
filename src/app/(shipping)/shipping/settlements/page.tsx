'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { generateShippingSettlementPDF } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/useToast';

interface Settlement {
  id: string;
  year: number;
  month: number;
  totalRevenue: number;
  totalDeductions: number;
  netAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  paidAt: string | null;
  createdAt: string;
}

interface SettlementStats {
  totalOrders: number;
  totalRevenue: number;
  totalDeductions: number;
  netRevenue: number;
  avgDeliveryFee: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  PENDING: {
    label: '정산 대기',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: '승인 완료',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: CheckCircle2,
  },
  PAID: {
    label: '지급 완료',
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: CheckCircle2,
  },
};

export default function ShippingSettlementsPage() {
  const { toast } = useToast();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettlements();
    fetchStats();
  }, [selectedYear]);

  const fetchSettlements = async () => {
    try {
      const res = await fetch(`/api/shipping/settlements?year=${selectedYear}`);
      const data = await res.json();

      if (data.success) {
        setSettlements(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/shipping/settlements/stats?year=${selectedYear}`);
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const handleDownloadStatement = async (settlementId: string) => {
    setDownloadingId(settlementId);

    try {
      const response = await fetch(`/api/shipping/settlements/${settlementId}`);
      const data = await response.json();

      if (data.success) {
        generateShippingSettlementPDF(data.data.settlement, data.data.companyInfo);
        toast({
          title: '정산 내역서가 다운로드되었습니다',
        });
      } else {
        throw new Error(data.error?.message || '다운로드 실패');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: '다운로드 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">정산 내역</h2>
          <p className="text-sm text-gray-600 mt-1">월별 배송 수수료 정산 현황</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}년
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 연간 통계 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-600">총 주문 건수</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-600">총 수익</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              ₩{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">총 공제액</p>
            </div>
            <p className="text-2xl font-bold text-red-900">
              ₩{stats.totalDeductions.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 mt-1">
              파손/분실 배상금 포함
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-600">순 정산액</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              ₩{stats.netRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* 정산 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-blue-900 mb-1">정산 안내</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 매월 말일 기준으로 익월 15일에 정산금이 지급됩니다</li>
              <li>• 배송 수수료 = 주문 건당 배송료 × 배송 건수</li>
              <li>• 파손/분실 배상금은 정산금에서 자동 공제됩니다</li>
              <li>• 정산 내역서는 PDF로 다운로드 가능합니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 월별 정산 내역 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정산월
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 수익
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공제액
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  순 정산액
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지급일
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">{selectedYear}년 정산 내역이 없습니다</p>
                  </td>
                </tr>
              ) : (
                settlements.map((settlement) => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {settlement.year}년 {settlement.month}월
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        ₩{settlement.totalRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-red-600">
                        -₩{settlement.totalDeductions.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-green-600">
                        ₩{settlement.netAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(settlement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {settlement.paidAt
                        ? formatDate(settlement.paidAt, 'ko')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDownloadStatement(settlement.id)}
                        disabled={downloadingId === settlement.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingId === settlement.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            내역서
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주의사항 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 mb-1">주의사항</p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• 파손률 1% 이상 또는 분실률 0.5% 이상 시 해당 월 수익의 10%가 추가 공제됩니다</li>
              <li>• 정시 배송률 95% 미만 시 페널티가 부과될 수 있습니다</li>
              <li>• 보증금 잔액이 부족할 경우 정산금에서 자동 차감됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
