'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  UserPlus,
  Package,
  Truck,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Store,
  Camera,
  FileText,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useLanguage } from '@/hooks/useLanguage';

interface GuideStep {
  icon: React.ElementType;
  titleKo: string;
  titleZh: string;
  descKo: string;
  descZh: string;
  stepsKo: string[];
  stepsZh: string[];
}

const GUIDE_STEPS: GuideStep[] = [
  {
    icon: UserPlus,
    titleKo: '1단계: 판매자 등록',
    titleZh: '第1步：卖家注册',
    descKo: '판매자 계정을 등록하고 본인 인증을 완료하세요.',
    descZh: '注册卖家账户并完成身份验证。',
    stepsKo: [
      '회원가입 후 마이페이지 → 판매자 등록 메뉴로 이동합니다.',
      '휴대폰 인증을 통해 본인 확인을 완료합니다.',
      '판매자 유형을 선택합니다 (개인/사업자).',
      '사업자의 경우 사업자등록증을 업로드합니다.',
      '심사 완료 후 판매 활동을 시작할 수 있습니다. (1-2영업일)',
    ],
    stepsZh: [
      '注册会员后进入我的页面 → 卖家注册菜单。',
      '通过手机验证完成身份确认。',
      '选择卖家类型（个人/企业）。',
      '企业卖家需上传营业执照。',
      '审核完成后即可开始销售活动。（1-2个工作日）',
    ],
  },
  {
    icon: Package,
    titleKo: '2단계: 상품 등록',
    titleZh: '第2步：商品登记',
    descKo: '상품 정보를 정확하게 입력하여 등록하세요.',
    descZh: '准确填写商品信息并登记。',
    stepsKo: [
      '홈 → 글쓰기 버튼을 클릭합니다.',
      '거래 방향을 선택합니다 (한국→중국 / 중국→한국).',
      '카테고리를 선택하고 상품 제목을 입력합니다.',
      '상품 설명을 한국어/중국어로 작성합니다.',
      '가격을 KRW/CNY로 설정합니다.',
      '상품 이미지를 최소 1장, 최대 10장 업로드합니다.',
      '배송 방법과 예상 무게를 입력합니다.',
    ],
    stepsZh: [
      '首页 → 点击发布按钮。',
      '选择交易方向（韩国→中国 / 中国→韩国）。',
      '选择类别并输入商品标题。',
      '用韩语/中文撰写商品描述。',
      '设置KRW/CNY价格。',
      '上传商品图片，最少1张，最多10张。',
      '输入配送方式和预计重量。',
    ],
  },
  {
    icon: Truck,
    titleKo: '3단계: 주문 처리 및 배송',
    titleZh: '第3步：订单处理及配送',
    descKo: '주문이 들어오면 빠르게 상품을 발송하세요.',
    descZh: '收到订单后请尽快发货。',
    stepsKo: [
      '새 주문 알림을 확인합니다 (앱 푸시 + 문자).',
      '마이페이지 → 판매 관리에서 주문 상세를 확인합니다.',
      '결제 완료 후 3영업일 이내에 상품을 발송합니다.',
      '제휴 배송업체를 선택하고 배송을 접수합니다.',
      '운송장 번호를 입력하면 구매자에게 자동 알림됩니다.',
      '배송 추적은 실시간으로 제공됩니다.',
    ],
    stepsZh: [
      '确认新订单通知（App推送 + 短信）。',
      '在我的页面 → 销售管理中查看订单详情。',
      '付款完成后3个工作日内发货。',
      '选择合作物流公司并提交配送。',
      '输入运单号后，买家将收到自动通知。',
      '实时提供物流追踪。',
    ],
  },
  {
    icon: Banknote,
    titleKo: '4단계: 정산',
    titleZh: '第4步：结算',
    descKo: '구매 확인 후 판매 대금이 정산됩니다.',
    descZh: '买家确认收货后，销售款项将进行结算。',
    stepsKo: [
      '구매자가 상품 수령 확인을 하면 정산이 시작됩니다.',
      '7일 이내 수령 확인이 없으면 자동으로 구매 확인 처리됩니다.',
      '판매 수수료(3~5%)가 차감됩니다.',
      '정산 금액은 등록된 계좌로 입금됩니다.',
      '정산 주기: 매주 수요일 (전주 확정분)',
      '마이페이지 → 정산 내역에서 상세 확인이 가능합니다.',
    ],
    stepsZh: [
      '买家确认收货后开始结算。',
      '7日内未确认收货将自动确认购买。',
      '扣除销售手续费（3~5%）。',
      '结算金额将汇入注册的账户。',
      '结算周期：每周三（上周确认的部分）。',
      '可在我的页面 → 结算明细中查看详情。',
    ],
  },
];

const TIPS = [
  {
    icon: Camera,
    titleKo: '좋은 상품 사진 촬영 팁',
    titleZh: '拍摄好的商品照片技巧',
    tipsKo: [
      '밝은 자연광에서 촬영하세요',
      '다양한 각도(정면, 측면, 상세)로 촬영하세요',
      '실제 크기를 가늠할 수 있는 비교 사진을 포함하세요',
      '결함이 있다면 솔직하게 보여주세요',
    ],
    tipsZh: [
      '在明亮的自然光下拍摄',
      '从多个角度（正面、侧面、细节）拍摄',
      '包含可以估计实际尺寸的对比照片',
      '如有瑕疵请如实展示',
    ],
  },
  {
    icon: FileText,
    titleKo: '효과적인 상품 설명 작성법',
    titleZh: '有效的商品描述写法',
    tipsKo: [
      '상품의 브랜드, 모델명을 정확히 기재하세요',
      '사이즈, 색상, 소재 등 상세 정보를 빠짐없이 작성하세요',
      '상품 상태를 솔직하게 설명하세요 (새상품/중고)',
      '한국어와 중국어 모두 작성하면 노출이 2배가 됩니다',
    ],
    tipsZh: [
      '准确填写商品品牌、型号',
      '完整填写尺寸、颜色、材质等详细信息',
      '如实描述商品状态（全新/二手）',
      '同时用韩语和中文撰写可获得双倍曝光',
    ],
  },
  {
    icon: Calculator,
    titleKo: '가격 설정 전략',
    titleZh: '定价策略',
    tipsKo: [
      '유사 상품의 시세를 확인하세요',
      '배송비를 고려하여 가격을 설정하세요',
      '수수료(3~5%)를 감안하여 마진을 계산하세요',
      '합리적인 가격이 더 빠른 판매로 이어집니다',
    ],
    tipsZh: [
      '查看类似商品的市场价格',
      '考虑配送费设置价格',
      '考虑手续费（3~5%）计算利润',
      '合理的价格能促进更快销售',
    ],
  },
];

interface FAQItem {
  qKo: string;
  qZh: string;
  aKo: string;
  aZh: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    qKo: '판매자 등록에 비용이 있나요?',
    qZh: '卖家注册需要费用吗？',
    aKo: '아니요, 판매자 등록은 무료입니다. 상품 판매 시에만 거래 수수료(3~5%)가 부과됩니다.',
    aZh: '不需要，卖家注册免费。仅在商品销售时收取交易手续费（3~5%）。',
  },
  {
    qKo: '해외 배송은 어떻게 하나요?',
    qZh: '国际配送怎么办？',
    aKo: '직구역구와 제휴한 국제 배송업체를 통해 편리하게 발송할 수 있습니다. 주문 확인 후 배송업체를 선택하고 접수하면 수거부터 배송까지 자동으로 처리됩니다.',
    aZh: '可通过与直购易购合作的国际物流公司便捷发货。确认订单后选择物流公司并提交，从取件到配送都会自动处理。',
  },
  {
    qKo: '정산은 언제 받을 수 있나요?',
    qZh: '什么时候能收到结算款？',
    aKo: '구매자의 구매 확인 후, 매주 수요일에 전주 확정분이 등록된 계좌로 입금됩니다. 최초 정산까지는 영업일 기준 3-5일이 소요될 수 있습니다.',
    aZh: '买家确认购买后，每周三将上周确认的款项汇入注册账户。首次结算可能需要3-5个工作日。',
  },
  {
    qKo: '구매자가 분쟁을 신청하면 어떻게 되나요?',
    qZh: '如果买家提出争议怎么办？',
    aKo: '분쟁이 신청되면 에스크로 대금이 동결되고, 3단계(당사자 협의→커뮤니티 중재→최종 판정) 절차를 통해 공정하게 해결됩니다. 증거 자료를 성실히 제출해주시면 됩니다.',
    aZh: '提出争议后，担保金将被冻结，通过3阶段（当事人协商→社区调解→最终裁定）程序公正解决。请如实提交证据资料。',
  },
  {
    qKo: '금지 상품이 있나요?',
    qZh: '有禁止销售的商品吗？',
    aKo: '네, 위조품/모조품, 법률 위반 상품, 위험물, 성인용품, 의약품, 동식물 등은 판매가 금지됩니다. 자세한 내용은 이용약관을 확인해주세요.',
    aZh: '是的，假冒/仿制品、违法商品、危险品、成人用品、药品、动植物等禁止销售。详情请查看服务条款。',
  },
];

export default function SellerGuideContent() {
  const { language } = useLanguage();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb
        items={[{ labelKo: '판매자 가이드', labelZh: '卖家指南' }]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
          <Store className="h-5 w-5 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold">
          {language === 'ko' ? '판매자 가이드' : '卖家指南'}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        {language === 'ko'
          ? '직구역구에서 판매를 시작하는 방법을 안내합니다'
          : '为您介绍在直购易购开始销售的方法'}
      </p>

      {/* Quick Start CTA */}
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold mb-1">
              {language === 'ko' ? '지금 바로 판매를 시작하세요!' : '立即开始销售！'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {language === 'ko'
                ? '등록비 무료, 판매 수수료 3~5%만 부과됩니다.'
                : '注册免费，仅收取3~5%的销售手续费。'}
            </p>
          </div>
          <Button asChild>
            <Link href="/register">
              {language === 'ko' ? '판매자 등록하기' : '注册成为卖家'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Step-by-Step Guide */}
      <div className="space-y-6 mb-12">
        {GUIDE_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-semibold">
                      {language === 'ko' ? step.titleKo : step.titleZh}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground mt-0.5">
                      {language === 'ko' ? step.descKo : step.descZh}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <ol className="space-y-2 ml-2">
                  {(language === 'ko' ? step.stepsKo : step.stepsZh).map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{s}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selling Tips */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          {language === 'ko' ? '판매 꿀팁' : '销售小贴士'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TIPS.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card key={index}>
                <CardContent className="p-5">
                  <Icon className="h-6 w-6 text-primary mb-3" />
                  <h3 className="font-semibold text-sm mb-3">
                    {language === 'ko' ? tip.titleKo : tip.titleZh}
                  </h3>
                  <ul className="space-y-2">
                    {(language === 'ko' ? tip.tipsKo : tip.tipsZh).map((t, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">-</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-purple-500" />
          {language === 'ko' ? '자주 묻는 질문' : '常见问题'}
        </h2>
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, index) => {
            const isExpanded = expandedFAQ === index;
            return (
              <Card key={index}>
                <button
                  onClick={() => setExpandedFAQ(isExpanded ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-sm pr-4">
                    {language === 'ko' ? faq.qKo : faq.qZh}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <CardContent className="pt-0 pb-4 px-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === 'ko' ? faq.aKo : faq.aZh}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Additional Help */}
      <Card className="bg-muted/50">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {language === 'ko'
              ? '더 궁금한 점이 있으신가요?'
              : '还有其他问题吗？'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/faq">
                {language === 'ko' ? 'FAQ 전체 보기' : '查看全部FAQ'}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/contact">
                {language === 'ko' ? '1:1 문의하기' : '在线客服'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
