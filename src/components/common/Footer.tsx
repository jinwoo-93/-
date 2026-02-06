'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { Logo } from './Logo';
import { Shield, Truck, CreditCard, MessageCircle } from 'lucide-react';

export function Footer() {
  const { language } = useLanguage();

  const footerLinks = {
    company: [
      { href: '/about', labelKo: '회사 소개', labelZh: '关于我们' },
      { href: '/careers', labelKo: '채용 정보', labelZh: '招聘信息' },
      { href: '/press', labelKo: '보도자료', labelZh: '新闻中心' },
      { href: '/terms', labelKo: '이용약관', labelZh: '服务条款' },
      { href: '/privacy', labelKo: '개인정보처리방침', labelZh: '隐私政策' },
    ],
    support: [
      { href: '/help', labelKo: '고객센터', labelZh: '帮助中心' },
      { href: '/faq', labelKo: '자주 묻는 질문', labelZh: '常见问题' },
      { href: '/contact', labelKo: '1:1 문의', labelZh: '在线客服' },
      { href: '/returns', labelKo: '반품/교환 안내', labelZh: '退换货须知' },
      { href: '/shipping-guide', labelKo: '배송 안내', labelZh: '配送指南' },
    ],
    business: [
      { href: '/seller-guide', labelKo: '판매자 가이드', labelZh: '卖家指南' },
      { href: '/seller-register', labelKo: '판매자 등록', labelZh: '商家入驻' },
      { href: '/shipping-partner', labelKo: '배송업체 제휴', labelZh: '物流合作' },
      { href: '/ads', labelKo: '광고 서비스', labelZh: '广告服务' },
      { href: '/api', labelKo: 'API 연동', labelZh: 'API接入' },
    ],
  };

  const trustBadges = [
    {
      icon: Shield,
      labelKo: '에스크로 결제',
      labelZh: '担保支付',
      descKo: '안전한 거래 보장',
      descZh: '安全交易保障',
    },
    {
      icon: Truck,
      labelKo: '국제 배송',
      labelZh: '国际配送',
      descKo: '한중 양방향 배송',
      descZh: '韩中双向配送',
    },
    {
      icon: CreditCard,
      labelKo: '간편 결제',
      labelZh: '便捷支付',
      descKo: '다양한 결제 수단',
      descZh: '多种支付方式',
    },
    {
      icon: MessageCircle,
      labelKo: '실시간 상담',
      labelZh: '实时咨询',
      descKo: '한중 양국어 지원',
      descZh: '中韩双语支持',
    },
  ];

  return (
    <footer className="bg-gray-50 border-t hidden md:block">
      {/* 신뢰 뱃지 */}
      <div className="border-b bg-white">
        <div className="container-app py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <badge.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'ko' ? badge.labelKo : badge.labelZh}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ko' ? badge.descKo : badge.descZh}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 푸터 */}
      <div className="container-app py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* 로고 및 설명 */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ko'
                ? '직구역구는 한국과 중국을 연결하는 안전한 크로스보더 C2C 마켓플레이스입니다. 에스크로 결제와 커뮤니티 분쟁해결로 안심하고 거래하세요.'
                : '直购易购是连接韩国与中国的安全跨境C2C交易平台。通过担保支付和社区仲裁，让您安心交易。'}
            </p>
            {/* 고객센터 정보 */}
            <div className="bg-card p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">
                {language === 'ko' ? '고객센터' : '客服中心'}
              </p>
              <p className="text-2xl font-bold text-primary mb-1">
                {language === 'ko' ? '1588-0000' : '400-000-0000'}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ko'
                  ? '평일 09:00 - 18:00 (주말/공휴일 휴무)'
                  : '工作日 09:00 - 18:00 (周末及节假日休息)'}
              </p>
            </div>
          </div>

          {/* 회사 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">
              {language === 'ko' ? '회사' : '公司'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {language === 'ko' ? link.labelKo : link.labelZh}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">
              {language === 'ko' ? '고객지원' : '客户服务'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {language === 'ko' ? link.labelKo : link.labelZh}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 비즈니스 */}
          <div>
            <h3 className="font-semibold text-sm mb-4">
              {language === 'ko' ? '비즈니스' : '商务合作'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.business.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="border-t bg-gray-100">
        <div className="container-app py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <p>
                {language === 'ko'
                  ? '(주)직구역구 | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890'
                  : '直购易购有限公司 | 法定代表人: 洪吉童 | 统一社会信用代码: 91110000XXXXXXXX'}
              </p>
              <p>
                {language === 'ko'
                  ? '통신판매업 신고번호: 제2024-서울강남-0000호 | 호스팅 서비스: AWS'
                  : '网络交易许可证: 京ICP证XXXXXX号 | 托管服务: AWS'}
              </p>
              <p>
                {language === 'ko'
                  ? '주소: 서울특별시 강남구 테헤란로 123, 10층'
                  : '地址: 首尔特别市江南区德黑兰路123号10楼'}
              </p>
            </div>
            <p className="shrink-0">© 2026 JIKGUYEOKGU. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
