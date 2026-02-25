/**
 * 배송비 계산 유틸리티
 *
 * 한중 크로스보더 배송비 계산 로직
 * - 무게 기반 계산 (kg당 요금)
 * - 거리/지역 기반 추가 요금
 * - 배송사별 요금 차이
 */

export interface ShippingRate {
  companyId: string;
  companyName: string;
  companyNameZh: string;
  baseFeeKRW: number;       // 기본 배송료 (KRW)
  baseFeeCNY: number;       // 기본 배송료 (CNY)
  perKgFeeKRW: number;      // kg당 추가 요금 (KRW)
  perKgFeeCNY: number;      // kg당 추가 요금 (CNY)
  estimatedDays: number;    // 예상 배송일
  totalFeeKRW: number;      // 총 배송료 (KRW)
  totalFeeCNY: number;      // 총 배송료 (CNY)
}

export interface ShippingCalculationInput {
  weight: number;           // 무게 (kg)
  direction: 'KR_TO_CN' | 'CN_TO_KR';  // 배송 방향
  region?: string;          // 목적지 지역 (선택)
}

// 지역별 추가 요금 계수 (도서산간 등)
const REGION_MULTIPLIERS: Record<string, number> = {
  // 한국 지역
  'KR_SEOUL': 1.0,
  'KR_GYEONGGI': 1.0,
  'KR_INCHEON': 1.0,
  'KR_BUSAN': 1.05,
  'KR_DAEGU': 1.05,
  'KR_DAEJEON': 1.03,
  'KR_GWANGJU': 1.05,
  'KR_ULSAN': 1.05,
  'KR_SEJONG': 1.03,
  'KR_GANGWON': 1.1,
  'KR_CHUNGBUK': 1.05,
  'KR_CHUNGNAM': 1.05,
  'KR_JEONBUK': 1.07,
  'KR_JEONNAM': 1.1,
  'KR_GYEONGBUK': 1.07,
  'KR_GYEONGNAM': 1.07,
  'KR_JEJU': 1.3,  // 제주 도서산간
  // 중국 지역
  'CN_BEIJING': 1.0,
  'CN_SHANGHAI': 1.0,
  'CN_GUANGDONG': 1.0,
  'CN_ZHEJIANG': 1.0,
  'CN_JIANGSU': 1.0,
  'CN_SHANDONG': 1.03,
  'CN_SICHUAN': 1.1,
  'CN_HUBEI': 1.05,
  'CN_HENAN': 1.05,
  'CN_HUNAN': 1.07,
  'CN_FUJIAN': 1.03,
  'CN_ANHUI': 1.05,
  'CN_LIAONING': 1.07,
  'CN_SHAANXI': 1.1,
  'CN_XINJIANG': 1.3,  // 신장 원거리
  'CN_TIBET': 1.4,     // 티벳 원거리
  'CN_INNER_MONGOLIA': 1.2,
  'DEFAULT': 1.0,
};

// 기본 배송사 요금 (데이터베이스에 없을 경우 사용)
const DEFAULT_SHIPPING_RATES = {
  KR_TO_CN: {
    baseFeeKRW: 8000,
    perKgFeeKRW: 5000,
    baseFeeCNY: 43,
    perKgFeeCNY: 27,
    estimatedDays: 5,
  },
  CN_TO_KR: {
    baseFeeKRW: 10000,
    perKgFeeKRW: 6000,
    baseFeeCNY: 54,
    perKgFeeCNY: 32,
    estimatedDays: 7,
  },
};

/**
 * 배송비 계산 함수
 */
export function calculateShippingFee(
  input: ShippingCalculationInput,
  companyPricePerKg?: number,
  companyMinimumFee?: number
): { feeKRW: number; feeCNY: number; estimatedDays: number } {
  const { weight, direction, region } = input;

  // 무게 최소값 (0.5kg 미만은 0.5kg으로 계산)
  const effectiveWeight = Math.max(weight, 0.5);

  // 기본 요금 가져오기
  const baseRates = DEFAULT_SHIPPING_RATES[direction];

  // 배송사별 kg당 요금이 있으면 사용
  const perKgFeeKRW = companyPricePerKg || baseRates.perKgFeeKRW;
  const minimumFeeKRW = companyMinimumFee || baseRates.baseFeeKRW;

  // 지역 계수 적용
  const regionMultiplier = REGION_MULTIPLIERS[region || 'DEFAULT'] || 1.0;

  // 배송비 계산 (기본료 + 무게별 요금)
  let feeKRW = minimumFeeKRW + (effectiveWeight * perKgFeeKRW);

  // 지역 계수 적용
  feeKRW = Math.round(feeKRW * regionMultiplier);

  // 100원 단위로 올림
  feeKRW = Math.ceil(feeKRW / 100) * 100;

  // CNY 변환 (환율 약 185원 = 1위안 기준)
  const exchangeRate = 185;
  const feeCNY = Math.round(feeKRW / exchangeRate);

  return {
    feeKRW,
    feeCNY,
    estimatedDays: baseRates.estimatedDays,
  };
}

/**
 * 여러 배송사의 배송비를 계산하여 비교
 */
export function calculateMultipleShippingRates(
  input: ShippingCalculationInput,
  companies: Array<{
    id: string;
    name: string;
    nameZh: string;
    pricePerKg: number | null;
    minimumFee: number | null;
  }>
): ShippingRate[] {
  const rates: ShippingRate[] = [];
  const baseRates = DEFAULT_SHIPPING_RATES[input.direction];

  for (const company of companies) {
    const { feeKRW, feeCNY, estimatedDays } = calculateShippingFee(
      input,
      company.pricePerKg || undefined,
      company.minimumFee || undefined
    );

    rates.push({
      companyId: company.id,
      companyName: company.name,
      companyNameZh: company.nameZh,
      baseFeeKRW: company.minimumFee || baseRates.baseFeeKRW,
      baseFeeCNY: Math.round((company.minimumFee || baseRates.baseFeeKRW) / 185),
      perKgFeeKRW: company.pricePerKg || baseRates.perKgFeeKRW,
      perKgFeeCNY: Math.round((company.pricePerKg || baseRates.perKgFeeKRW) / 185),
      estimatedDays,
      totalFeeKRW: feeKRW,
      totalFeeCNY: feeCNY,
    });
  }

  // 가격순으로 정렬
  return rates.sort((a, b) => a.totalFeeKRW - b.totalFeeKRW);
}

/**
 * 부피 무게 계산 (가로 x 세로 x 높이 / 6000)
 */
export function calculateVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  return (lengthCm * widthCm * heightCm) / 6000;
}

/**
 * 실제 무게와 부피 무게 중 큰 값 반환
 */
export function getChargeableWeight(
  actualWeightKg: number,
  lengthCm?: number,
  widthCm?: number,
  heightCm?: number
): number {
  if (!lengthCm || !widthCm || !heightCm) {
    return actualWeightKg;
  }

  const volumetricWeight = calculateVolumetricWeight(lengthCm, widthCm, heightCm);
  return Math.max(actualWeightKg, volumetricWeight);
}

/**
 * 한국 지역 코드 반환
 */
export function getKoreaRegionCode(zipCode: string): string {
  const prefix = zipCode.substring(0, 2);

  const regionMap: Record<string, string> = {
    '01': 'KR_SEOUL', '02': 'KR_SEOUL', '03': 'KR_SEOUL', '04': 'KR_SEOUL', '05': 'KR_SEOUL',
    '06': 'KR_SEOUL', '07': 'KR_SEOUL', '08': 'KR_SEOUL', '09': 'KR_SEOUL',
    '10': 'KR_GYEONGGI', '11': 'KR_GYEONGGI', '12': 'KR_GYEONGGI', '13': 'KR_GYEONGGI',
    '14': 'KR_GYEONGGI', '15': 'KR_GYEONGGI', '16': 'KR_GYEONGGI', '17': 'KR_GYEONGGI',
    '18': 'KR_GYEONGGI', '19': 'KR_GYEONGGI',
    '21': 'KR_INCHEON', '22': 'KR_INCHEON', '23': 'KR_INCHEON',
    '24': 'KR_GANGWON', '25': 'KR_GANGWON', '26': 'KR_GANGWON',
    '27': 'KR_CHUNGBUK', '28': 'KR_CHUNGBUK', '29': 'KR_CHUNGBUK',
    '30': 'KR_SEJONG',
    '31': 'KR_CHUNGNAM', '32': 'KR_CHUNGNAM', '33': 'KR_CHUNGNAM',
    '34': 'KR_DAEJEON', '35': 'KR_DAEJEON',
    '36': 'KR_JEONBUK', '37': 'KR_JEONBUK',
    '38': 'KR_GWANGJU',
    '39': 'KR_JEONNAM', '40': 'KR_JEONNAM', '41': 'KR_JEONNAM',
    '42': 'KR_GYEONGBUK', '43': 'KR_GYEONGBUK', '44': 'KR_GYEONGBUK',
    '45': 'KR_DAEGU', '46': 'KR_DAEGU',
    '47': 'KR_GYEONGNAM', '48': 'KR_GYEONGNAM', '49': 'KR_GYEONGNAM', '50': 'KR_GYEONGNAM',
    '51': 'KR_ULSAN', '52': 'KR_ULSAN',
    '53': 'KR_BUSAN', '54': 'KR_BUSAN', '55': 'KR_BUSAN', '56': 'KR_BUSAN',
    '63': 'KR_JEJU',
  };

  return regionMap[prefix] || 'KR_GYEONGGI';
}

// ==================== 배송 추적 ====================

// 배송 상태 타입
export type ShippingStatus =
  | 'PENDING'          // 접수 대기
  | 'PICKED_UP'        // 수거 완료
  | 'IN_TRANSIT_KR'    // 한국 내 운송 중
  | 'CUSTOMS_KR'       // 한국 세관 처리 중
  | 'DEPARTED_KR'      // 한국 출발
  | 'IN_TRANSIT_INT'   // 국제 운송 중
  | 'ARRIVED_CN'       // 중국 도착
  | 'CUSTOMS_CN'       // 중국 세관 처리 중
  | 'IN_TRANSIT_CN'    // 중국 내 운송 중
  | 'OUT_FOR_DELIVERY' // 배송 출발
  | 'DELIVERED'        // 배송 완료
  | 'EXCEPTION';       // 배송 이상

export interface TrackingEvent {
  timestamp: Date;
  status: ShippingStatus;
  location: string;
  locationZh?: string;
  description: string;
  descriptionZh?: string;
}

export interface TrackingResult {
  success: boolean;
  trackingNumber: string;
  carrier: string;
  carrierName: string;
  carrierNameZh: string;
  currentStatus: ShippingStatus;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  error?: string;
}

// 지원되는 배송업체
export const SHIPPING_CARRIERS = {
  // 한국 배송업체
  CJ: { code: 'CJ', name: 'CJ대한통운', nameZh: 'CJ大韩通运' },
  HANJIN: { code: 'HANJIN', name: '한진택배', nameZh: '韩进快递' },
  LOTTE: { code: 'LOTTE', name: '롯데택배', nameZh: '乐天快递' },
  LOGEN: { code: 'LOGEN', name: '로젠택배', nameZh: '路珍快递' },
  POST_KR: { code: 'POST_KR', name: '우체국택배', nameZh: '韩国邮政' },

  // 중국 배송업체
  SF: { code: 'SF', name: 'SF익스프레스', nameZh: '顺丰速运' },
  ZTO: { code: 'ZTO', name: '중통택배', nameZh: '中通快递' },
  YTO: { code: 'YTO', name: '위안퉁택배', nameZh: '圆通速递' },
  YUNDA: { code: 'YUNDA', name: '윈다택배', nameZh: '韵达快递' },
  STO: { code: 'STO', name: '선퉁택배', nameZh: '申通快递' },
  EMS: { code: 'EMS', name: 'EMS', nameZh: '中国邮政EMS' },

  // 국제 배송업체
  DHL: { code: 'DHL', name: 'DHL', nameZh: 'DHL国际快递' },
  FEDEX: { code: 'FEDEX', name: 'FedEx', nameZh: '联邦快递' },
  UPS: { code: 'UPS', name: 'UPS', nameZh: 'UPS快递' },
} as const;

export type CarrierCode = keyof typeof SHIPPING_CARRIERS;

// 배송 상태 한국어/중국어 텍스트
export const STATUS_TEXT: Record<ShippingStatus, { ko: string; zh: string }> = {
  PENDING: { ko: '접수 대기', zh: '待揽收' },
  PICKED_UP: { ko: '수거 완료', zh: '已揽收' },
  IN_TRANSIT_KR: { ko: '한국 내 운송 중', zh: '韩国境内运输中' },
  CUSTOMS_KR: { ko: '한국 세관 처리 중', zh: '韩国海关处理中' },
  DEPARTED_KR: { ko: '한국 출발', zh: '已离开韩国' },
  IN_TRANSIT_INT: { ko: '국제 운송 중', zh: '国际运输中' },
  ARRIVED_CN: { ko: '중국 도착', zh: '已到达中国' },
  CUSTOMS_CN: { ko: '중국 세관 처리 중', zh: '中国海关处理中' },
  IN_TRANSIT_CN: { ko: '중국 내 운송 중', zh: '中国境内运输中' },
  OUT_FOR_DELIVERY: { ko: '배송 출발', zh: '派送中' },
  DELIVERED: { ko: '배송 완료', zh: '已签收' },
  EXCEPTION: { ko: '배송 이상', zh: '异常' },
};

// 운송장 번호로 배송업체 자동 감지
export function detectCarrier(trackingNumber: string): CarrierCode | null {
  const cleaned = trackingNumber.replace(/\D/g, '');

  // CJ대한통운 (10~12자리)
  if (/^\d{10,12}$/.test(cleaned) && cleaned.startsWith('3')) {
    return 'CJ';
  }

  // 한진택배 (10~12자리, 4로 시작)
  if (/^\d{10,12}$/.test(cleaned) && cleaned.startsWith('4')) {
    return 'HANJIN';
  }

  // 롯데택배 (12자리)
  if (/^\d{12}$/.test(cleaned) && cleaned.startsWith('2')) {
    return 'LOTTE';
  }

  // 순풍 SF (15자리, SF로 시작)
  if (/^SF\d{13}$/i.test(trackingNumber)) {
    return 'SF';
  }

  // 중통 ZTO (12자리, 75로 시작)
  if (/^75\d{10}$/.test(cleaned)) {
    return 'ZTO';
  }

  // DHL (10자리)
  if (/^\d{10}$/.test(cleaned)) {
    return 'DHL';
  }

  // FedEx (12~22자리)
  if (/^\d{12,22}$/.test(cleaned)) {
    return 'FEDEX';
  }

  return null;
}

// 배송 추적 API 호출
export async function trackShipment(
  trackingNumber: string,
  carrierCode?: CarrierCode
): Promise<TrackingResult> {
  const carrier = carrierCode || detectCarrier(trackingNumber);

  if (!carrier) {
    return {
      success: false,
      trackingNumber,
      carrier: 'UNKNOWN',
      carrierName: '알 수 없음',
      carrierNameZh: '未知',
      currentStatus: 'PENDING',
      events: [],
      error: '배송업체를 확인할 수 없습니다.',
    };
  }

  const carrierInfo = SHIPPING_CARRIERS[carrier];

  try {
    // 개발 환경에서는 mock 데이터 반환
    if (process.env.NODE_ENV === 'development' || !process.env.TRACKING_API_KEY) {
      return generateMockTracking(trackingNumber, carrier);
    }

    // 실제 배송 추적 API 연동
    // 한국 배송업체는 스마트택배 API, 중국/국제는 17track API 사용
    if (['CJ', 'HANJIN', 'LOTTE', 'LOGEN', 'POST_KR'].includes(carrier)) {
      return await trackWithSmartParcel(trackingNumber, carrier);
    } else {
      return await trackWith17Track(trackingNumber, carrier);
    }
  } catch (error) {
    console.error('Tracking API error:', error);
    return {
      success: false,
      trackingNumber,
      carrier: carrier,
      carrierName: carrierInfo.name,
      carrierNameZh: carrierInfo.nameZh,
      currentStatus: 'EXCEPTION',
      events: [],
      error: '배송 추적 정보를 가져올 수 없습니다.',
    };
  }
}

// Mock 데이터 생성 (개발용)
function generateMockTracking(
  trackingNumber: string,
  carrier: CarrierCode
): TrackingResult {
  const carrierInfo = SHIPPING_CARRIERS[carrier];
  const now = new Date();

  const statuses: ShippingStatus[] = [
    'PICKED_UP',
    'IN_TRANSIT_KR',
    'CUSTOMS_KR',
    'DEPARTED_KR',
    'IN_TRANSIT_INT',
    'ARRIVED_CN',
    'CUSTOMS_CN',
    'IN_TRANSIT_CN',
    'OUT_FOR_DELIVERY',
  ];

  // 운송장 번호 해시로 진행 단계 결정
  const hash = trackingNumber.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const progressIndex = hash % (statuses.length + 1);

  const events: TrackingEvent[] = [];
  let currentStatus: ShippingStatus = progressIndex === statuses.length ? 'DELIVERED' : statuses[progressIndex];

  for (let i = 0; i <= Math.min(progressIndex, statuses.length - 1); i++) {
    const eventDate = new Date(now.getTime() - (progressIndex - i) * 12 * 60 * 60 * 1000);
    const status = i === progressIndex && progressIndex === statuses.length ? 'DELIVERED' : statuses[i];

    events.unshift({
      timestamp: eventDate,
      status,
      location: getMockLocation(status, 'ko'),
      locationZh: getMockLocation(status, 'zh'),
      description: STATUS_TEXT[status].ko,
      descriptionZh: STATUS_TEXT[status].zh,
    });
  }

  if (progressIndex === statuses.length) {
    events.unshift({
      timestamp: now,
      status: 'DELIVERED',
      location: '베이징시 조양구',
      locationZh: '北京市朝阳区',
      description: '배송 완료',
      descriptionZh: '已签收',
    });
    currentStatus = 'DELIVERED';
  }

  return {
    success: true,
    trackingNumber,
    carrier,
    carrierName: carrierInfo.name,
    carrierNameZh: carrierInfo.nameZh,
    currentStatus,
    estimatedDelivery: currentStatus !== 'DELIVERED'
      ? new Date(now.getTime() + (statuses.length - progressIndex) * 12 * 60 * 60 * 1000)
      : undefined,
    events,
  };
}

function getMockLocation(status: ShippingStatus, lang: 'ko' | 'zh'): string {
  const locations: Record<ShippingStatus, { ko: string; zh: string }> = {
    PENDING: { ko: '서울', zh: '首尔' },
    PICKED_UP: { ko: '서울 강남구', zh: '首尔江南区' },
    IN_TRANSIT_KR: { ko: '인천 물류센터', zh: '仁川物流中心' },
    CUSTOMS_KR: { ko: '인천공항 세관', zh: '仁川机场海关' },
    DEPARTED_KR: { ko: '인천국제공항', zh: '仁川国际机场' },
    IN_TRANSIT_INT: { ko: '항공 운송 중', zh: '空运中' },
    ARRIVED_CN: { ko: '베이징 수도공항', zh: '北京首都机场' },
    CUSTOMS_CN: { ko: '베이징 세관', zh: '北京海关' },
    IN_TRANSIT_CN: { ko: '베이징 분류센터', zh: '北京分拣中心' },
    OUT_FOR_DELIVERY: { ko: '베이징시 배송센터', zh: '北京市配送中心' },
    DELIVERED: { ko: '베이징시 조양구', zh: '北京市朝阳区' },
    EXCEPTION: { ko: '알 수 없음', zh: '未知' },
  };

  return locations[status][lang];
}

// ==================== 실제 배송 추적 API 연동 ====================

/**
 * 스마트택배 API를 통한 한국 배송업체 추적
 * https://tracker.delivery
 */
async function trackWithSmartParcel(
  trackingNumber: string,
  carrier: CarrierCode
): Promise<TrackingResult> {
  const carrierInfo = SHIPPING_CARRIERS[carrier];
  const carrierCodeMap: Record<string, string> = {
    CJ: 'kr.cjlogistics',
    HANJIN: 'kr.hanjin',
    LOTTE: 'kr.lotte',
    LOGEN: 'kr.logen',
    POST_KR: 'kr.epost',
  };

  try {
    const carrierCode = carrierCodeMap[carrier];
    const response = await fetch(
      `https://apis.tracker.delivery/carriers/${carrierCode}/tracks/${trackingNumber}`,
      {
        headers: {
          'Authorization': `SMARTPARCEL ${process.env.SMARTPARCEL_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Smart Parcel API error');
    }

    const data = await response.json();

    // API 응답을 우리 포맷으로 변환
    const events: TrackingEvent[] = (data.progresses || []).map((progress: any) => ({
      timestamp: new Date(progress.time),
      status: mapSmartParcelStatus(progress.status?.id || 'in_transit'),
      location: progress.location?.name || '알 수 없음',
      locationZh: translateLocation(progress.location?.name || '알 수 없음'),
      description: progress.description || progress.status?.text || '',
      descriptionZh: translateDescription(progress.description || progress.status?.text || ''),
    }));

    const currentStatus = events.length > 0 ? events[0].status : 'PENDING';

    return {
      success: true,
      trackingNumber,
      carrier,
      carrierName: carrierInfo.name,
      carrierNameZh: carrierInfo.nameZh,
      currentStatus,
      events: events.reverse(), // 최신순 정렬
    };
  } catch (error) {
    console.error('Smart Parcel API error:', error);
    // API 실패 시 mock 데이터 반환
    return generateMockTracking(trackingNumber, carrier);
  }
}

/**
 * 17track API를 통한 중국/국제 배송업체 추적
 * https://www.17track.net
 */
async function trackWith17Track(
  trackingNumber: string,
  carrier: CarrierCode
): Promise<TrackingResult> {
  const carrierInfo = SHIPPING_CARRIERS[carrier];
  const carrierCodeMap: Record<string, number> = {
    SF: 501,      // 순풍 SF Express
    ZTO: 502,     // 중통 ZTO Express
    YTO: 503,     // 위안퉁 YTO Express
    YUNDA: 504,   // 윈다 Yunda Express
    STO: 505,     // 선퉁 STO Express
    EMS: 506,     // EMS
    DHL: 25,      // DHL
    FEDEX: 26,    // FedEx
    UPS: 27,      // UPS
  };

  try {
    const carrierCode = carrierCodeMap[carrier];
    const response = await fetch('https://api.17track.net/track/v2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': process.env.TRACK17_API_KEY || '',
      },
      body: JSON.stringify([
        {
          number: trackingNumber,
          carrier: carrierCode,
        },
      ]),
    });

    if (!response.ok) {
      throw new Error('17track API error');
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data?.accepted?.[0]) {
      throw new Error('17track API returned error');
    }

    // 추적 정보 조회
    const trackResponse = await fetch('https://api.17track.net/track/v2/gettrackinfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': process.env.TRACK17_API_KEY || '',
      },
      body: JSON.stringify([
        {
          number: trackingNumber,
          carrier: carrierCode,
        },
      ]),
    });

    const trackData = await trackResponse.json();

    if (trackData.code !== 0 || !trackData.data?.accepted?.[0]) {
      throw new Error('17track tracking info error');
    }

    const trackInfo = trackData.data.accepted[0];
    const events: TrackingEvent[] = (trackInfo.track?.z0 || []).map((event: any) => ({
      timestamp: new Date(event.a),
      status: map17TrackStatus(event.z),
      location: event.c || '알 수 없음',
      locationZh: event.c || '未知',
      description: translateFrom17Track(event.z),
      descriptionZh: event.z || '',
    }));

    const currentStatus = events.length > 0 ? events[0].status : 'PENDING';

    return {
      success: true,
      trackingNumber,
      carrier,
      carrierName: carrierInfo.name,
      carrierNameZh: carrierInfo.nameZh,
      currentStatus,
      events: events.reverse(),
    };
  } catch (error) {
    console.error('17track API error:', error);
    // API 실패 시 mock 데이터 반환
    return generateMockTracking(trackingNumber, carrier);
  }
}

// 스마트택배 상태를 우리 시스템 상태로 매핑
function mapSmartParcelStatus(status: string): ShippingStatus {
  const statusMap: Record<string, ShippingStatus> = {
    'information_received': 'PENDING',
    'at_pickup': 'PICKED_UP',
    'in_transit': 'IN_TRANSIT_KR',
    'out_for_delivery': 'OUT_FOR_DELIVERY',
    'delivered': 'DELIVERED',
    'exception': 'EXCEPTION',
  };
  return statusMap[status] || 'IN_TRANSIT_KR';
}

// 17track 상태를 우리 시스템 상태로 매핑
function map17TrackStatus(statusText: string): ShippingStatus {
  const text = statusText.toLowerCase();

  if (text.includes('签收') || text.includes('delivered')) return 'DELIVERED';
  if (text.includes('派送') || text.includes('out for delivery')) return 'OUT_FOR_DELIVERY';
  if (text.includes('海关') || text.includes('customs')) {
    if (text.includes('中国') || text.includes('china')) return 'CUSTOMS_CN';
    return 'CUSTOMS_KR';
  }
  if (text.includes('到达') && text.includes('中国')) return 'ARRIVED_CN';
  if (text.includes('离开') && text.includes('韩国')) return 'DEPARTED_KR';
  if (text.includes('揽收') || text.includes('picked')) return 'PICKED_UP';
  if (text.includes('异常') || text.includes('exception')) return 'EXCEPTION';

  return 'IN_TRANSIT_INT';
}

// 한국어 위치를 중국어로 간단 번역
function translateLocation(location: string): string {
  const translations: Record<string, string> = {
    '서울': '首尔',
    '인천': '仁川',
    '부산': '釜山',
    '대구': '大邱',
    '광주': '光州',
    '대전': '大田',
    '울산': '蔚山',
    '세종': '世宗',
    '물류센터': '物流中心',
    '세관': '海关',
    '공항': '机场',
    '배송센터': '配送中心',
  };

  let translated = location;
  Object.entries(translations).forEach(([ko, zh]) => {
    translated = translated.replace(ko, zh);
  });

  return translated;
}

// 한국어 설명을 중국어로 간단 번역
function translateDescription(description: string): string {
  const translations: Record<string, string> = {
    '배송 완료': '已签收',
    '배송 출발': '派送中',
    '운송 중': '运输中',
    '수거 완료': '已揽收',
    '접수 완료': '已接收',
    '세관 통과': '清关完成',
    '세관 처리': '海关处理',
  };

  let translated = description;
  Object.entries(translations).forEach(([ko, zh]) => {
    translated = translated.replace(ko, zh);
  });

  return translated || description;
}

// 17track 상태 텍스트를 한국어로 번역
function translateFrom17Track(text: string): string {
  if (text.includes('签收')) return '배송 완료';
  if (text.includes('派送')) return '배송 출발';
  if (text.includes('揽收')) return '수거 완료';
  if (text.includes('海关')) return '세관 처리 중';
  if (text.includes('到达')) return '도착';
  if (text.includes('离开')) return '출발';
  if (text.includes('异常')) return '배송 이상';

  return '운송 중';
}
