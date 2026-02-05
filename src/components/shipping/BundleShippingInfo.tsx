'use client';

import { useMemo } from 'react';
import { Package, Truck, Gift, Info, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';
import { useCurrency } from '@/hooks/useCurrency';
import {
  calculateBundleShipping,
  getNextDiscountTier,
  BundleItem,
  BundleGroup,
} from '@/lib/bundleShipping';

interface BundleShippingInfoProps {
  items: BundleItem[];
  showDetails?: boolean;
  className?: string;
}

export default function BundleShippingInfo({
  items,
  showDetails = true,
  className,
}: BundleShippingInfoProps) {
  const { language } = useLanguage();
  const { format } = useCurrency();

  const result = useMemo(() => calculateBundleShipping(items), [items]);

  if (items.length === 0) return null;

  const formatPrice = (krw: number, cny: number) => {
    return language === 'ko' ? `₩${krw.toLocaleString()}` : `¥${cny}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 총 할인 정보 */}
      {result.hasBundleDiscount && (
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              {language === 'ko' ? '묶음 배송 할인' : '合并发货优惠'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground line-through mr-2">
              {formatPrice(result.totalOriginalShippingKRW, result.totalOriginalShippingCNY)}
            </span>
            <span className="font-bold text-green-600">
              {formatPrice(result.totalDiscountedShippingKRW, result.totalDiscountedShippingCNY)}
            </span>
            <p className="text-xs text-green-600 mt-0.5">
              -{formatPrice(result.totalDiscountKRW, result.totalDiscountCNY)}{' '}
              {language === 'ko' ? '절약' : '已省'}
            </p>
          </div>
        </div>
      )}

      {/* 판매자별 그룹 상세 */}
      {showDetails && result.groups.length > 0 && (
        <div className="space-y-3">
          {result.groups.map((group) => (
            <SellerBundleGroup key={group.sellerId} group={group} language={language} />
          ))}
        </div>
      )}

      {/* 다음 할인 안내 */}
      {result.groups.map((group) => {
        const totalItems = group.items.reduce((sum, item) => sum + item.quantity, 0);
        const nextTier = getNextDiscountTier(totalItems);

        if (!nextTier || group.discountRate === 100) return null;

        return (
          <div
            key={`next-${group.sellerId}`}
            className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700"
          >
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              {language === 'ko'
                ? `${group.sellerName} 상품 ${nextTier.itemsNeeded}개 더 담으면 배송비 ${nextTier.nextDiscountRate}% 할인!`
                : `再买${nextTier.itemsNeeded}件${group.sellerName}的商品，运费可享${nextTier.nextDiscountRate}%折扣！`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SellerBundleGroup({
  group,
  language,
}: {
  group: BundleGroup;
  language: string;
}) {
  const totalItems = group.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{group.sellerName}</span>
          <Badge variant="secondary" className="text-xs">
            {totalItems} {language === 'ko' ? '개' : '件'}
          </Badge>
        </div>

        {group.discountRate > 0 && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {group.discountRate === 100
              ? language === 'ko' ? '무료배송' : '免运费'
              : `-${group.discountRate}%`}
          </Badge>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {language === 'zh' ? group.bundleMessageZh : group.bundleMessage}
        </span>
        <div className="flex items-center gap-2">
          {group.discountAmountKRW > 0 && (
            <span className="text-muted-foreground line-through text-xs">
              {language === 'ko'
                ? `₩${group.originalShippingKRW.toLocaleString()}`
                : `¥${group.originalShippingCNY}`}
            </span>
          )}
          <span className="font-medium">
            {language === 'ko'
              ? `₩${group.discountedShippingKRW.toLocaleString()}`
              : `¥${group.discountedShippingCNY}`}
          </span>
        </div>
      </div>
    </div>
  );
}

// 간단한 요약 컴포넌트 (체크아웃 페이지용)
export function BundleShippingSummary({
  items,
  className,
}: {
  items: BundleItem[];
  className?: string;
}) {
  const { language } = useLanguage();
  const result = useMemo(() => calculateBundleShipping(items), [items]);

  if (!result.hasBundleDiscount) {
    return (
      <div className={`flex justify-between text-sm ${className}`}>
        <span className="text-muted-foreground">
          {language === 'ko' ? '배송비' : '运费'}
        </span>
        <span>
          {language === 'ko'
            ? `₩${result.totalDiscountedShippingKRW.toLocaleString()}`
            : `¥${result.totalDiscountedShippingCNY}`}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {language === 'ko' ? '배송비' : '运费'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through text-xs">
            {language === 'ko'
              ? `₩${result.totalOriginalShippingKRW.toLocaleString()}`
              : `¥${result.totalOriginalShippingCNY}`}
          </span>
          <span>
            {language === 'ko'
              ? `₩${result.totalDiscountedShippingKRW.toLocaleString()}`
              : `¥${result.totalDiscountedShippingCNY}`}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-green-600">
        <span className="flex items-center gap-1">
          <Gift className="h-3 w-3" />
          {language === 'ko' ? '묶음 배송 할인' : '合并发货优惠'}
        </span>
        <span>
          -{language === 'ko'
            ? `₩${result.totalDiscountKRW.toLocaleString()}`
            : `¥${result.totalDiscountCNY}`}
        </span>
      </div>
    </div>
  );
}
