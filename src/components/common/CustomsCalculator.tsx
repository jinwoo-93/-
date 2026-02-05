'use client';

import { useState, useEffect } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface CustomsCalculatorProps {
  productPriceKRW: number;
  shippingFeeKRW?: number;
  category?: string;
  quantity?: number;
  showDetails?: boolean;
  className?: string;
}

interface CalculationResult {
  isDutyFree: boolean;
  dutyFreeReason?: string;
  taxableValueKRW: number;
  taxableValueUSD: number;
  customsDutyRate: number;
  customsDutyKRW: number;
  vatRate: number;
  vatKRW: number;
  totalTaxKRW: number;
  totalCostKRW: number;
  notes: string[];
  exchangeRates: { USD: number; CNY: number };
}

export default function CustomsCalculator({
  productPriceKRW,
  shippingFeeKRW = 0,
  category = 'default',
  quantity = 1,
  showDetails = true,
  className,
}: CustomsCalculatorProps) {
  const { language } = useLanguage();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productPriceKRW > 0) {
      calculateCustoms();
    }
  }, [productPriceKRW, shippingFeeKRW, category, quantity]);

  const calculateCustoms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/customs/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productPriceKRW,
          shippingFeeKRW,
          category,
          quantity,
          originCountry: 'CN',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error?.message);
      }
    } catch (err) {
      setError('계산 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <Calculator className="w-4 h-4 animate-pulse" />
          <span className="text-sm">
            {language === 'ko' ? '관부가세 계산 중...' : '计算关税中...'}
          </span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 ${className}`}>
      {/* 헤더 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">
            {language === 'ko' ? '예상 관부가세' : '预计关税'}
          </span>
          {result.isDutyFree ? (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              <CheckCircle className="w-3 h-3" />
              {language === 'ko' ? '면세' : '免税'}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {language === 'ko' ? '과세 대상' : '需缴税'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-blue-600">
            {result.isDutyFree
              ? language === 'ko' ? '₩0' : '¥0'
              : `₩${formatPrice(result.totalTaxKRW)}`}
          </span>
          {showDetails && (
            isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )
          )}
        </div>
      </button>

      {/* 상세 정보 */}
      {showDetails && isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* 면세 안내 */}
          {result.isDutyFree && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">
                  {language === 'ko' ? '면세 대상 상품입니다' : '此商品免税'}
                </p>
                <p className="text-green-600 mt-1">
                  {result.dutyFreeReason}
                </p>
              </div>
            </div>
          )}

          {/* 과세 상세 */}
          {!result.isDutyFree && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">
                  {language === 'ko' ? '과세가격' : '完税价格'}
                </span>
                <span className="font-medium">
                  ₩{formatPrice(result.taxableValueKRW)} (${result.taxableValueUSD})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">
                  {language === 'ko' ? `관세 (${result.customsDutyRate}%)` : `关税 (${result.customsDutyRate}%)`}
                </span>
                <span className="font-medium">₩{formatPrice(result.customsDutyKRW)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-600">
                  {language === 'ko' ? `부가세 (${result.vatRate}%)` : `增值税 (${result.vatRate}%)`}
                </span>
                <span className="font-medium">₩{formatPrice(result.vatKRW)}</span>
              </div>
              <div className="flex justify-between py-2 font-medium">
                <span className="text-gray-900">
                  {language === 'ko' ? '총 세금' : '税费总计'}
                </span>
                <span className="text-blue-600">₩{formatPrice(result.totalTaxKRW)}</span>
              </div>
            </div>
          )}

          {/* 최종 예상 금액 */}
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {language === 'ko' ? '도착 예상 총액' : '预计到手价'}
              </span>
              <span className="text-xl font-bold text-gray-900">
                ₩{formatPrice(result.totalCostKRW)}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'ko'
                ? '상품가 + 배송비 + 관부가세'
                : '商品价 + 运费 + 关税'}
            </p>
          </div>

          {/* 참고 사항 */}
          {result.notes.length > 0 && (
            <div className="space-y-1">
              {result.notes.map((note, index) => (
                <div key={index} className="flex items-start gap-2 text-xs text-gray-500">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}

          {/* 면책 조항 */}
          <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {language === 'ko'
                ? '실제 세금은 통관 시 환율, 세관 판단에 따라 달라질 수 있습니다.'
                : '实际税费可能因汇率变动及海关判定而有所不同。'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
