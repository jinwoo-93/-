'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice, convertCurrency } from '@/lib/utils';

type Currency = 'KRW' | 'CNY';

const CURRENCY_KEY = 'jikguyeokgu_currency';
const EXCHANGE_RATE_KEY = 'jikguyeokgu_exchange_rate';

interface ExchangeRate {
  rate: number;
  updatedAt: string;
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>('KRW');
  const [exchangeRate, setExchangeRate] = useState<number>(0.0054); // 기본값: 1 KRW = 0.0054 CNY

  useEffect(() => {
    // 로컬 스토리지에서 통화 설정 불러오기
    const savedCurrency = localStorage.getItem(CURRENCY_KEY) as Currency | null;
    if (savedCurrency && (savedCurrency === 'KRW' || savedCurrency === 'CNY')) {
      setCurrencyState(savedCurrency);
    }

    // 환율 정보 불러오기
    const savedRate = localStorage.getItem(EXCHANGE_RATE_KEY);
    if (savedRate) {
      try {
        const rateData: ExchangeRate = JSON.parse(savedRate);
        // 1시간 이내의 환율 정보만 사용
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        if (rateData.updatedAt > oneHourAgo) {
          setExchangeRate(rateData.rate);
        } else {
          fetchExchangeRate();
        }
      } catch {
        fetchExchangeRate();
      }
    } else {
      fetchExchangeRate();
    }
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/common/exchange-rate');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.rate) {
          setExchangeRate(data.data.rate);
          localStorage.setItem(
            EXCHANGE_RATE_KEY,
            JSON.stringify({
              rate: data.data.rate,
              updatedAt: new Date().toISOString(),
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    }
  };

  const setCurrency = useCallback((cur: Currency) => {
    setCurrencyState(cur);
    localStorage.setItem(CURRENCY_KEY, cur);
  }, []);

  const format = useCallback(
    (priceKRW: number, priceCNY?: number) => {
      if (currency === 'CNY' && priceCNY !== undefined) {
        return formatPrice(priceCNY, 'CNY');
      }
      if (currency === 'CNY') {
        return formatPrice(convertCurrency(priceKRW, exchangeRate, 'KRW', 'CNY'), 'CNY');
      }
      return formatPrice(priceKRW, 'KRW');
    },
    [currency, exchangeRate]
  );

  const convert = useCallback(
    (amount: number, from: Currency, to: Currency) => {
      return convertCurrency(amount, exchangeRate, from, to);
    },
    [exchangeRate]
  );

  return {
    currency,
    setCurrency,
    exchangeRate,
    format,
    convert,
    refreshRate: fetchExchangeRate,
  };
}

export default useCurrency;
