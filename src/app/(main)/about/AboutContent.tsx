'use client';

import { useState, useEffect } from 'react';
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
    titleKo: '안전한 에스크로 결제',
    titleZh: '安全的托管支付',
    descKo: '구매 확정 전까지 결제금을 안전하게 보관합니다. 상품 수령 후 확인 버튼을 누르면 판매자에게 결제금이 전달됩니다. 분쟁 발생 시에도 보호됩니다.',
    descZh: '在确认收货前安全保管货款。收到商品并确认后，货款将转给卖家。发生纠纷时也会受到保护。',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Truck,
    titleKo: '양방향 국제 배송',
    titleZh: '双向国际配送',
    descKo: '한국↔중국 양방향 직구/역직구를 모두 지원합니다. 항공배송(3-7일), 해상배송(14-21일) 중 선택 가능하며, 실시간 배송 추적 서비스를 제공합니다.',
    descZh: '支持韩国↔中国双向直购/逆直购。可选择空运（3-7天）或海运（14-21天），并提供实时物流跟踪服务。',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Scale,
    titleKo: '투명한 커뮤니티 분쟁 해결',
    titleZh: '透明的社区纠纷解决',
    descKo: '분쟁 발생 시 한국과 중국 양국의 배심원 10명이 투표로 공정하게 판단합니다. 모든 증거와 투표 결과는 투명하게 공개되며, 다수결로 최종 결정됩니다.',
    descZh: '发生纠纷时，由韩中两国10名陪审团通过投票公平裁决。所有证据和投票结果透明公开，以多数表决做出最终决定。',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Globe,
    titleKo: '실시간 자동 번역',
    titleZh: '实时自动翻译',
    descKo: '한국어와 중국어 간 실시간 자동 번역을 지원하여 언어 장벽 없이 소통할 수 있습니다. 상품 설명, 채팅, 리뷰 모두 자동 번역됩니다.',
    descZh: '支持韩语和中文之间的实时自动翻译，无语言障碍沟通。商品描述、聊天、评论均可自动翻译。',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: CreditCard,
    titleKo: '합리적인 수수료',
    titleZh: '合理的手续费',
    descKo: '개인 판매자 5%, 사업자 3%의 낮은 수수료로 더 많은 수익을 가져가세요. 추가 숨은 비용은 일체 없으며, 투명한 정산 시스템을 운영합니다.',
    descZh: '个人卖家5%，企业卖家3%的低手续费，让您获得更多收益。无任何隐藏费用，运营透明的结算系统。',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: MessageCircle,
    titleKo: '실시간 1:1 채팅',
    titleZh: '实时1对1聊天',
    descKo: '판매자와 구매자 간 실시간 채팅으로 빠른 문의와 협상이 가능합니다. 자동 번역 기능으로 언어가 달라도 원활한 소통이 가능합니다.',
    descZh: '卖家和买家之间可实时聊天，快速咨询和协商。通过自动翻译功能，即使语言不同也能顺畅沟通。',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
];

interface PlatformStats {
  userCount: number;
  orderCount: number;
  satisfaction: number;
}

export default function AboutContent() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<PlatformStats>({
    userCount: 0,
    orderCount: 0,
    satisfaction: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 숫자 포맷 함수
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}${language === 'ko' ? '만' : '万'}+`;
    }
    return num.toLocaleString();
  };

  const platformStats = [
    {
      value: formatNumber(stats.userCount),
      labelKo: '누적 회원 수',
      labelZh: '累计会员数',
    },
    {
      value: formatNumber(stats.orderCount),
      labelKo: '거래 건수',
      labelZh: '交易笔数',
    },
    {
      value: stats.satisfaction > 0 ? `${stats.satisfaction}%` : '-',
      labelKo: '거래 만족도',
      labelZh: '交易满意度',
    },
    {
      valueKo: '평일 9-18시',
      valueZh: '工作日 9-18时',
      labelKo: '고객 지원',
      labelZh: '客户支持',
    },
  ];

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
        {platformStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              {isLoading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded mb-2" />
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {'valueKo' in stat && 'valueZh' in stat
                    ? language === 'ko'
                      ? stat.valueKo
                      : stat.valueZh
                    : stat.value}
                </p>
              )}
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

      {/* Company Info */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          {language === 'ko' ? '회사 정보' : '公司信息'}
        </h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-sm text-muted-foreground min-w-[80px]">
                  {language === 'ko' ? '대표자' : '代表'}
                </span>
                <span className="text-sm font-medium">
                  {language === 'ko' ? '박병찬' : '朴秉灿'}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-muted-foreground min-w-[80px]">
                  {language === 'ko' ? '고객센터' : '客服中心'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {language === 'ko' ? '평일 09:00 - 18:00' : '工作日 09:00 - 18:00'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">
                  {language === 'ko'
                    ? '※ 사업자등록번호, 주소, 연락처 등은 사업자 등록 후 공개됩니다.'
                    : '※ 营业执照号码、地址、联系方式等将在完成企业注册后公开。'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
