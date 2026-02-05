'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Headphones,
  MessageCircle,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  User,
  AlertTriangle,
  Lightbulb,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

const supportCategories = [
  {
    id: 'ORDER',
    icon: Package,
    nameKo: '주문/결제',
    nameZh: '订单/支付',
    descKo: '주문 및 결제 관련 문의',
    descZh: '订单和支付相关问题',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'SHIPPING',
    icon: Truck,
    nameKo: '배송',
    nameZh: '配送',
    descKo: '배송 조회 및 배송 관련 문의',
    descZh: '物流查询和配送相关问题',
    color: 'text-green-600 bg-green-50',
  },
  {
    id: 'REFUND',
    icon: CreditCard,
    nameKo: '환불/취소',
    nameZh: '退款/取消',
    descKo: '환불 및 주문 취소 관련 문의',
    descZh: '退款和订单取消相关问题',
    color: 'text-orange-600 bg-orange-50',
  },
  {
    id: 'ACCOUNT',
    icon: User,
    nameKo: '계정',
    nameZh: '账户',
    descKo: '계정 및 회원 정보 관련 문의',
    descZh: '账户和会员信息相关问题',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    id: 'REPORT',
    icon: AlertTriangle,
    nameKo: '신고',
    nameZh: '举报',
    descKo: '판매자/상품 신고',
    descZh: '卖家/商品举报',
    color: 'text-red-600 bg-red-50',
  },
  {
    id: 'SUGGESTION',
    icon: Lightbulb,
    nameKo: '제안/건의',
    nameZh: '建议/意见',
    descKo: '서비스 개선 제안',
    descZh: '服务改进建议',
    color: 'text-yellow-600 bg-yellow-50',
  },
];

const faqs = [
  {
    questionKo: '주문 후 얼마나 걸려서 배송되나요?',
    questionZh: '下单后多久能送达？',
    answerKo: '국제 배송은 보통 7-14일 정도 소요됩니다. 항공 특송은 3-5일, 해상 운송은 2-3주 정도 걸립니다.',
    answerZh: '国际快递通常需要7-14天。航空特快需要3-5天，海运需要2-3周。',
  },
  {
    questionKo: '환불은 어떻게 받을 수 있나요?',
    questionZh: '如何获得退款？',
    answerKo: '에스크로 결제 시스템으로 구매 확정 전까지 결제금이 보관됩니다. 분쟁 발생 시 배심원 투표를 통해 환불 여부가 결정됩니다.',
    answerZh: '通过托管支付系统，在确认收货前货款将被保管。发生纠纷时，通过陪审团投票决定是否退款。',
  },
  {
    questionKo: '관세는 누가 부담하나요?',
    questionZh: '关税由谁承担？',
    answerKo: '기본적으로 관세는 구매자가 부담합니다. 상품 페이지에서 예상 관세를 확인할 수 있습니다.',
    answerZh: '基本上关税由买家承担。您可以在商品页面查看预估关税。',
  },
  {
    questionKo: '분쟁이 발생하면 어떻게 되나요?',
    questionZh: '发生纠纷怎么办？',
    answerKo: '한중 양국에서 선정된 배심원 10명(각 5명)이 증거를 검토하고 투표합니다. 과반수 의견에 따라 분쟁이 해결됩니다.',
    answerZh: '由韩中两国选出的10名陪审员（各5名）审查证据并投票。根据多数意见解决纠纷。',
  },
];

export default function HelpPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // 카카오톡 채널 URL
  const kakaoChannelUrl = 'https://pf.kakao.com/_xkxkxkx/chat';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container-app text-center">
          <Headphones className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ko' ? '고객센터' : '客服中心'}
          </h1>
          <p className="text-blue-100">
            {language === 'ko'
              ? '무엇을 도와드릴까요?'
              : '有什么可以帮助您的？'}
          </p>
        </div>
      </div>

      <div className="container-app py-8 space-y-8">
        {/* 빠른 연락 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 카카오톡 상담 */}
          <a
            href={kakaoChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-[#FEE500] border-none">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#3C1E1E]/10">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 3C6.48 3 2 6.58 2 11c0 2.8 1.8 5.27 4.55 6.72-.2.73-.77 2.65-.88 3.06-.14.52.19.51.4.37.17-.11 2.69-1.81 3.78-2.55.7.1 1.42.15 2.15.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#3C1E1E]">
                    {language === 'ko' ? '카카오톡 1:1 상담' : '카카오톡一对一咨询'}
                  </h3>
                  <p className="text-sm text-[#3C1E1E]/70">
                    {language === 'ko' ? '실시간 채팅 상담' : '实时聊天咨询'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto text-[#3C1E1E]" />
              </div>
            </Card>
          </a>

          {/* 전화 상담 */}
          <a href="tel:1588-0000" className="block">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold">
                    {language === 'ko' ? '전화 상담' : '电话咨询'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '1588-0000' : '400-000-0000'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
              </div>
            </Card>
          </a>

          {/* 이메일 문의 */}
          <Link href="/help/contact">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold">
                    {language === 'ko' ? '1:1 문의하기' : '一对一咨询'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ko' ? '24시간 접수' : '24小时受理'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 ml-auto text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* 운영시간 */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <span className="font-medium text-blue-800">
                {language === 'ko' ? '운영시간' : '营业时间'}
              </span>
              <span className="text-blue-600 ml-2">
                {language === 'ko'
                  ? '평일 09:00 - 18:00 (한국 시간) / 08:00 - 17:00 (중국 시간)'
                  : '工作日 08:00 - 17:00 (中国时间) / 09:00 - 18:00 (韩国时间)'}
              </span>
            </div>
          </div>
        </Card>

        {/* 문의 유형 */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            {language === 'ko' ? '문의 유형' : '咨询类型'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {supportCategories.map((category) => (
              <Link key={category.id} href={`/help/contact?category=${category.id}`}>
                <Card className="p-4 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold mb-1">
                    {language === 'ko' ? category.nameKo : category.nameZh}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {language === 'ko' ? category.descKo : category.descZh}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 자주 묻는 질문 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {language === 'ko' ? '자주 묻는 질문' : '常见问题'}
            </h2>
            <Link href="/faq">
              <Button variant="ghost" size="sm">
                {language === 'ko' ? '전체보기' : '查看全部'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <Card className="divide-y">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">
                      {language === 'ko' ? faq.questionKo : faq.questionZh}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="mt-3 pl-8 text-gray-600 text-sm">
                    {language === 'ko' ? faq.answerKo : faq.answerZh}
                  </div>
                )}
              </div>
            ))}
          </Card>
        </section>

        {/* 내 문의 내역 */}
        {session && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {language === 'ko' ? '내 문의 내역' : '我的咨询记录'}
              </h2>
              <Link href="/help/tickets">
                <Button variant="ghost" size="sm">
                  {language === 'ko' ? '전체보기' : '查看全部'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <Card className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 mb-4">
                {language === 'ko'
                  ? '문의 내역이 없습니다.'
                  : '暂无咨询记录。'}
              </p>
              <Link href="/help/contact">
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  {language === 'ko' ? '1:1 문의하기' : '一对一咨询'}
                </Button>
              </Link>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
