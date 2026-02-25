'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  Truck,
} from 'lucide-react';
import Link from 'next/link';

interface ShippingCompany {
  id: string;
  name: string;
  nameZh: string;
  isVerified: boolean;
  depositBalance: number;
  totalShipments: number;
  damageRate: number;
  lossRate: number;
  onTimeRate: number;
  averageRating: number;
  hasExcellentBadge: boolean;
}

export default function ShippingDashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<ShippingCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await fetch('/api/shipping/register');
      const data = await res.json();

      if (data.success && data.data) {
        setCompany(data.data);
      } else {
        // 등록된 배송업체가 없으면 등록 페이지로 이동
        router.push('/shipping/register');
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">등록된 배송업체가 없습니다.</p>
        <Link
          href="/shipping/register"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          배송업체 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 승인 상태 알림 */}
      {!company.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-900">승인 대기 중</p>
            <p className="text-sm text-yellow-700">
              관리자 승인을 기다리고 있습니다. 승인되면 이메일로 알려드립니다.
            </p>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            <p className="text-gray-600">{company.nameZh}</p>
          </div>
          <div className="flex items-center gap-2">
            {company.isVerified && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                인증됨
              </span>
            )}
            {company.hasExcellentBadge && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" />
                우수배송
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 총 배송 건수 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">총 배송 건수</p>
          <p className="text-2xl font-bold text-gray-900">{company.totalShipments.toLocaleString()}</p>
        </div>

        {/* 평균 평점 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">평균 평점</p>
          <p className="text-2xl font-bold text-gray-900">{company.averageRating.toFixed(1)}</p>
        </div>

        {/* 정시 배송률 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">정시 배송률</p>
          <p className="text-2xl font-bold text-gray-900">{company.onTimeRate.toFixed(1)}%</p>
        </div>

        {/* 보증금 잔액 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">보증금 잔액</p>
          <p className="text-2xl font-bold text-gray-900">
            ₩{company.depositBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 품질 지표 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">품질 지표</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 파손률 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">파손률</span>
              <span
                className={`text-sm font-medium ${
                  company.damageRate < 1 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {company.damageRate.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  company.damageRate < 1 ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(company.damageRate * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* 분실률 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">분실률</span>
              <span
                className={`text-sm font-medium ${
                  company.lossRate < 0.5 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {company.lossRate.toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  company.lossRate < 0.5 ? 'bg-green-600' : 'bg-red-600'
                }`}
                style={{ width: `${Math.min(company.lossRate * 20, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 경고 메시지 */}
        {(company.damageRate >= 1 || company.lossRate >= 0.5) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">주의 필요</p>
              <p className="text-sm text-red-700">
                파손률 또는 분실률이 기준치를 초과했습니다. 보증금 차감이 발생할 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/shipping/register"
          className="bg-white rounded-lg shadow-sm border p-6 hover:border-blue-500 transition-colors"
        >
          <Package className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">업체 정보 관리</h3>
          <p className="text-sm text-gray-600">배송업체 정보를 수정합니다.</p>
        </Link>

        <Link
          href="/shipping/orders"
          className="bg-white rounded-lg shadow-sm border p-6 hover:border-blue-500 transition-colors"
        >
          <Truck className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">배송 관리</h3>
          <p className="text-sm text-gray-600">배송 현황을 확인하고 관리합니다.</p>
        </Link>

        <Link
          href="/shipping/settlements"
          className="bg-white rounded-lg shadow-sm border p-6 hover:border-blue-500 transition-colors"
        >
          <DollarSign className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-1">정산 내역</h3>
          <p className="text-sm text-gray-600">월별 정산 내역을 확인합니다.</p>
        </Link>
      </div>
    </div>
  );
}
