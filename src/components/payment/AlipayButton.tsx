'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface AlipayButtonProps {
  orderId: string;
  onError?: (error: string) => void;
}

export function AlipayButton({ orderId, onError }: AlipayButtonProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // 플랫폼 감지
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const response = await fetch('/api/payments/alipay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          platform: isMobile ? 'wap' : 'web',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || '支付创建失败');
      }

      if (result.data.type === 'redirect') {
        // 모바일: URL로 리다이렉트
        window.location.href = result.data.paymentUrl;
      } else {
        // PC: Form 제출
        if (formContainerRef.current) {
          formContainerRef.current.innerHTML = result.data.formHtml;
        }
      }
    } catch (error) {
      console.error('Alipay payment error:', error);
      const message = error instanceof Error ? error.message : '支付失败';
      onError?.(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 알리페이 안내 */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <img
            src="/images/payment/alipay-logo.svg"
            alt="Alipay"
            className="w-8 h-8"
          />
          <div className="flex-1">
            <p className="font-medium text-blue-800">
              {language === 'ko' ? '알리페이 결제' : '支付宝支付'}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {language === 'ko'
                ? '알리페이 계정으로 안전하게 결제하세요.'
                : '使用支付宝账户安全支付。'}
            </p>
          </div>
        </div>
      </Card>

      {/* 안전 결제 안내 */}
      <Card className="p-4 bg-green-50 border-green-200">
        <p className="text-sm text-green-700">
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
        className="w-full bg-[#1677FF] hover:bg-[#1677FF]/90"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {language === 'ko' ? '결제 준비 중...' : '准备支付中...'}
          </>
        ) : (
          <span className="flex items-center gap-2">
            <img
              src="/images/payment/alipay-white.svg"
              alt=""
              className="w-5 h-5"
            />
            {language === 'ko' ? '알리페이로 결제' : '支付宝支付'}
          </span>
        )}
      </Button>

      {/* Form 컨테이너 (PC 결제용) */}
      <div ref={formContainerRef} className="hidden" />
    </div>
  );
}
