'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';

export function Footer() {
  const { language } = useLanguage();

  const footerLinks = {
    company: [
      { href: '/about', labelKo: '회사 소개', labelZh: '关于我们' },
      { href: '/careers', labelKo: '채용 정보', labelZh: '招聘信息' },
      { href: '/terms', labelKo: '이용약관', labelZh: '服务条款' },
      { href: '/privacy', labelKo: '개인정보처리방침', labelZh: '隐私政策' },
    ],
    support: [
      { href: '/help', labelKo: '고객센터', labelZh: '帮助中心' },
      { href: '/faq', labelKo: '자주 묻는 질문', labelZh: '常见问题' },
      { href: '/contact', labelKo: '1:1 문의', labelZh: '在线客服' },
      { href: '/shipping-guide', labelKo: '배송 안내', labelZh: '配送指南' },
    ],
    business: [
      { href: '/seller-guide', labelKo: '판매자 가이드', labelZh: '卖家指南' },
      { href: '/seller-register', labelKo: '판매자 등록', labelZh: '商家入驻' },
      { href: '/shipping-partner', labelKo: '배송업체 제휴', labelZh: '物流合作' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-100 hidden md:block">
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* 브랜드 & 고객센터 */}
          <div className="md:col-span-2 space-y-5">
            <span className="text-[16px] font-black tracking-tight text-black">
              JIKGUYEOKGU
            </span>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              {language === 'ko'
                ? '한국과 중국을 연결하는 크로스보더 C2C 마켓플레이스. 에스크로 결제와 커뮤니티 분쟁해결로 안심 거래.'
                : '连接韩国与中国的跨境C2C交易平台。通过担保支付和社区仲裁，安心交易。'}
            </p>
            <div className="border border-gray-200 p-4">
              <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {language === 'ko' ? '고객센터' : '客服中心'}
              </p>
              <p className="text-[22px] font-black text-black mb-1">
                {language === 'ko' ? '1588-0000' : '400-000-0000'}
              </p>
              <p className="text-[11px] text-gray-400">
                {language === 'ko'
                  ? '평일 09:00 - 18:00 (주말/공휴일 휴무)'
                  : '工作日 09:00 - 18:00 (周末及节假日休息)'}
              </p>
            </div>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-4">
              {language === 'ko' ? '회사' : '公司'}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 hover:text-black transition-colors"
                  >
                    {language === 'ko' ? link.labelKo : link.labelZh}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-4">
              {language === 'ko' ? '고객지원' : '客户服务'}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 hover:text-black transition-colors"
                  >
                    {language === 'ko' ? link.labelKo : link.labelZh}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 비즈니스 */}
          <div>
            <h3 className="text-[12px] font-bold text-black uppercase tracking-wider mb-4">
              {language === 'ko' ? '비즈니스' : '商务合作'}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.business.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-500 hover:text-black transition-colors"
                  >
                    {language === 'ko' ? link.labelKo : link.labelZh}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="border-t border-gray-100">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[11px] text-gray-400">
            <div className="space-y-0.5">
              <p>
                {language === 'ko'
                  ? '(주)직구역구 | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890'
                  : '直购易购有限公司 | 法定代表人: 洪吉童 | 统一社会信用代码: 91110000XXXXXXXX'}
              </p>
              <p>
                {language === 'ko'
                  ? '통신판매업 신고번호: 제2024-서울강남-0000호'
                  : '网络交易许可证: 京ICP证XXXXXX号'}
              </p>
            </div>
            <p className="shrink-0">&copy; 2026 JIKGUYEOKGU. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
