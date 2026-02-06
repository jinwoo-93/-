'use client';

import { useState, useEffect, useRef } from 'react';
import { Calculator, X, ArrowUpDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface ExchangeRate {
  krwToCny: number;
  cnyToKrw: number;
  updatedAt: string;
}

export function FloatingExchangeCalculator() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'KRW_TO_CNY' | 'CNY_TO_KRW'>('KRW_TO_CNY');
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/exchange-rate');
      const data = await response.json();
      if (data.success) {
        setExchangeRate(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // 기본값 설정
      setExchangeRate({
        krwToCny: 0.0054,
        cnyToKrw: 185.5,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'KRW_TO_CNY' ? 'CNY_TO_KRW' : 'KRW_TO_CNY'));
    setAmount('');
  };

  const calculateResult = () => {
    if (!amount || !exchangeRate) return '0';
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(numAmount)) return '0';

    if (direction === 'KRW_TO_CNY') {
      return (numAmount * exchangeRate.krwToCny).toFixed(2);
    } else {
      return Math.round(numAmount * exchangeRate.cnyToKrw).toLocaleString();
    }
  };

  const handleAmountChange = (value: string) => {
    // 숫자와 콤마만 허용
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setAmount(cleanValue);
  };

  const fromCurrency = direction === 'KRW_TO_CNY' ? 'KRW' : 'CNY';
  const toCurrency = direction === 'KRW_TO_CNY' ? 'CNY' : 'KRW';
  const fromSymbol = direction === 'KRW_TO_CNY' ? '₩' : '¥';
  const toSymbol = direction === 'KRW_TO_CNY' ? '¥' : '₩';
  const fromLabel = direction === 'KRW_TO_CNY'
    ? (language === 'ko' ? '원화' : '韩元')
    : (language === 'ko' ? '위안화' : '人民币');
  const toLabel = direction === 'KRW_TO_CNY'
    ? (language === 'ko' ? '위안화' : '人民币')
    : (language === 'ko' ? '원화' : '韩元');

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
          'flex items-center justify-center',
          'hover:scale-110 transition-transform duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2'
        )}
        aria-label={language === 'ko' ? '환율 계산기' : '汇率计算器'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Calculator className="h-6 w-6" />
        )}
      </button>

      {/* 팝업 계산기 */}
      {isOpen && (
        <div
          ref={popupRef}
          className={cn(
            'fixed bottom-36 right-4 z-50 w-80',
            'animate-in slide-in-from-bottom-5 fade-in duration-200'
          )}
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {language === 'ko' ? '환율 계산기' : '汇率计算器'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchExchangeRate}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                </Button>
              </div>
              {exchangeRate && (
                <p className="text-xs text-white/80 mt-1">
                  1 CNY = ₩{exchangeRate.cnyToKrw.toFixed(2)} | 1 KRW = ¥{exchangeRate.krwToCny.toFixed(4)}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* 입력 */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {fromLabel} ({fromCurrency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {fromSymbol}
                  </span>
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0"
                    className="pl-8 text-lg font-semibold"
                  />
                </div>
              </div>

              {/* 방향 전환 버튼 */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDirection}
                  className="rounded-full h-10 w-10 p-0"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              {/* 결과 */}
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  {toLabel} ({toCurrency})
                </label>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">
                    {toSymbol} {calculateResult()}
                  </p>
                </div>
              </div>

              {/* 빠른 금액 버튼 */}
              <div className="grid grid-cols-4 gap-2">
                {direction === 'KRW_TO_CNY' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('10000')}
                      className="text-xs"
                    >
                      1만
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('50000')}
                      className="text-xs"
                    >
                      5만
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('100000')}
                      className="text-xs"
                    >
                      10만
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('500000')}
                      className="text-xs"
                    >
                      50만
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('100')}
                      className="text-xs"
                    >
                      100¥
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('500')}
                      className="text-xs"
                    >
                      500¥
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('1000')}
                      className="text-xs"
                    >
                      1000¥
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount('5000')}
                      className="text-xs"
                    >
                      5000¥
                    </Button>
                  </>
                )}
              </div>

              {/* 안내 문구 */}
              <p className="text-xs text-center text-muted-foreground">
                {language === 'ko'
                  ? '* 실제 결제 시 환율이 다를 수 있습니다'
                  : '* 实际支付时汇率可能有所不同'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

export default FloatingExchangeCalculator;
