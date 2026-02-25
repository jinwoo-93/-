'use client';

import { Truck, Package, Star, Info } from 'lucide-react';

interface ShippingInfoProps {
  shippingCompany?: {
    id: string;
    name: string;
    nameZh: string;
    logo?: string | null;
    averageRating: number;
    onTimeRate: number;
    hasExcellentBadge: boolean;
  } | null;
  shippingFeeType: 'FREE' | 'BUYER_PAYS' | 'CONDITIONAL_FREE';
  shippingFeeAmount?: number | null;
  freeShippingThreshold?: number | null;
  language: 'ko' | 'zh';
}

export default function ShippingInfo({
  shippingCompany,
  shippingFeeType,
  shippingFeeAmount,
  freeShippingThreshold,
  language,
}: ShippingInfoProps) {
  if (!shippingCompany) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 text-sm text-gray-600">
        <Info className="w-5 h-5" />
        <span>{language === 'ko' ? '배송 정보가 없습니다' : '暂无配送信息'}</span>
      </div>
    );
  }

  const getShippingFeeText = () => {
    if (shippingFeeType === 'FREE') {
      return (
        <span className="text-green-600 font-semibold">
          {language === 'ko' ? '무료배송' : '包邮'}
        </span>
      );
    } else if (shippingFeeType === 'BUYER_PAYS') {
      return (
        <span className="text-gray-700">
          {language === 'ko' ? '구매자 부담' : '买家承担'}
        </span>
      );
    } else if (shippingFeeType === 'CONDITIONAL_FREE' && freeShippingThreshold) {
      return (
        <span className="text-orange-600">
          {language === 'ko'
            ? `₩${freeShippingThreshold.toLocaleString()} 이상 무료배송`
            : `满₩${freeShippingThreshold.toLocaleString()}包邮`}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* 배송업체 정보 */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        {shippingCompany.logo ? (
          <img
            src={shippingCompany.logo}
            alt={shippingCompany.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">
              {shippingCompany.name}
            </h4>
            <span className="text-sm text-gray-600">({shippingCompany.nameZh})</span>
            {shippingCompany.hasExcellentBadge && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                {language === 'ko' ? '우수' : '优秀'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>{shippingCompany.averageRating.toFixed(1)}</span>
            </div>
            <div>
              {language === 'ko' ? '정시 배송률' : '准时率'}:{' '}
              <span className="font-medium text-green-600">
                {shippingCompany.onTimeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 배송비 정보 */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">
              {language === 'ko' ? '배송비' : '配送费'}
            </span>
          </div>
          {getShippingFeeText()}
        </div>

        {shippingFeeType === 'BUYER_PAYS' && (
          <p className="text-sm text-gray-600">
            {language === 'ko'
              ? '배송비는 배송업체의 기본 요금이 적용됩니다'
              : '按配送公司标准收费'}
          </p>
        )}

        {shippingFeeType === 'FREE' && shippingFeeAmount && (
          <p className="text-sm text-gray-600">
            {language === 'ko'
              ? `판매자가 ₩${shippingFeeAmount.toLocaleString()} 배송비를 부담합니다`
              : `卖家承担₩${shippingFeeAmount.toLocaleString()}配送费`}
          </p>
        )}

        {shippingFeeType === 'CONDITIONAL_FREE' && shippingFeeAmount && freeShippingThreshold && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {language === 'ko'
                ? `기본 배송비: ₩${shippingFeeAmount.toLocaleString()}`
                : `基本配送费: ₩${shippingFeeAmount.toLocaleString()}`}
            </p>
            <p className="text-orange-600 font-medium">
              {language === 'ko'
                ? `₩${freeShippingThreshold.toLocaleString()} 이상 구매 시 무료배송`
                : `满₩${freeShippingThreshold.toLocaleString()}免配送费`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
