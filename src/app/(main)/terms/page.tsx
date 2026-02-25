import type { Metadata } from 'next';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: '이용약관 | 직구역구',
  description: '직구역구 서비스 이용약관 - 한중 크로스보더 C2C 마켓플레이스 거래 규칙 및 회원 약관',
};

export default function TermsPage() {
  return <TermsContent />;
}
