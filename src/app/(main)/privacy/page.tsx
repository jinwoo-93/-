import type { Metadata } from 'next';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 직구역구',
  description: '직구역구 개인정보처리방침 - 개인정보 수집, 이용, 제3자 제공 및 보호 정책',
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
