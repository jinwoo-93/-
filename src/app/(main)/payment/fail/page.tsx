'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, Headphones, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const errorMessages: Record<string, { ko: string; zh: string }> = {
  PAY_PROCESS_CANCELED: {
    ko: '결제가 취소되었습니다.',
    zh: '支付已取消。',
  },
  PAY_PROCESS_ABORTED: {
    ko: '결제가 중단되었습니다.',
    zh: '支付已中断。',
  },
  REJECT_CARD_COMPANY: {
    ko: '카드사에서 결제를 거절했습니다.',
    zh: '银行拒绝了此次支付。',
  },
  INVALID_CARD_EXPIRATION: {
    ko: '카드 유효기간이 만료되었습니다.',
    zh: '银行卡已过期。',
  },
  EXCEED_MAX_DAILY_PAYMENT_COUNT: {
    ko: '일일 결제 한도를 초과했습니다.',
    zh: '超出每日支付限额。',
  },
  EXCEED_MAX_PAYMENT_AMOUNT: {
    ko: '결제 금액 한도를 초과했습니다.',
    zh: '超出支付金额限制。',
  },
  NOT_AVAILABLE_PAYMENT: {
    ko: '사용할 수 없는 결제 수단입니다.',
    zh: '无法使用该支付方式。',
  },
  INVALID_STOPPED_CARD: {
    ko: '정지된 카드입니다.',
    zh: '该卡已被冻结。',
  },
  INVALID_PASSWORD_COUNT_EXCEEDED: {
    ko: '비밀번호 오류 횟수를 초과했습니다.',
    zh: '密码错误次数过多。',
  },
  default: {
    ko: '결제 처리 중 오류가 발생했습니다.',
    zh: '支付处理过程中发生错误。',
  },
};

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  const errorCode = searchParams.get('code') || 'default';
  const errorMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const displayMessage =
    errorMessages[errorCode]?.[language] ||
    errorMessage ||
    errorMessages.default[language];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-red-600">
          {language === 'ko' ? '결제에 실패했습니다' : '支付失败'}
        </h1>

        <p className="text-gray-600 mb-6">{displayMessage}</p>

        {errorCode !== 'default' && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6 text-sm text-gray-500">
            <span className="font-mono">Error: {errorCode}</span>
          </div>
        )}

        <div className="space-y-3">
          {orderId && (
            <Link href={`/checkout/${orderId}`}>
              <Button className="w-full" size="lg">
                {language === 'ko' ? '다시 결제하기' : '重新支付'}
              </Button>
            </Link>
          )}

          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ko' ? '홈으로 돌아가기' : '返回首页'}
            </Button>
          </Link>

          <Link href="/help/contact">
            <Button variant="ghost" className="w-full text-gray-500">
              <Headphones className="w-4 h-4 mr-2" />
              {language === 'ko' ? '고객센터 문의' : '联系客服'}
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          {language === 'ko'
            ? '문제가 계속되면 다른 결제 수단을 이용하시거나 고객센터로 문의해주세요.'
            : '如果问题持续存在，请尝试其他支付方式或联系客服。'}
        </p>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentFailContent />
    </Suspense>
  );
}
