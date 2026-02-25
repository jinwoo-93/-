'use client';

import Link from 'next/link';
import {
  Shield,
  Truck,
  Users,
  Globe,
  ArrowRight,
  Target,
  Eye,
  Zap,
  Scale,
  MessageCircle,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useLanguage } from '@/hooks/useLanguage';

const FEATURES = [
  {
    icon: Shield,
    titleKo: '에스크로 결제',
    titleZh: '担保支付',
    descKo: '구매자의 결제 대금을 안전하게 보관하고, 상품 수령 확인 후 판매자에게 정산합니다.',
    descZh: '安全保管买家的付款，确认收货后结算给卖家。',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Truck,
    titleKo: '한중 양방향 배송',
    titleZh: '韩中双向配送',
    descKo: '한국→중국, 중국→한국 양방향 국제 배송을 제휴 물류사를 통해 안전하게 처리합니다.',
    descZh: '通过合作物流公司安全处理韩国→中国、中国→韩国双向国际配送。',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Scale,
    titleKo: '커뮤니티 분쟁 해결',
    titleZh: '社区争议解决',
    descKo: '거래 분쟁 발생 시 3단계(당사자 협의→커뮤니티 중재→최종 판정) 공정 해결 시스템을 운영합니다.',
    descZh: '交易争议发生时，运营3阶段（当事人协商→社区调解→最终裁定）公正解决系统。',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Globe,
    titleKo: '이중 언어 지원',
    titleZh: '双语支持',
    descKo: '한국어와 중국어를 완벽 지원하여 양국 사용자 모두 편리하게 이용할 수 있습니다.',
    descZh: '完美支持韩语和中文，两国用户都能便捷使用。',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: CreditCard,
    titleKo: '다양한 결제 수단',
    titleZh: '多种支付方式',
    descKo: '토스페이먼츠, Stripe 등 양국 사용자에게 익숙한 결제 수단을 제공합니다.',
    descZh: '提供TossPayments、Stripe等两国用户熟悉的支付方式。',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: MessageCircle,
    titleKo: '실시간 채팅',
    titleZh: '实时聊天',
    descKo: '구매자와 판매자 간 실시간 소통으로 신뢰할 수 있는 거래 환경을 만듭니다.',
    descZh: '买卖双方实时沟通，打造值得信赖的交易环境。',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

const STATS = [
  { valueKo: '10만+', valueZh: '10万+', labelKo: '누적 회원 수', labelZh: '累计会员数' },
  { valueKo: '50만+', valueZh: '50万+', labelKo: '거래 건수', labelZh: '交易笔数' },
  { valueKo: '98%', valueZh: '98%', labelKo: '거래 만족도', labelZh: '交易满意度' },
  { valueKo: '24시간', valueZh: '24小时', labelKo: '고객 지원', labelZh: '客户支持' },
];

const TEAM = [
  {
    roleKo: 'CEO / 대표이사',
    roleZh: 'CEO / 首席执行官',
    nameKo: '홍길동',
    nameZh: '洪吉童',
    descKo: '한중 전자상거래 15년 경력, 전 네이버 글로벌커머스 총괄',
    descZh: '韩中电子商务15年经验，前Naver全球商务总监',
  },
  {
    roleKo: 'CTO / 기술이사',
    roleZh: 'CTO / 首席技术官',
    nameKo: '김개발',
    nameZh: '金开发',
    descKo: '분산 시스템 전문가, 전 카카오 결제 시스템 아키텍트',
    descZh: '分布式系统专家，前Kakao支付系统架构师',
  },
  {
    roleKo: 'COO / 운영이사',
    roleZh: 'COO / 首席运营官',
    nameKo: '이운영',
    nameZh: '李运营',
    descKo: '국제 물류 10년 경력, 전 쿠팡 크로스보더 물류 팀장',
    descZh: '国际物流10年经验，前Coupang跨境物流组长',
  },
];

export default function AboutContent() {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb
        items={[{ labelKo: '회사소개', labelZh: '关于我们' }]}
      />

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">
          {language === 'ko'
            ? '한국과 중국을 연결하는\n안전한 거래 플랫폼'
            : '连接韩国与中国的\n安全交易平台'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-line">
          {language === 'ko'
            ? '직구역구는 한중 크로스보더 C2C 마켓플레이스입니다.\n에스크로 결제와 커뮤니티 분쟁해결로 안심하고 거래하세요.'
            : '直购易购是韩中跨境C2C交易平台。\n通过担保支付和社区争议解决，让您安心交易。'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {STATS.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {language === 'ko' ? stat.valueKo : stat.valueZh}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ko' ? stat.labelKo : stat.labelZh}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {language === 'ko' ? '미션' : '使命'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ko'
                ? '한국과 중국의 개인 간 거래 장벽을 허물고, 누구나 안전하고 편리하게 크로스보더 거래를 할 수 있는 환경을 만듭니다.'
                : '打破韩国与中国个人之间的交易壁垒，为所有人创造安全便捷的跨境交易环境。'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">
                {language === 'ko' ? '비전' : '愿景'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === 'ko'
                ? '아시아 최고의 크로스보더 C2C 마켓플레이스로 성장하여, 동아시아 전역의 개인 간 거래를 연결하는 글로벌 플랫폼을 구축합니다.'
                : '成长为亚洲领先的跨境C2C交易平台，构建连接东亚地区个人间交易的全球平台。'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          {language === 'ko' ? '핵심 가치' : '核心价值'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {language === 'ko'
            ? '직구역구가 추구하는 서비스 가치입니다'
            : '直购易购追求的服务价值'}
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">
                    {language === 'ko' ? feature.titleKo : feature.titleZh}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {language === 'ko' ? feature.descKo : feature.descZh}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          {language === 'ko' ? '경영진 소개' : '管理团队'}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {language === 'ko'
            ? '한중 커머스와 기술 분야의 전문가들이 함께합니다'
            : '韩中商务和技术领域的专家团队'}
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {TEAM.map((member, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-blue-700">
                    {(language === 'ko' ? member.nameKo : member.nameZh).charAt(0)}
                  </span>
                </div>
                <p className="text-xs text-primary font-medium mb-1">
                  {language === 'ko' ? member.roleKo : member.roleZh}
                </p>
                <p className="font-semibold text-sm mb-2">
                  {language === 'ko' ? member.nameKo : member.nameZh}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'ko' ? member.descKo : member.descZh}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">
            {language === 'ko'
              ? '직구역구와 함께 거래를 시작하세요'
              : '与直购易购一起开始交易吧'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {language === 'ko'
              ? '한중 크로스보더 거래, 이제 직구역구에서 안전하게'
              : '韩中跨境交易，在直购易购安全进行'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/register">
                {language === 'ko' ? '회원가입' : '注册'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/seller-guide">
                {language === 'ko' ? '판매자 가이드' : '卖家指南'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
