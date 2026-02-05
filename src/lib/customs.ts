/**
 * 관부가세 계산 유틸리티
 * 한국 관세법 기준
 */

// 품목별 관세율 (%)
const CUSTOMS_RATES: Record<string, number> = {
  // 의류/패션
  clothing: 13,
  shoes: 13,
  bags: 8,
  accessories: 8,
  watches: 8,
  jewelry: 8,

  // 전자제품
  electronics: 0,
  computers: 0,
  phones: 0,
  cameras: 8,

  // 화장품/건강
  cosmetics: 6.5,
  skincare: 6.5,
  perfume: 6.5,
  supplements: 8,
  health: 8,

  // 식품
  food: 8,
  snacks: 8,
  tea: 40,
  coffee: 8,

  // 스포츠/취미
  sports: 8,
  toys: 8,
  hobby: 8,
  instruments: 8,

  // 가구/인테리어
  furniture: 8,
  home: 8,

  // 유아/아동
  baby: 8,
  kids: 8,

  // 반려동물
  pets: 8,

  // 기타
  books: 0,
  default: 8,
};

// 부가세율 (%)
const VAT_RATE = 10;

// 면세 기준금액 (USD)
const DUTY_FREE_THRESHOLD_USD = 150;

// 미국발 면세 기준금액 (USD)
const DUTY_FREE_THRESHOLD_USD_US = 200;

interface CustomsCalculationInput {
  productPriceKRW: number;        // 상품 가격 (원화)
  productPriceCNY?: number;       // 상품 가격 (위안화)
  shippingFeeKRW: number;         // 배송비 (원화)
  category?: string;              // 상품 카테고리
  quantity?: number;              // 수량
  originCountry?: 'CN' | 'US' | 'OTHER';  // 원산지
  exchangeRateUSD?: number;       // USD 환율
}

interface CustomsCalculationResult {
  // 과세 여부
  isDutyFree: boolean;
  dutyFreeReason?: string;

  // 과세가격
  taxableValueKRW: number;
  taxableValueUSD: number;

  // 관세
  customsDutyRate: number;
  customsDutyKRW: number;

  // 부가세
  vatRate: number;
  vatKRW: number;

  // 총 세금
  totalTaxKRW: number;

  // 최종 예상 금액
  totalCostKRW: number;

  // 참고 정보
  notes: string[];
}

/**
 * 관부가세 계산
 */
export function calculateCustomsDuty(
  input: CustomsCalculationInput,
  exchangeRates: { USD: number; CNY: number }
): CustomsCalculationResult {
  const {
    productPriceKRW,
    shippingFeeKRW,
    category = 'default',
    quantity = 1,
    originCountry = 'CN',
  } = input;

  const notes: string[] = [];

  // 1. 과세가격 계산 (상품가 + 배송비)
  const taxableValueKRW = productPriceKRW + shippingFeeKRW;
  const taxableValueUSD = Math.round(taxableValueKRW / exchangeRates.USD);

  // 2. 면세 기준 확인
  const threshold = originCountry === 'US' ? DUTY_FREE_THRESHOLD_USD_US : DUTY_FREE_THRESHOLD_USD;
  const isDutyFree = taxableValueUSD <= threshold;

  if (isDutyFree) {
    notes.push(`과세가격이 $${threshold} 이하로 면세 대상입니다.`);
    return {
      isDutyFree: true,
      dutyFreeReason: `과세가격 $${taxableValueUSD} (면세기준: $${threshold})`,
      taxableValueKRW,
      taxableValueUSD,
      customsDutyRate: 0,
      customsDutyKRW: 0,
      vatRate: 0,
      vatKRW: 0,
      totalTaxKRW: 0,
      totalCostKRW: taxableValueKRW,
      notes,
    };
  }

  // 3. 관세율 결정
  const customsDutyRate = CUSTOMS_RATES[category] ?? CUSTOMS_RATES.default;
  notes.push(`적용 관세율: ${customsDutyRate}% (${category})`);

  // 4. 관세 계산
  const customsDutyKRW = Math.round(taxableValueKRW * (customsDutyRate / 100));

  // 5. 부가세 계산 (과세가격 + 관세) × 10%
  const vatBase = taxableValueKRW + customsDutyKRW;
  const vatKRW = Math.round(vatBase * (VAT_RATE / 100));
  notes.push(`부가세 계산: (${taxableValueKRW.toLocaleString()} + ${customsDutyKRW.toLocaleString()}) × 10%`);

  // 6. 총 세금
  const totalTaxKRW = customsDutyKRW + vatKRW;

  // 7. 최종 금액
  const totalCostKRW = taxableValueKRW + totalTaxKRW;

  // 추가 안내
  if (category === 'electronics' || category === 'computers' || category === 'phones') {
    notes.push('전자제품은 KC인증이 필요할 수 있습니다.');
  }

  if (category === 'cosmetics' || category === 'skincare') {
    notes.push('화장품은 식약처 기준 용량 제한이 있습니다.');
  }

  if (category === 'food' || category === 'supplements') {
    notes.push('식품/건강기능식품은 검역 대상일 수 있습니다.');
  }

  return {
    isDutyFree: false,
    taxableValueKRW,
    taxableValueUSD,
    customsDutyRate,
    customsDutyKRW,
    vatRate: VAT_RATE,
    vatKRW,
    totalTaxKRW,
    totalCostKRW,
    notes,
  };
}

/**
 * 간이세율 계산 (목록통관)
 * 개인사용 목적의 소액 물품에 적용
 */
export function calculateSimplifiedTax(
  priceKRW: number,
  category: string
): number {
  // 간이세율표 (일반적으로 20% 적용)
  const SIMPLIFIED_RATES: Record<string, number> = {
    clothing: 20,
    shoes: 20,
    bags: 20,
    cosmetics: 20,
    electronics: 20,
    default: 20,
  };

  const rate = SIMPLIFIED_RATES[category] ?? SIMPLIFIED_RATES.default;
  return Math.round(priceKRW * (rate / 100));
}

/**
 * 카테고리별 관세율 조회
 */
export function getCustomsRateByCategory(category: string): number {
  return CUSTOMS_RATES[category] ?? CUSTOMS_RATES.default;
}

/**
 * 모든 카테고리 관세율 목록
 */
export function getAllCustomsRates(): Record<string, number> {
  return { ...CUSTOMS_RATES };
}

/**
 * 면세 여부 빠른 확인
 */
export function isDutyFreeAmount(
  amountKRW: number,
  exchangeRateUSD: number,
  originCountry: 'CN' | 'US' | 'OTHER' = 'CN'
): boolean {
  const amountUSD = amountKRW / exchangeRateUSD;
  const threshold = originCountry === 'US' ? DUTY_FREE_THRESHOLD_USD_US : DUTY_FREE_THRESHOLD_USD;
  return amountUSD <= threshold;
}
