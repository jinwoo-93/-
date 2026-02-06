// 쿠폰 할인 금액 계산
export function calculateCouponDiscount(
  coupon: {
    discountType: 'FIXED' | 'PERCENTAGE';
    discountValue: number;
    maxDiscount?: number | null;
    minOrderAmount: number;
  },
  orderAmount: number
): { discountAmount: number; isApplicable: boolean; reason?: string } {
  // 최소 주문 금액 확인
  if (orderAmount < coupon.minOrderAmount) {
    return {
      discountAmount: 0,
      isApplicable: false,
      reason: `최소 주문 금액은 ${coupon.minOrderAmount.toLocaleString()}원입니다.`,
    };
  }

  let discountAmount = 0;

  if (coupon.discountType === 'FIXED') {
    discountAmount = coupon.discountValue;
  } else {
    discountAmount = Math.floor(orderAmount * (coupon.discountValue / 100));

    // 최대 할인 금액 제한
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  }

  // 주문 금액보다 할인이 크면 주문 금액만큼만
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  return {
    discountAmount,
    isApplicable: true,
  };
}
