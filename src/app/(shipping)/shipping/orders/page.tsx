'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  MapPin,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalKRW: number;
  totalCNY: number;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingNumber: string | null;
  buyer: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  seller: {
    id: string;
    nickname: string;
  };
  post: {
    id: string;
    title: string;
    images: string[];
  };
  shippingAddress: {
    name: string;
    phone: string;
    address1: string;
    address2: string | null;
    city: string;
    postalCode: string;
    country: string;
  } | null;
  quantity: number;
}

const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: '전체', labelZh: '全部' },
  { value: 'PAID', label: '결제완료', labelZh: '已付款' },
  { value: 'SHIPPING', label: '배송중', labelZh: '配送中' },
  { value: 'DELIVERED', label: '배송완료', labelZh: '已送达' },
  { value: 'CONFIRMED', label: '구매확정', labelZh: '已确认' },
];

const STATUS_BADGE_CONFIG: Record<string, { bg: string; text: string; icon: any }> = {
  PAID: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
  SHIPPING: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Truck },
  DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
  CONFIRMED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle2 },
};

export default function ShippingOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/shipping/orders');
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.buyer.nickname.toLowerCase().includes(query) ||
          order.post.title.toLowerCase().includes(query) ||
          order.trackingNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.PAID;
    const Icon = config.icon;
    const statusLabel = ORDER_STATUS_OPTIONS.find((s) => s.value === status);

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {statusLabel?.label || status}
      </span>
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">배송 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            배송업체에 배정된 주문을 관리합니다
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-gray-600 mb-1">전체 주문</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-4">
          <p className="text-sm text-blue-600 mb-1">결제완료</p>
          <p className="text-2xl font-bold text-blue-900">
            {orders.filter((o) => o.status === 'PAID').length}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-4">
          <p className="text-sm text-amber-600 mb-1">배송중</p>
          <p className="text-2xl font-bold text-amber-900">
            {orders.filter((o) => o.status === 'SHIPPING').length}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">배송완료</p>
          <p className="text-2xl font-bold text-green-900">
            {orders.filter((o) => o.status === 'DELIVERED').length}
          </p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="주문번호, 구매자, 상품명, 운송장번호로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 주문 목록 */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all'
              ? '검색 결과가 없습니다'
              : '배정된 주문이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* 주문 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      주문번호: {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(order.createdAt, 'ko')}
                  </span>
                </div>

                {/* 상품 정보 */}
                <div className="flex gap-4 mb-4">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {order.post.images?.[0] ? (
                      <Image
                        src={order.post.images[0]}
                        alt={order.post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1 line-clamp-1">
                      {order.post.title}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      수량: {order.quantity}개
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ₩{order.totalKRW.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 배송 정보 */}
                {order.shippingAddress && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {order.shippingAddress.name} | {order.shippingAddress.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.address1}{' '}
                          {order.shippingAddress.address2}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                        </p>
                      </div>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <p className="text-sm text-gray-900">
                          운송장번호: <span className="font-mono">{order.trackingNumber}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 구매자 정보 */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {order.buyer.profileImage ? (
                      <Image
                        src={order.buyer.profileImage}
                        alt={order.buyer.nickname}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {order.buyer.nickname.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.buyer.nickname}
                    </p>
                    <p className="text-xs text-gray-500">구매자</p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    주문 상세보기
                  </Link>
                  {order.status === 'SHIPPING' && (
                    <Link
                      href={`/shipping/track/${order.trackingNumber}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      배송 추적
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 결과 카운트 */}
      {filteredOrders.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          총 {filteredOrders.length}건의 주문
        </div>
      )}
    </div>
  );
}
