'use client';

import { useState } from 'react';
import {
  Search,
  ChevronDown,
  User,
  ShoppingCart,
  Truck,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface FAQItem {
  q: { ko: string; zh: string };
  a: { ko: string; zh: string };
}

interface FAQCategory {
  id: string;
  icon: React.ElementType;
  label: { ko: string; zh: string };
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    id: 'account',
    icon: User,
    label: { ko: '계정', zh: '账户' },
    items: [
      {
        q: { ko: '회원가입은 어떻게 하나요?', zh: '如何注册？' },
        a: {
          ko: '로그인 페이지에서 휴대폰 번호를 입력하고 인증번호를 받아 가입할 수 있습니다. Google 또는 카카오 계정으로도 간편하게 가입 가능합니다.',
          zh: '在登录页面输入手机号并获取验证码即可注册。也可以使用Google或Kakao账号快捷注册。',
        },
      },
      {
        q: { ko: '비밀번호를 잊어버렸어요', zh: '忘记密码了' },
        a: {
          ko: '직구역구는 비밀번호 없이 휴대폰 인증 또는 소셜 로그인으로 접속합니다. 등록된 휴대폰 번호로 인증번호를 받아 로그인해주세요.',
          zh: '直购易购无需密码，通过手机验证或社交账号登录。请使用注册的手机号接收验证码登录。',
        },
      },
      {
        q: { ko: '판매자 등록은 어떻게 하나요?', zh: '如何注册成为卖家？' },
        a: {
          ko: '마이페이지 > 설정에서 판매자 전환을 신청할 수 있습니다. 사업자의 경우 사업자등록증을 업로드하면 수수료 할인 혜택을 받을 수 있습니다.',
          zh: '可以在"我的页面 > 设置"中申请转换为卖家。企业用户上传营业执照后可享受手续费优惠。',
        },
      },
    ],
  },
  {
    id: 'order',
    icon: ShoppingCart,
    label: { ko: '주문/결제', zh: '订单/支付' },
    items: [
      {
        q: { ko: '주문을 취소하고 싶어요', zh: '想取消订单' },
        a: {
          ko: '결제 대기 상태에서는 주문을 즉시 취소할 수 있습니다. 결제 완료 후에는 판매자에게 취소 요청을 보내야 하며, 배송 시작 후에는 분쟁을 통해 해결해야 합니다.',
          zh: '待付款状态可以立即取消订单。付款后需向卖家发送取消请求，发货后需通过争议解决。',
        },
      },
      {
        q: { ko: '결제 방법은 무엇이 있나요?', zh: '有哪些支付方式？' },
        a: {
          ko: '한국 사용자는 토스페이먼츠(카드, 계좌이체)를, 중국 사용자는 알리페이를 이용할 수 있습니다. 글로벌 결제는 Stripe를 통해 지원됩니다.',
          zh: '韩国用户可使用Toss支付（信用卡、转账），中国用户可使用支付宝。全球支付通过Stripe支持。',
        },
      },
      {
        q: { ko: '에스크로 결제란 무엇인가요?', zh: '什么是担保交易？' },
        a: {
          ko: '에스크로는 구매자가 결제한 금액을 직구역구가 안전하게 보관하고, 구매 확정 후 판매자에게 지급하는 안전 결제 시스템입니다. 분쟁 발생 시 공정한 해결이 가능합니다.',
          zh: '担保交易是直购易购安全保管买家付款，在确认收货后支付给卖家的安全支付系统。发生争议时可以公正解决。',
        },
      },
    ],
  },
  {
    id: 'shipping',
    icon: Truck,
    label: { ko: '배송', zh: '物流' },
    items: [
      {
        q: { ko: '배송은 얼마나 걸리나요?', zh: '配送需要多长时间？' },
        a: {
          ko: '한국→중국은 약 5~7일, 중국→한국은 약 7~10일 소요됩니다. 배송사와 통관 상황에 따라 달라질 수 있습니다.',
          zh: '韩国→中国约5~7天，中国→韩国约7~10天。根据物流公司和通关情况可能有所不同。',
        },
      },
      {
        q: { ko: '배송비는 어떻게 계산되나요?', zh: '运费如何计算？' },
        a: {
          ko: '배송비는 무게, 배송 방향(한→중/중→한), 목적지 지역에 따라 자동 계산됩니다. 제주도나 신장/티벳 등 원거리 지역은 추가 요금이 발생합니다.',
          zh: '运费根据重量、配送方向（韩→中/中→韩）和目的地自动计算。济州岛、新疆/西藏等偏远地区会产生额外费用。',
        },
      },
      {
        q: { ko: '통관 절차는 어떻게 되나요?', zh: '通关流程是怎样的？' },
        a: {
          ko: '개인 사용 목적의 소량 상품은 간이 통관으로 빠르게 처리됩니다. 일정 금액 이상은 관세가 부과될 수 있으며, 배송 추적에서 통관 상태를 확인할 수 있습니다.',
          zh: '个人使用的少量商品通过简易通关快速处理。超过一定金额可能需要缴纳关税，可在物流跟踪中查看通关状态。',
        },
      },
    ],
  },
  {
    id: 'refund',
    icon: RotateCcw,
    label: { ko: '반품/환불', zh: '退换/退款' },
    items: [
      {
        q: { ko: '환불은 어떻게 받나요?', zh: '如何获得退款？' },
        a: {
          ko: '분쟁 해결 후 환불이 결정되면 에스크로에 보관된 금액이 원래 결제 수단으로 반환됩니다. 처리 기간은 결제 수단에 따라 3~7영업일 소요됩니다.',
          zh: '争议解决后确定退款时，担保交易中保管的金额将退回原支付方式。处理时间根据支付方式需3~7个工作日。',
        },
      },
      {
        q: { ko: '반품은 가능한가요?', zh: '可以退货吗？' },
        a: {
          ko: '크로스보더 거래 특성상 반품은 분쟁 절차를 통해 진행됩니다. 분쟁 신청 후 커뮤니티 투표와 관리자 판정을 거쳐 처리됩니다.',
          zh: '由于跨境交易的特殊性，退货通过争议流程进行。提交争议后，经过社区投票和管理员裁决处理。',
        },
      },
    ],
  },
  {
    id: 'dispute',
    icon: AlertTriangle,
    label: { ko: '분쟁 해결', zh: '争议解决' },
    items: [
      {
        q: { ko: '분쟁은 어떻게 해결되나요?', zh: '争议如何解决？' },
        a: {
          ko: '분쟁이 접수되면 ① 판매자에게 통보 → ② 양측 증거 제출 → ③ 커뮤니티 투표 (7일) → ④ 관리자 최종 판정 순서로 진행됩니다.',
          zh: '争议受理后按以下流程进行：① 通知卖家 → ② 双方提交证据 → ③ 社区投票（7天）→ ④ 管理员最终裁决。',
        },
      },
      {
        q: { ko: '커뮤니티 투표는 무엇인가요?', zh: '什么是社区投票？' },
        a: {
          ko: '직구역구의 독특한 분쟁 해결 방식입니다. 인증된 회원들이 양측의 증거를 검토하고 투표하여 공정한 결과를 도출합니다. 투표 결과는 관리자 판정에 참고됩니다.',
          zh: '这是直购易购独特的争议解决方式。经过认证的会员审查双方证据并投票，得出公正结果。投票结果供管理员裁决参考。',
        },
      },
    ],
  },
  {
    id: 'etc',
    icon: HelpCircle,
    label: { ko: '기타', zh: '其他' },
    items: [
      {
        q: { ko: '우수 배지는 어떻게 받나요?', zh: '如何获得优秀徽章？' },
        a: {
          ko: '판매자: 거래 50건 이상, 평점 4.8점 이상, 분쟁률 5% 이하를 달성하면 자동으로 부여됩니다. 배송업체: 배송 100건 이상, 파손률 1% 이하, 분실률 0.5% 이하, 정시 배송률 95% 이상이면 부여됩니다.',
          zh: '卖家：达到50笔以上交易、4.8分以上评分、5%以下争议率后自动获得。物流公司：100次以上配送、1%以下损坏率、0.5%以下丢失率、95%以上准时率后获得。',
        },
      },
      {
        q: { ko: '광고는 어떻게 하나요?', zh: '如何投放广告？' },
        a: {
          ko: '판매자 또는 배송업체는 광고 입찰을 통해 메인 페이지에 상품이나 서비스를 노출할 수 있습니다. 매주 월요일 10시에 입찰이 마감되며, 최고 입찰가 순으로 광고가 게재됩니다.',
          zh: '卖家或物流公司可以通过广告竞价在首页展示商品或服务。每周一10点截止竞价，按最高出价排序展示广告。',
        },
      },
    ],
  },
];

export default function FAQPage() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('account');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const lang = language === 'zh' ? 'zh' : 'ko';

  // 검색 필터링
  const filteredCategories = searchQuery
    ? FAQ_DATA.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a[lang].toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : FAQ_DATA.filter((cat) => cat.id === activeCategory);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {lang === 'ko' ? '자주 묻는 질문' : '常见问题'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {lang === 'ko'
            ? '궁금한 점을 빠르게 찾아보세요'
            : '快速查找您的疑问'}
        </p>
      </div>

      {/* 검색바 */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={
            lang === 'ko' ? 'FAQ 검색...' : '搜索常见问题...'
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setExpandedIndex(null);
          }}
          className="pl-10"
        />
      </div>

      {/* 카테고리 탭 */}
      {!searchQuery && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {FAQ_DATA.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedIndex(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label[lang]}
              </button>
            );
          })}
        </div>
      )}

      {/* FAQ 리스트 */}
      <div className="space-y-3">
        {filteredCategories.map((cat) => (
          <div key={cat.id}>
            {searchQuery && (
              <div className="flex items-center gap-2 mb-2 mt-4">
                <cat.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  {cat.label[lang]}
                </span>
              </div>
            )}
            {cat.items.map((item, idx) => {
              const globalIndex = searchQuery
                ? FAQ_DATA.findIndex((c) => c.id === cat.id) * 100 + idx
                : idx;
              const isExpanded = expandedIndex === globalIndex;

              return (
                <Card key={idx} className="overflow-hidden">
                  <button
                    onClick={() => toggleExpand(globalIndex)}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{item.q[lang]}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-4 px-4">
                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.a[lang]}
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ))}

        {filteredCategories.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {lang === 'ko'
                ? '검색 결과가 없습니다'
                : '没有搜索结果'}
            </p>
          </div>
        )}
      </div>

      {/* 추가 도움 */}
      <Card className="mt-8">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {lang === 'ko'
              ? '원하는 답변을 찾지 못하셨나요?'
              : '没有找到想要的答案？'}
          </p>
          <a
            href="/help"
            className="text-sm font-medium text-primary hover:underline"
          >
            {lang === 'ko' ? '고객센터로 문의하기 →' : '联系客服中心 →'}
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
