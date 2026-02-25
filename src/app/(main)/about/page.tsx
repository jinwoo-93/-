import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: '회사소개 | 직구역구',
  description: '직구역구 - 한국과 중국을 연결하는 안전한 크로스보더 C2C 마켓플레이스. 에스크로 결제, 국제 배송, 커뮤니티 분쟁해결.',
};

export default function AboutPage() {
  return <AboutContent />;
}
