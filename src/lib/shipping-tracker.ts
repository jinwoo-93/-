/**
 * 배송 추적 서비스
 * Phase 13-5: 외부 배송 추적 API 연동
 *
 * 지원 예정 API:
 * - SmartParcel (한국 → 중국)
 * - SF Express (중국 → 한국)
 */

export interface TrackingInfo {
  trackingNumber: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  currentLocation?: string;
  estimatedDeliveryDate?: Date;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  location: string;
  description: string;
  status: string;
}

/**
 * SmartParcel API 추적
 * @param trackingNumber 송장번호
 * @returns 배송 추적 정보
 */
export async function trackSmartParcel(trackingNumber: string): Promise<TrackingInfo | null> {
  // TODO: SmartParcel API 연동
  // API Key: process.env.SMARTPARCEL_API_KEY
  // API URL: https://api.smartparcel.com/v1/track

  console.log('[SmartParcel] Tracking:', trackingNumber);

  // 임시 더미 데이터
  return {
    trackingNumber,
    status: 'in_transit',
    currentLocation: '서울물류센터',
    estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    events: [
      {
        timestamp: new Date(),
        location: '서울물류센터',
        description: '상품이 물류센터에 도착했습니다',
        status: 'arrived',
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        location: '판교물류센터',
        description: '상품이 발송되었습니다',
        status: 'shipped',
      },
    ],
  };
}

/**
 * SF Express API 추적
 * @param trackingNumber 송장번호
 * @returns 배송 추적 정보
 */
export async function trackSFExpress(trackingNumber: string): Promise<TrackingInfo | null> {
  // TODO: SF Express API 연동
  // API Key: process.env.SFEXPRESS_API_KEY
  // API URL: https://api.sf-express.com/v1/routes

  console.log('[SF Express] Tracking:', trackingNumber);

  // 임시 더미 데이터
  return {
    trackingNumber,
    status: 'in_transit',
    currentLocation: '北京分拣中心',
    estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    events: [
      {
        timestamp: new Date(),
        location: '北京分拣中心',
        description: '快件已到达分拣中心',
        status: 'arrived',
      },
      {
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        location: '上海转运中心',
        description: '快件已从上海发出',
        status: 'departed',
      },
    ],
  };
}

/**
 * 배송 추적 통합 함수
 * @param provider 배송업체 (smartparcel | sfexpress)
 * @param trackingNumber 송장번호
 * @returns 배송 추적 정보
 */
export async function trackShipment(
  provider: string,
  trackingNumber: string
): Promise<TrackingInfo | null> {
  switch (provider.toLowerCase()) {
    case 'smartparcel':
      return trackSmartParcel(trackingNumber);
    case 'sfexpress':
      return trackSFExpress(trackingNumber);
    default:
      console.error('[Shipping Tracker] Unknown provider:', provider);
      return null;
  }
}
