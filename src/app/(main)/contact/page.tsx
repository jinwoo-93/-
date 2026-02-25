import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: '고객센터 | 직구역구',
  description: '직구역구 고객센터 - 1:1 문의, 운영 시간, 연락처 안내',
};

export default function ContactPage() {
  return <ContactContent />;
}
