/**
 * 묶음 배송 할인 계산 유틸리티
 *
 * 같은 판매자의 상품을 여러 개 구매할 때 배송비 할인
 */

export interface BundleItem {
  id: string;
  sellerId: string;
  sellerName: string;
  shippingFeeKRW: number;
  shippingFeeCNY: number;
  quantity: number;
  weight?: number; // kg
}

export interface BundleGroup {
  sellerId: string;
  sellerName: string;
  items: BundleItem[];
  originalShippingKRW: number;
  originalShippingCNY: number;
  discountedShippingKRW: number;
  discountedShippingCNY: number;
  discountAmountKRW: number;
  discountAmountCNY: number;
  discountRate: number; // 할인율 (0-100)
  bundleMessage: string;
  bundleMessageZh: string;
}

export interface BundleCalculationResult {
  groups: BundleGroup[];
  totalOriginalShippingKRW: number;
  totalOriginalShippingCNY: number;
  totalDiscountedShippingKRW: number;
  totalDiscountedShippingCNY: number;
  totalDiscountKRW: number;
  totalDiscountCNY: number;
  hasBundleDiscount: boolean;
}

// 묶음 배송 할인 정책
const BUNDLE_DISCOUNT_TIERS = [
  { minItems: 2, discountRate: 30 },  // 2개 이상: 30% 할인
  { minItems: 3, discountRate: 50 },  // 3개 이상: 50% 할인
  { minItems: 5, discountRate: 70 },  // 5개 이상: 70% 할인
  { minItems: 10, discountRate: 100 }, // 10개 이상: 무료 배송
];

// 최대 무게 제한 (kg) - 이 이상이면 추가 배송비 부과
const MAX_BUNDLE_WEIGHT_KG = 20;

/**
 * 묶음 배송 할인율 계산
 */
function getDiscountRate(itemCount: number): number {
  let rate = 0;

  for (const tier of BUNDLE_DISCOUNT_TIERS) {
    if (itemCount >= tier.minItems) {
      rate = tier.discountRate;
    }
  }

  return rate;
}

/**
 * 묶음 배송 메시지 생성
 */
function getBundleMessage(
  itemCount: number,
  discountRate: number,
  lang: 'ko' | 'zh'
): string {
  if (discountRate === 100) {
    return lang === 'ko'
      ? `${itemCount}개 상품 묶음 배송 (배송비 무료)`
      : `${itemCount}件商品合并发货 (免运费)`;
  }

  if (discountRate > 0) {
    return lang === 'ko'
      ? `${itemCount}개 상품 묶음 배송 (배송비 ${discountRate}% 할인)`
      : `${itemCount}件商品合并发货 (运费${discountRate}%折扣)`;
  }

  return lang === 'ko'
    ? `${itemCount}개 상품 개별 배송`
    : `${itemCount}件商品分开发货`;
}

/**
 * 묶음 배송 할인 계산
 */
export function calculateBundleShipping(items: BundleItem[]): BundleCalculationResult {
  // 판매자별 그룹화
  const sellerGroups = new Map<string, BundleItem[]>();

  for (const item of items) {
    const existing = sellerGroups.get(item.sellerId) || [];
    existing.push(item);
    sellerGroups.set(item.sellerId, existing);
  }

  const groups: BundleGroup[] = [];
  let totalOriginalShippingKRW = 0;
  let totalOriginalShippingCNY = 0;
  let totalDiscountedShippingKRW = 0;
  let totalDiscountedShippingCNY = 0;

  for (const [sellerId, sellerItems] of Array.from(sellerGroups)) {
    // 해당 판매자의 총 상품 수 (수량 포함)
    const totalItemCount = sellerItems.reduce((sum, item) => sum + item.quantity, 0);

    // 원래 배송비 합계 (가장 높은 배송비만 적용)
    const maxShippingKRW = Math.max(...sellerItems.map((item) => item.shippingFeeKRW));
    const maxShippingCNY = Math.max(...sellerItems.map((item) => item.shippingFeeCNY));

    // 모든 상품의 배송비 합계 (개별 배송 시)
    const originalShippingKRW = sellerItems.reduce(
      (sum, item) => sum + item.shippingFeeKRW * item.quantity,
      0
    );
    const originalShippingCNY = sellerItems.reduce(
      (sum, item) => sum + item.shippingFeeCNY * item.quantity,
      0
    );

    // 할인율 계산
    const discountRate = getDiscountRate(totalItemCount);

    // 묶음 배송 시 배송비 (가장 높은 배송비 1개에 할인 적용)
    const discountedShippingKRW = Math.round(maxShippingKRW * (1 - discountRate / 100));
    const discountedShippingCNY = Math.round(maxShippingCNY * (1 - discountRate / 100));

    // 무게 확인 (초과 시 추가 배송비)
    const totalWeight = sellerItems.reduce(
      (sum, item) => sum + (item.weight || 0.5) * item.quantity,
      0
    );

    let finalShippingKRW = discountedShippingKRW;
    let finalShippingCNY = discountedShippingCNY;

    if (totalWeight > MAX_BUNDLE_WEIGHT_KG) {
      // 초과 무게당 추가 요금
      const extraWeight = totalWeight - MAX_BUNDLE_WEIGHT_KG;
      const extraFeeKRW = Math.ceil(extraWeight * 3000); // kg당 3000원
      const extraFeeCNY = Math.ceil(extraWeight * 16); // kg당 16위안

      finalShippingKRW += extraFeeKRW;
      finalShippingCNY += extraFeeCNY;
    }

    groups.push({
      sellerId,
      sellerName: sellerItems[0].sellerName,
      items: sellerItems,
      originalShippingKRW,
      originalShippingCNY,
      discountedShippingKRW: finalShippingKRW,
      discountedShippingCNY: finalShippingCNY,
      discountAmountKRW: originalShippingKRW - finalShippingKRW,
      discountAmountCNY: originalShippingCNY - finalShippingCNY,
      discountRate,
      bundleMessage: getBundleMessage(totalItemCount, discountRate, 'ko'),
      bundleMessageZh: getBundleMessage(totalItemCount, discountRate, 'zh'),
    });

    totalOriginalShippingKRW += originalShippingKRW;
    totalOriginalShippingCNY += originalShippingCNY;
    totalDiscountedShippingKRW += finalShippingKRW;
    totalDiscountedShippingCNY += finalShippingCNY;
  }

  return {
    groups,
    totalOriginalShippingKRW,
    totalOriginalShippingCNY,
    totalDiscountedShippingKRW,
    totalDiscountedShippingCNY,
    totalDiscountKRW: totalOriginalShippingKRW - totalDiscountedShippingKRW,
    totalDiscountCNY: totalOriginalShippingCNY - totalDiscountedShippingCNY,
    hasBundleDiscount: totalOriginalShippingKRW > totalDiscountedShippingKRW,
  };
}

/**
 * 다음 할인 단계까지 필요한 상품 수 반환
 */
export function getNextDiscountTier(currentCount: number): {
  itemsNeeded: number;
  nextDiscountRate: number;
} | null {
  for (const tier of BUNDLE_DISCOUNT_TIERS) {
    if (currentCount < tier.minItems) {
      return {
        itemsNeeded: tier.minItems - currentCount,
        nextDiscountRate: tier.discountRate,
      };
    }
  }
  return null; // 이미 최대 할인
}
