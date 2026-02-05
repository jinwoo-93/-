'use client';

import { useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { CreditCard, Building2, Smartphone, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface TossPaymentButtonProps {
  orderId: string;
  onError?: (error: string) => void;
}

type PaymentMethod = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE' | 'EASY_PAY';

const paymentMethods: {
  id: PaymentMethod;
  nameKo: string;
  nameZh: string;
  icon: React.ReactNode;
}[] = [
  { id: 'CARD', nameKo: '카드 결제', nameZh: '银行卡', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'TRANSFER', nameKo: '계좌이체', nameZh: '转账', icon: <Building2 className="w-5 h-5" /> },
  { id: 'VIRTUAL_ACCOUNT', nameKo: '가상계좌', nameZh: '虚拟账户', icon: <Building2 className="w-5 h-5" /> },
  { id: 'MOBILE', nameKo: '휴대폰 결제', nameZh: '手机支付', icon: <Smartphone className="w-5 h-5" /> },
  { id: 'EASY_PAY', nameKo: '간편결제', nameZh: '快捷支付', icon: <Wallet className="w-5 h-5" /> },
];

export function TossPaymentButton({ orderId, onError }: TossPaymentButtonProps) {
  const { language } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CARD');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // 1. 서버에서 결제 정보 가져오기
      const response = await fetch('/api/payments/toss/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: selectedMethod,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || '결제 준비에 실패했습니다.');
      }

      const {
        orderId: tossOrderId,
        orderName,
        amount,
        customerEmail,
        customerName,
        successUrl,
        failUrl,
        clientKey,
      } = result.data;

      // 2. 토스페이먼츠 SDK 로드
      const tossPayments = await loadTossPayments(clientKey);

      // 3. 결제창 호출
      const paymentMethodMap: Record<PaymentMethod, string> = {
        CARD: '카드',
        TRANSFER: '계좌이체',
        VIRTUAL_ACCOUNT: '가상계좌',
        MOBILE: '휴대폰',
        EASY_PAY: '토스페이',
      };

      await tossPayments.requestPayment(paymentMethodMap[selectedMethod], {
        amount,
        orderId: tossOrderId,
        orderName,
        customerEmail,
        customerName,
        successUrl,
        failUrl,
      });
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : '결제에 실패했습니다.';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 결제 수단 선택 */}
      <div>
        <h3 className="font-medium mb-3">
          {language === 'ko' ? '결제 수단 선택' : '选择支付方式'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg border transition-all',
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {method.icon}
              <span className="text-sm font-medium">
                {language === 'ko' ? method.nameKo : method.nameZh}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 결제 안내 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          {language === 'ko' ? (
            <>
              <strong>안심 결제:</strong> 결제금은 에스크로(임치)로 안전하게 보관되며,
              구매 확정 시 판매자에게 지급됩니다.
            </>
          ) : (
            <>
              <strong>安全支付:</strong> 付款将安全存放于托管账户，
              确认收货后才会支付给卖家。
            </>
          )}
        </p>
      </Card>

      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {language === 'ko' ? '결제 준비 중...' : '准备支付中...'}
          </>
        ) : (
          <>
            {language === 'ko' ? '결제하기' : '支付'}
          </>
        )}
      </Button>

      {/* 결제 수단 로고 */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <img src="/images/payment/visa.svg" alt="Visa" className="h-6 opacity-50" />
        <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-6 opacity-50" />
        <img src="/images/payment/toss.svg" alt="Toss" className="h-6 opacity-50" />
      </div>
    </div>
  );
}
