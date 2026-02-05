'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    orderNumber: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsConfirming(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const result = await response.json();

        if (result.success) {
          setOrderInfo({
            orderId: result.data.orderId,
            orderNumber: result.data.orderNumber,
            amount: result.data.amount,
          });
        } else {
          setError(result.error?.message || '결제 승인에 실패했습니다.');
        }
      } catch (err) {
        setError('결제 처리 중 오류가 발생했습니다.');
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">
            {language === 'ko' ? '결제를 처리하고 있습니다...' : '正在处理付款...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">
            {language === 'ko' ? '결제 실패' : '支付失败'}
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              {language === 'ko' ? '돌아가기' : '返回'}
            </Button>
            <Link href="/help/contact">
              <Button>
                {language === 'ko' ? '문의하기' : '联系客服'}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {language === 'ko' ? '결제가 완료되었습니다!' : '支付成功！'}
        </h1>

        <p className="text-gray-600 mb-6">
          {language === 'ko'
            ? '주문이 성공적으로 처리되었습니다.'
            : '订单已成功处理。'}
        </p>

        {orderInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">
                {language === 'ko' ? '주문번호' : '订单编号'}
              </span>
              <span className="font-mono font-medium">{orderInfo.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                {language === 'ko' ? '결제금액' : '支付金额'}
              </span>
              <span className="font-semibold">
                ₩{orderInfo.amount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link href={orderInfo ? `/orders/${orderInfo.orderId}` : '/my/orders'}>
            <Button className="w-full" size="lg">
              <Package className="w-4 h-4 mr-2" />
              {language === 'ko' ? '주문 상세보기' : '查看订单详情'}
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              {language === 'ko' ? '쇼핑 계속하기' : '继续购物'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          {language === 'ko'
            ? '결제 관련 문의는 고객센터로 연락해주세요.'
            : '如有支付问题，请联系客服。'}
        </p>
      </Card>
    </div>
  );
}
