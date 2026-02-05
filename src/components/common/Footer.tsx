'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Logo } from './Logo';

export function Footer() {
  const { t, language } = useLanguage();

  const footerLinks = {
    company: [
      { href: '/about', label: language === 'ko' ? '회사 소개' : '关于我们' },
      { href: '/terms', label: language === 'ko' ? '이용약관' : '服务条款' },
      { href: '/privacy', label: language === 'ko' ? '개인정보 처리방침' : '隐私政策' },
    ],
    support: [
      { href: '/help', label: language === 'ko' ? '고객센터' : '帮助中心' },
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: language === 'ko' ? '문의하기' : '联系我们' },
    ],
    business: [
      { href: '/seller-guide', label: language === 'ko' ? '판매자 가이드' : '卖家指南' },
      { href: '/shipping-partner', label: language === 'ko' ? '배송업체 등록' : '物流合作' },
      { href: '/ads', label: language === 'ko' ? '광고 안내' : '广告服务' },
    ],
  };

  return (
    <footer className="border-t bg-white">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 설명 */}
          <div className="space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground">
              {language === 'ko'
                ? '한국과 중국을 연결하는 안전한 크로스보더 C2C 마켓플레이스'
                : '连接韩国与中国的安全跨境C2C交易平台'}
            </p>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="font-semibold mb-4">
              {language === 'ko' ? '회사' : '公司'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="font-semibold mb-4">
              {language === 'ko' ? '고객지원' : '客服'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 비즈니스 */}
          <div>
            <h3 className="font-semibold mb-4">
              {language === 'ko' ? '비즈니스' : '商务'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.business.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 직구역구. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {language === 'ko'
                  ? '고객센터: 1588-0000'
                  : '客服热线: 400-000-0000'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
