import type { Metadata } from 'next';
import SellerGuideContent from './SellerGuideContent';

export const metadata: Metadata = {
  title: '판매자 가이드 | 직구역구',
  description: '직구역구 판매자 가이드 - 판매자 등록, 상품 등록, 배송, 정산 방법 안내',
};

export default function SellerGuidePage() {
  return <SellerGuideContent />;
}
