'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface ExchangeRateData {
  krwToCny: number;
  cnyToKrw: number;
  source: string;
}

export function ExchangeRateWidget() {
  const { language } = useLanguage();
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 환율 계산기 상태
  const [inputValue, setInputValue] = useState<string>('10000');
  const [fromCurrency, setFromCurrency] = useState<'KRW' | 'CNY'>('KRW');

  // 환율 데이터 가져오기
  const fetchExchangeRate = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exchange-rate');
      const result = await response.json();

      if (result.success) {
        setExchangeRate(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchExchangeRate();

    // 5분마다 갱신
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  // 환율 계산
  const calculateConversion = () => {
    if (!exchangeRate || !inputValue) return null;

    const amount = parseFloat(inputValue.replace(/,/g, ''));
    if (isNaN(amount)) return null;

    if (fromCurrency === 'KRW') {
      const result = amount * exchangeRate.krwToCny;
      return {
        from: amount,
        fromCurrency: 'KRW',
        to: Math.round(result * 100) / 100,
        toCurrency: 'CNY',
      };
    } else {
      const result = amount * exchangeRate.cnyToKrw;
      return {
        from: amount,
        fromCurrency: 'CNY',
        to: Math.round(result),
        toCurrency: 'KRW',
      };
    }
  };

  // 통화 전환
  const toggleCurrency = () => {
    const conversion = calculateConversion();
    if (conversion) {
      setInputValue(conversion.to.toLocaleString());
    }
    setFromCurrency(fromCurrency === 'KRW' ? 'CNY' : 'KRW');
  };

  // 숫자 포맷팅
  const formatNumber = (num: number, currency: string) => {
    if (currency === 'KRW') {
      return num.toLocaleString('ko-KR');
    }
    return num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const conversion = calculateConversion();

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 md:p-5 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* 실시간 환율 표시 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold">
              {language === 'ko' ? '실시간 환율' : '实时汇率'}
            </h3>
            <button
              onClick={fetchExchangeRate}
              disabled={isLoading}
              className="ml-auto p-1.5 rounded-full hover:bg-white/20 transition-colors"
              title={language === 'ko' ? '새로고침' : '刷新'}
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>

          {exchangeRate ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-0.5 rounded">🇰🇷 1 KRW</span>
                <span>=</span>
                <span className="font-semibold">{exchangeRate.krwToCny.toFixed(6)} CNY 🇨🇳</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white/20 px-2 py-0.5 rounded">🇨🇳 1 CNY</span>
                <span>=</span>
                <span className="font-semibold">{formatNumber(exchangeRate.cnyToKrw, 'KRW')} KRW 🇰🇷</span>
              </div>
              {lastUpdated && (
                <p className="text-xs text-white/70 mt-1">
                  {language === 'ko' ? '마지막 업데이트: ' : '最后更新: '}
                  {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-white/70">
              {language === 'ko' ? '환율 정보를 불러오는 중...' : '正在加载汇率信息...'}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="hidden md:block w-px h-20 bg-white/30" />

        {/* 환율 계산기 */}
        <div className="flex-1">
          <h3 className="font-bold mb-2">
            {language === 'ko' ? '환율 계산기' : '汇率计算器'}
          </h3>

          <div className="flex items-center gap-2">
            {/* 입력 필드 */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  setInputValue(value);
                }}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder={fromCurrency === 'KRW' ? '금액 입력' : '输入金额'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium">
                {fromCurrency === 'KRW' ? '🇰🇷 원' : '🇨🇳 元'}
              </span>
            </div>

            {/* 전환 버튼 */}
            <button
              onClick={toggleCurrency}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title={language === 'ko' ? '통화 전환' : '切换货币'}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            {/* 결과 표시 */}
            <div className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center">
              {conversion ? (
                <div>
                  <span className="font-bold text-lg">
                    {formatNumber(conversion.to, conversion.toCurrency)}
                  </span>
                  <span className="text-sm ml-1">
                    {conversion.toCurrency === 'KRW' ? '🇰🇷 원' : '🇨🇳 元'}
                  </span>
                </div>
              ) : (
                <span className="text-white/50">-</span>
              )}
            </div>
          </div>

          {/* 빠른 금액 선택 버튼 */}
          <div className="flex gap-1 mt-2">
            {(fromCurrency === 'KRW'
              ? [10000, 50000, 100000, 500000]
              : [100, 500, 1000, 5000]
            ).map((amount) => (
              <button
                key={amount}
                onClick={() => setInputValue(amount.toLocaleString())}
                className="flex-1 text-xs py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                {amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExchangeRateWidget;
