import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '직구역구 | 한중 크로스보더 C2C 마켓플레이스',
  description: '한국과 중국을 연결하는 개인간 직거래 플랫폼. K뷰티, K패션부터 중국 전자제품까지 안전한 에스크로 결제로 거래하세요.',
  keywords: ['직구', '역직구', '한중 거래', '크로스보더', 'C2C', '에스크로'],
  openGraph: {
    title: '직구역구 | 한중 크로스보더 C2C 마켓플레이스',
    description: '한국과 중국을 연결하는 개인간 직거래 플랫폼',
    type: 'website',
    locale: 'ko_KR',
    alternateLocale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
