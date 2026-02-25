'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Loader2,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { generateSellerSettlementPDF } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/useToast';

interface Settlement {
  year: number;
  month: number;
  totalRevenue: number;
  totalOrders: number;
  platformFee: number;
  netAmount: number;
  status: 'pending' | 'confirmed' | 'paid';
}

export default function SellerSettlementsPage() {
  const { toast } = useToast();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSettlements();
  }, [selectedYear]);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/settlements?year=${selectedYear}`);
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

  const OLD_fetchSettlements_UNUSED = async () => {
    setLoading(true);
    try {
      // 주문 데이터에서 월별 정산 계산 (구 버전 - 사용 안함)
      const res = await fetch('/api/orders?sellerOrders=true&limit=1000');
      const data = await res.json();

      if (data.success) {
        const orders = data.data.orders.filter(
          (o: any) => o.status === 'CONFIRMED' || o.status === 'DELIVERED'
        );

        // 월별로 그룹화
        const monthlyData: Record<string, Settlement> = {};

        orders.forEach((order: any) => {
          const date = new Date(order.confirmedAt || order.deliveredAt || order.createdAt);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;

          if (year !== selectedYear) return;

          const key = `${year}-${month}`;

          if (!monthlyData[key]) {
            monthlyData[key] = {
              year,
              month,
              totalRevenue: 0,
              totalOrders: 0,
              platformFee: 0,
              netAmount: 0,
              status: month === new Date().getMonth() + 1 ? 'pending' : 'paid',
            };
          }

          monthlyData[key].totalRevenue += order.totalKRW;
          monthlyData[key].totalOrders += 1;
        });

        // 수수료 계산 (5%)
        Object.values(monthlyData).forEach((settlement) => {
          settlement.platformFee = Math.floor(settlement.totalRevenue * 0.05);
          settlement.netAmount = settlement.totalRevenue - settlement.platformFee;
        });

        setSettlements(Object.values(monthlyData).sort((a, b) => b.month - a.month));
      }
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = settlements.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalFee = settlements.reduce((sum, s) => sum + s.platformFee, 0);
  const totalNet = settlements.reduce((sum, s) => sum + s.netAmount, 0);

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  const handleDownloadPDF = async (year: number, month: number) => {
    const settlementId = `${year}-${month}`;
    setDownloadingId(settlementId);

    try {
      const response = await fetch(
        `/api/seller/settlements/${year}-${String(month).padStart(2, '0')}`
      );
      const data = await response.json();

      if (data.success) {
        generateSellerSettlementPDF(data.data.settlement, data.data.userInfo);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            정산 대기
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            승인 완료
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            지급 완료
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-app py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">정산 관리</h1>
          <p className="text-gray-600 mt-1">월별 판매 정산 내역을 확인합니다.</p>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}년
            </option>
          ))}
        </select>
      </div>

      {/* 연간 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">총 매출액</p>
          <p className="text-2xl font-bold">₩{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{selectedYear}년 누적</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">플랫폼 수수료</p>
          <p className="text-2xl font-bold text-red-600">₩{totalFee.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">매출의 5%</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">순 정산액</p>
          <p className="text-2xl font-bold text-blue-600">₩{totalNet.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">수수료 차감 후</p>
        </div>
      </div>

      {/* 정산 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">정산 안내</p>
            <ul className="space-y-1 text-blue-800">
              <li>• 정산 주기: 매월 말일 기준으로 익월 15일 지급</li>
              <li>• 플랫폼 수수료: 총 매출의 5%</li>
              <li>• 구매 확정된 주문만 정산 대상에 포함됩니다</li>
              <li>• 정산 내역서는 매월 1일에 확인 가능합니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 월별 정산 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">월별 정산 내역</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{selectedYear}년 정산 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y">
            {settlements.map((settlement) => (
              <div key={`${settlement.year}-${settlement.month}`} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {settlement.year}년 {settlement.month}월
                      </h3>
                      <p className="text-sm text-gray-600">
                        {settlement.totalOrders}건 판매
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(settlement.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-600 mb-1">총 매출</p>
                    <p className="font-semibold">₩{settlement.totalRevenue.toLocaleString()}</p>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-red-600 mb-1">플랫폼 수수료 (5%)</p>
                    <p className="font-semibold text-red-700">
                      -₩{settlement.platformFee.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-600 mb-1">순 정산액</p>
                    <p className="font-semibold text-blue-700">
                      ₩{settlement.netAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDownloadPDF(settlement.year, settlement.month)}
                      disabled={downloadingId === `${settlement.year}-${settlement.month}`}
                    >
                      {downloadingId === `${settlement.year}-${settlement.month}` ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>생성 중...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>내역서</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 참고사항 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">참고사항</p>
        <ul className="space-y-1">
          <li>• 구매 확정 후 정산 대상에 포함됩니다</li>
          <li>• 분쟁/환불 주문은 정산 대상에서 제외됩니다</li>
          <li>• 정산 내역에 대한 문의는 고객센터로 연락주세요</li>
        </ul>
      </div>
    </div>
  );
}
