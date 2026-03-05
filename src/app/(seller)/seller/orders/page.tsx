'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Loader2,
  Eye,
  Edit,
  ShoppingBag,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalKRW: number;
  totalCNY: number;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  confirmedAt: string | null;
  buyer: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  post: {
    id: string;
    title: string;
    images: string[];
  };
  shipping: {
    recipientName: string;
    recipientPhone: string;
    address: string;
    addressDetail: string;
  };
}

const STATUS_LABELS: Record<string, { ko: string; zh: string; color: string }> = {
  PENDING_PAYMENT: { ko: '결제 대기', zh: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { ko: '결제 완료', zh: '已付款', color: 'bg-blue-100 text-blue-800' },
  SHIPPING: { ko: '배송 중', zh: '配送中', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { ko: '배송 완료', zh: '已送达', color: 'bg-green-100 text-green-800' },
  CONFIRMED: { ko: '구매 확정', zh: '已确认', color: 'bg-gray-100 text-gray-800' },
  DISPUTED: { ko: '분쟁 중', zh: '争议中', color: 'bg-red-100 text-red-800' },
  CANCELLED: { ko: '취소됨', zh: '已取消', color: 'bg-red-100 text-red-800' },
};

interface ShippingModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (trackingNumber: string) => void;
  loading: boolean;
}

function ShippingModal({ order, onClose, onConfirm, loading }: ShippingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('');

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">배송 처리</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* 주문 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div>
              <span className="text-gray-600">주문번호:</span>
              <span className="ml-2 font-medium">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">구매자:</span>
              <span className="ml-2 font-medium">{order.buyer.nickname}</span>
            </div>
            <div>
              <span className="text-gray-600">상품:</span>
              <span className="ml-2 font-medium">{order.post.title}</span>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
            <h3 className="font-semibold text-blue-900">배송지 정보</h3>
            <div>
              <span className="text-blue-700">받는 분:</span>
              <span className="ml-2 font-medium">{order.shipping.recipientName}</span>
            </div>
            <div>
              <span className="text-blue-700">연락처:</span>
              <span className="ml-2 font-medium">{order.shipping.recipientPhone}</span>
            </div>
            <div>
              <span className="text-blue-700">주소:</span>
              <span className="ml-2 font-medium">
                {order.shipping.address} {order.shipping.addressDetail}
              </span>
            </div>
          </div>

          {/* 송장번호 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">송장번호 *</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="송장번호를 입력하세요"
              autoFocus
            />
          </div>
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
            onClick={() => onConfirm(trackingNumber)}
            disabled={loading || !trackingNumber}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>처리 중...</span>
              </>
            ) : (
              <span>배송 시작</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CONFIRMED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, paid: 0, shipping: 0, delivered: 0 });

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sellerOrders', 'true');

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.data.orders || []);

        // 통계 계산
        const allRes = await fetch('/api/orders?sellerOrders=true&limit=1000');
        const allData = await allRes.json();
        if (allData.success) {
          const all = allData.data.orders;
          setStats({
            total: all.length,
            paid: all.filter((o: Order) => o.status === 'PAID').length,
            shipping: all.filter((o: Order) => o.status === 'SHIPPING').length,
            delivered: all.filter((o: Order) => o.status === 'DELIVERED').length,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async (trackingNumber: string) => {
    if (!selectedOrder) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/ship`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      });

      const data = await res.json();

      if (data.success) {
        setSelectedOrder(null);
        fetchOrders();
      } else {
        alert(data.error?.message || '배송 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Ship error:', error);
      alert('서버 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.buyer.nickname.toLowerCase().includes(query) ||
      order.post.title.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container-app py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">주문 관리</h1>
        <p className="text-gray-600 mt-1">판매 주문을 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">전체 주문</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">발송 대기</p>
              <p className="text-2xl font-bold text-blue-800">{stats.paid}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">배송 중</p>
              <p className="text-2xl font-bold text-purple-800">{stats.shipping}</p>
            </div>
            <Truck className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">배송 완료</p>
              <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['all', 'PAID', 'SHIPPING', 'DELIVERED', 'CONFIRMED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? '전체' : STATUS_LABELS[f].ko}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주문번호, 구매자, 상품명 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 주문 목록 */}
      <div className="bg-white rounded-lg shadow-sm border">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchQuery ? '검색 결과가 없습니다.' : '주문이 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* 상품 이미지 */}
                  <div className="relative w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {order.post.images[0] ? (
                      <Image
                        src={order.post.images[0]}
                        alt={order.post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 주문 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">주문번호: {order.orderNumber}</p>
                        <h3 className="font-semibold text-lg mb-1">{order.post.title}</h3>
                        <p className="text-sm text-gray-600">구매자: {order.buyer.nickname}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          STATUS_LABELS[order.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[order.status]?.ko || order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">주문금액:</span>{' '}
                        ₩{order.totalKRW.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">주문일:</span>{' '}
                        {formatDate(order.createdAt, 'ko')}
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <span className="font-medium">송장번호:</span> {order.trackingNumber}
                        </div>
                      )}
                      {order.shippedAt && (
                        <div>
                          <span className="font-medium">발송일:</span>{' '}
                          {formatDate(order.shippedAt, 'ko')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>상세보기</span>
                        </button>
                      </Link>

                      {order.status === 'PAID' && (
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-700"
                        >
                          <Truck className="w-4 h-4" />
                          <span>배송 처리</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 배송 처리 모달 */}
      {selectedOrder && (
        <ShippingModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirm={handleShip}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
