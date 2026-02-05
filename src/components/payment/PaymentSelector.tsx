'use client';

import { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { TossPaymentButton } from './TossPaymentButton';
import { AlipayButton } from './AlipayButton';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface PaymentSelectorProps {
  orderId: string;
  amount: {
    krw: number;
    cny: number;
  };
}

type PaymentGateway = 'toss' | 'alipay' | 'stripe';

export function PaymentSelector({ orderId, amount }: PaymentSelectorProps) {
  const { language } = useLanguage();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(
    language === 'zh' ? 'alipay' : 'toss'
  );
  const [error, setError] = useState<string | null>(null);

  const gateways: {
    id: PaymentGateway;
    name: string;
    description: string;
    icon: string;
    recommended: boolean;
    available: boolean;
  }[] = [
    {
      id: 'toss',
      name: language === 'ko' ? '토스페이먼츠' : 'TossPayments',
      description:
        language === 'ko'
          ? '카드, 계좌이체, 간편결제'
          : '银行卡、转账、快捷支付',
      icon: '/images/payment/toss.svg',
      recommended: language === 'ko',
      available: true,
    },
    {
      id: 'alipay',
      name: language === 'ko' ? '알리페이' : '支付宝',
      description:
        language === 'ko'
          ? '중국 사용자 추천'
          : '推荐中国用户使用',
      icon: '/images/payment/alipay-logo.svg',
      recommended: language === 'zh',
      available: true,
    },
    {
      id: 'stripe',
      name: language === 'ko' ? '해외카드 결제' : '国际信用卡',
      description:
        language === 'ko'
          ? 'Visa, Mastercard, UnionPay'
          : 'Visa、Mastercard、银联',
      icon: '/images/payment/stripe.svg',
      recommended: false,
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* 결제 금액 */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            {language === 'ko' ? '결제 금액' : '支付金额'}
          </span>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {selectedGateway === 'alipay'
                ? `¥${amount.cny.toLocaleString()}`
                : `₩${amount.krw.toLocaleString()}`}
            </p>
            {selectedGateway !== 'alipay' && (
              <p className="text-sm text-gray-500">
                ≈ ¥{amount.cny.toLocaleString()}
              </p>
            )}
            {selectedGateway === 'alipay' && (
              <p className="text-sm text-gray-500">
                ≈ ₩{amount.krw.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* 결제 수단 선택 */}
      <div>
        <h3 className="font-medium mb-3">
          {language === 'ko' ? '결제 수단' : '支付方式'}
        </h3>
        <div className="space-y-2">
          {gateways.map((gateway) => (
            <button
              key={gateway.id}
              type="button"
              onClick={() => {
                setSelectedGateway(gateway.id);
                setError(null);
              }}
              disabled={!gateway.available}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left',
                selectedGateway === gateway.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300',
                !gateway.available && 'opacity-50 cursor-not-allowed'
              )}
            >
              <img
                src={gateway.icon}
                alt={gateway.name}
                className="w-10 h-10 object-contain"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{gateway.name}</span>
                  {gateway.recommended && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                      {language === 'ko' ? '추천' : '推荐'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{gateway.description}</p>
              </div>
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  selectedGateway === gateway.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                )}
              >
                {selectedGateway === gateway.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 결제 수단 */}
      <div className="pt-4 border-t">
        {selectedGateway === 'toss' && (
          <TossPaymentButton orderId={orderId} onError={setError} />
        )}
        {selectedGateway === 'alipay' && (
          <AlipayButton orderId={orderId} onError={setError} />
        )}
        {selectedGateway === 'stripe' && (
          <div className="text-center py-8 text-gray-500">
            {language === 'ko'
              ? 'Stripe 결제는 준비 중입니다.'
              : 'Stripe支付正在准备中。'}
          </div>
        )}
      </div>
    </div>
  );
}
