'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Package,
  User,
  DollarSign,
  Calendar,
  Truck,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface OrderDetailModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const statusMap: Record<string, { ko: string; color: string }> = {
  PENDING_PAYMENT: { ko: '결제대기', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { ko: '결제완료', color: 'bg-blue-100 text-blue-800' },
  SHIPPING: { ko: '배송중', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { ko: '배송완료', color: 'bg-green-100 text-green-800' },
  CONFIRMED: { ko: '구매확정', color: 'bg-emerald-100 text-emerald-800' },
  DISPUTED: { ko: '분쟁중', color: 'bg-orange-100 text-orange-800' },
  CANCELLED: { ko: '취소', color: 'bg-gray-100 text-gray-800' },
  REFUNDED: { ko: '환불완료', color: 'bg-red-100 text-red-800' },
};

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onUpdate,
}: OrderDetailModalProps) {
  const { language } = useLanguage();
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // 수정 폼 상태
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompanyId, setShippingCompanyId] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetail();
    }
  }, [orderId, isOpen]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrderData(data.data);
        setTrackingNumber(data.data.trackingNumber || '');
        setShippingCompanyId(data.data.shippingCompanyId || '');
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!orderId) return;

    const confirmMessage =
      newStatus === 'SHIPPING' ? '배송 시작 처리하시겠습니까?' :
      newStatus === 'DELIVERED' ? '배송 완료 처리하시겠습니까?' :
      newStatus === 'CONFIRMED' ? '구매 확정 처리하시겠습니까?' :
      newStatus === 'CANCELLED' ? '주문을 취소하시겠습니까?' :
      newStatus === 'REFUNDED' ? '환불 처리하시겠습니까?' :
      '상태를 변경하시겠습니까?';

    if (!confirm(confirmMessage)) return;

    setIsUpdating(true);
    try {
      const body: any = { status: newStatus };

      if (newStatus === 'REFUNDED' && refundReason) {
        body.refundReason = refundReason;
      }

      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert('상태가 변경되었습니다.');
        fetchOrderDetail();
        onUpdate?.();
      } else {
        alert('상태 변경 실패: ' + data.error.message);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShippingUpdate = async () => {
    if (!orderId) return;
    if (!trackingNumber) {
      alert('송장번호를 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          shippingCompanyId: shippingCompanyId || undefined,
          status: 'SHIPPING', // 배송 정보 입력 시 자동으로 배송중 상태로 변경
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('배송 정보가 업데이트되었습니다.');
        fetchOrderDetail();
        onUpdate?.();
      } else {
        alert('업데이트 실패: ' + data.error.message);
      }
    } catch (error) {
      console.error('Failed to update shipping info:', error);
      alert('업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>주문 상세 정보</DialogTitle>
          <DialogDescription>
            주문 번호: {orderData?.orderNumber || '-'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orderData ? (
          <div className="space-y-6">
            {/* 상태 및 빠른 액션 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>주문 상태</span>
                  <Badge className={statusMap[orderData.status]?.color || ''}>
                    {statusMap[orderData.status]?.ko || orderData.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {orderData.status === 'PAID' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('SHIPPING')}
                      disabled={isUpdating}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      배송 시작
                    </Button>
                  )}
                  {orderData.status === 'SHIPPING' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('DELIVERED')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      배송 완료
                    </Button>
                  )}
                  {orderData.status === 'DELIVERED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange('CONFIRMED')}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      구매 확정
                    </Button>
                  )}
                  {['PENDING_PAYMENT', 'PAID'].includes(orderData.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange('CANCELLED')}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      주문 취소
                    </Button>
                  )}
                  {['PAID', 'SHIPPING', 'DELIVERED'].includes(orderData.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const reason = prompt('환불 사유를 입력해주세요:');
                        if (reason) {
                          setRefundReason(reason);
                          handleStatusChange('REFUNDED');
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      환불 처리
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 주문 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 구매자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    구매자 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">닉네임</span>
                    <span className="font-medium">{orderData.buyer.nickname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일</span>
                    <span className="font-medium">{orderData.buyer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">국가</span>
                    <span className="font-medium">
                      {orderData.buyer.country === 'KR' ? '🇰🇷 한국' : '🇨🇳 중국'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 판매자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    판매자 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">닉네임</span>
                    <span className="font-medium">{orderData.seller.nickname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">이메일</span>
                    <span className="font-medium">{orderData.seller.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">국가</span>
                    <span className="font-medium">
                      {orderData.seller.country === 'KR' ? '🇰🇷 한국' : '🇨🇳 중국'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상품 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  상품 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {orderData.post.images[0] && (
                    <div className="relative w-20 h-20">
                      <Image
                        src={orderData.post.images[0]}
                        alt={orderData.post.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium mb-2">{orderData.post.title}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">수량: </span>
                        <span className="font-medium">{orderData.quantity}개</span>
                      </div>
                      <div>
                        <span className="text-gray-600">상품 금액: </span>
                        <span className="font-medium">{formatCurrency(orderData.itemPriceKRW)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 결제 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상품 금액</span>
                  <span>{formatCurrency(orderData.itemPriceKRW)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배송비</span>
                  <span>{formatCurrency(orderData.shippingFeeKRW)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">플랫폼 수수료 ({(orderData.feeRate * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(orderData.platformFeeKRW)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-bold">
                  <span>총 결제 금액</span>
                  <span className="text-lg">{formatCurrency(orderData.totalKRW)}</span>
                </div>
                {orderData.paidAt && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>결제 일시</span>
                    <span>{formatDate(orderData.paidAt, language)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 배송 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  배송 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="trackingNumber">송장번호</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="송장번호 입력"
                    />
                  </div>
                  {orderData.shippingCompany && (
                    <div className="text-sm">
                      <span className="text-gray-600">배송업체: </span>
                      <span className="font-medium">{orderData.shippingCompany.name}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleShippingUpdate}
                    disabled={isUpdating || !trackingNumber}
                    className="w-full"
                  >
                    {isUpdating ? '처리 중...' : '배송 정보 저장 및 배송 시작'}
                  </Button>
                </div>

                {orderData.receiverName && (
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">받는 사람</span>
                      <span className="font-medium">{orderData.receiverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">연락처</span>
                      <span className="font-medium">{orderData.receiverPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">주소</span>
                      <span className="font-medium text-right">
                        {orderData.receiverAddress}
                        {orderData.receiverAddressDetail && `, ${orderData.receiverAddressDetail}`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 주문 일시 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  주문 일시
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문 생성</span>
                  <span>{formatDate(orderData.createdAt, language)}</span>
                </div>
                {orderData.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제 완료</span>
                    <span>{formatDate(orderData.paidAt, language)}</span>
                  </div>
                )}
                {orderData.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송 시작</span>
                    <span>{formatDate(orderData.shippedAt, language)}</span>
                  </div>
                )}
                {orderData.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">배송 완료</span>
                    <span>{formatDate(orderData.deliveredAt, language)}</span>
                  </div>
                )}
                {orderData.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">구매 확정</span>
                    <span>{formatDate(orderData.confirmedAt, language)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">주문 정보를 불러올 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
