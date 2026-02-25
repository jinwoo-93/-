'use client';

import { useState } from 'react';
import { ChevronDown, FileText, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useLanguage } from '@/hooks/useLanguage';

interface TermsSection {
  id: string;
  titleKo: string;
  titleZh: string;
  articles: {
    titleKo: string;
    titleZh: string;
    contentKo: string;
    contentZh: string;
  }[];
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'general',
    titleKo: '제1장 총칙',
    titleZh: '第一章 总则',
    articles: [
      {
        titleKo: '제1조 (목적)',
        titleZh: '第1条（目的）',
        contentKo:
          '이 약관은 주식회사 직구역구(이하 "회사")가 운영하는 크로스보더 C2C 마켓플레이스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
        contentZh:
          '本条款旨在规定直购易购有限公司（以下简称"公司"）运营的跨境C2C交易平台（以下简称"服务"）的使用相关事项，包括公司与用户之间的权利、义务及责任等。',
      },
      {
        titleKo: '제2조 (정의)',
        titleZh: '第2条（定义）',
        contentKo:
          '① "서비스"란 회사가 제공하는 한중 크로스보더 C2C 거래 플랫폼을 의미합니다.\n② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.\n③ "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 이용할 수 있는 자를 말합니다.\n④ "판매자"란 서비스를 통해 상품을 판매하는 회원을 말합니다.\n⑤ "구매자"란 서비스를 통해 상품을 구매하는 회원을 말합니다.\n⑥ "에스크로"란 거래 안전을 위해 구매자의 결제 대금을 회사가 임시 보관하는 제도를 말합니다.',
        contentZh:
          '① "服务"是指公司提供的韩中跨境C2C交易平台。\n② "用户"是指根据本条款使用公司提供的服务的会员和非会员。\n③ "会员"是指向公司提供个人信息并完成会员注册，能够使用服务的个人。\n④ "卖家"是指通过服务销售商品的会员。\n⑤ "买家"是指通过服务购买商品的会员。\n⑥ "担保支付"是指为保障交易安全，由公司临时保管买家付款的制度。',
      },
      {
        titleKo: '제3조 (약관의 효력 및 변경)',
        titleZh: '第3条（条款的效力及变更）',
        contentKo:
          '① 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.\n② 회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해 공지합니다.\n③ 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.',
        contentZh:
          '① 本条款适用于所有使用服务的用户。\n② 公司可在不违反相关法律法规的范围内变更本条款，变更后的条款将通过服务内公告通知。\n③ 变更后的条款自公告后7日起生效。',
      },
    ],
  },
  {
    id: 'membership',
    titleKo: '제2장 회원가입 및 관리',
    titleZh: '第二章 会员注册及管理',
    articles: [
      {
        titleKo: '제4조 (회원가입)',
        titleZh: '第4条（会员注册）',
        contentKo:
          '① 회원가입은 이용자가 약관에 동의하고, 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 회사가 승인함으로써 성립됩니다.\n② 회원은 휴대폰 인증, 소셜 로그인(Google, Kakao) 등을 통해 가입할 수 있습니다.\n③ 회원은 가입 시 실명 및 실제 정보를 기입해야 하며, 허위 정보를 기입할 경우 서비스 이용이 제한될 수 있습니다.',
        contentZh:
          '① 会员注册在用户同意条款、按照公司规定的注册表格填写会员信息后，由公司批准后成立。\n② 会员可通过手机验证、社交登录（Google、Kakao）等方式注册。\n③ 会员注册时应填写真实姓名和真实信息，填写虚假信息可能导致服务使用受限。',
      },
      {
        titleKo: '제5조 (회원 탈퇴 및 자격 제한)',
        titleZh: '第5条（会员退出及资格限制）',
        contentKo:
          '① 회원은 언제든지 서비스 내 설정을 통해 탈퇴를 요청할 수 있습니다.\n② 진행 중인 거래가 있는 경우 해당 거래 완료 후 탈퇴가 가능합니다.\n③ 회사는 다음 사유에 해당하는 경우 회원 자격을 제한 또는 정지할 수 있습니다:\n  - 허위 정보로 가입한 경우\n  - 다른 이용자의 서비스 이용을 방해하거나 그 정보를 도용한 경우\n  - 서비스를 이용하여 법령 또는 약관을 위반하는 행위를 한 경우',
        contentZh:
          '① 会员可随时通过服务内设置请求退出。\n② 如有进行中的交易，需在该交易完成后方可退出。\n③ 在以下情况下，公司可限制或暂停会员资格：\n  - 以虚假信息注册的情况\n  - 妨碍其他用户使用服务或盗用其信息的情况\n  - 利用服务违反法律法规或条款的情况',
      },
    ],
  },
  {
    id: 'service',
    titleKo: '제3장 서비스 이용',
    titleZh: '第三章 服务使用',
    articles: [
      {
        titleKo: '제6조 (서비스의 제공)',
        titleZh: '第6条（服务的提供）',
        contentKo:
          '① 회사는 다음과 같은 서비스를 제공합니다:\n  - 한중 크로스보더 C2C 거래 중개 서비스\n  - 에스크로 결제 서비스\n  - 국제 배송 중개 서비스\n  - 분쟁 해결 서비스\n  - 실시간 채팅 서비스\n② 서비스는 연중무휴 24시간 제공함을 원칙으로 하나, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.',
        contentZh:
          '① 公司提供以下服务：\n  - 韩中跨境C2C交易中介服务\n  - 担保支付服务\n  - 国际配送中介服务\n  - 争议解决服务\n  - 实时聊天服务\n② 服务原则上全年无休24小时提供，但因系统维护等原因可能暂时中断。',
      },
      {
        titleKo: '제7조 (서비스 이용 수수료)',
        titleZh: '第7条（服务使用费）',
        contentKo:
          '① 회사는 서비스 이용에 대해 수수료를 부과할 수 있습니다.\n② 수수료율은 거래 유형 및 금액에 따라 다르며, 서비스 내에 별도 공지합니다.\n③ 수수료 변경 시 최소 30일 전에 서비스 내 공지를 통해 안내합니다.',
        contentZh:
          '① 公司可对服务使用收取手续费。\n② 手续费率根据交易类型和金额不同而异，将在服务内另行公告。\n③ 手续费变更时，将至少提前30天通过服务内公告告知。',
      },
    ],
  },
  {
    id: 'trade',
    titleKo: '제4장 구매 및 판매',
    titleZh: '第四章 购买及销售',
    articles: [
      {
        titleKo: '제8조 (상품 등록)',
        titleZh: '第8条（商品登记）',
        contentKo:
          '① 판매자는 실제 보유하고 있는 상품만 등록할 수 있습니다.\n② 상품 정보는 정확하게 기재해야 하며, 허위 또는 과장 정보를 기재할 경우 서비스 이용이 제한될 수 있습니다.\n③ 다음 상품은 등록이 금지됩니다:\n  - 법령에 의해 판매가 금지된 상품\n  - 지식재산권을 침해하는 상품\n  - 위조품 또는 모조품\n  - 기타 회사가 부적절하다고 판단하는 상품',
        contentZh:
          '① 卖家只能登记实际持有的商品。\n② 商品信息应准确填写，填写虚假或夸大信息可能导致服务使用受限。\n③ 以下商品禁止登记：\n  - 法律禁止销售的商品\n  - 侵犯知识产权的商品\n  - 假冒或仿制品\n  - 其他公司认为不当的商品',
      },
      {
        titleKo: '제9조 (거래 및 결제)',
        titleZh: '第9条（交易及支付）',
        contentKo:
          '① 구매자는 상품 주문 시 에스크로 방식으로 결제합니다.\n② 결제 대금은 구매자가 수령 확인을 완료할 때까지 회사가 안전하게 보관합니다.\n③ 구매자가 상품 수령 후 7일 이내에 수령 확인 또는 분쟁 신청을 하지 않으면, 자동으로 구매 확인 처리됩니다.\n④ 구매 확인 후 결제 대금은 판매자에게 정산됩니다.',
        contentZh:
          '① 买家在下单时通过担保支付方式付款。\n② 付款金额在买家确认收货之前由公司安全保管。\n③ 买家收到商品后7日内未确认收货或提出争议的，将自动确认购买。\n④ 确认购买后，付款金额将结算给卖家。',
      },
      {
        titleKo: '제10조 (배송)',
        titleZh: '第10条（配送）',
        contentKo:
          '① 판매자는 결제 완료 후 3영업일 이내에 상품을 발송해야 합니다.\n② 국제 배송은 회사가 제휴한 배송업체를 통해 진행됩니다.\n③ 배송비는 상품 무게, 거래 방향(한→중, 중→한), 배송 지역에 따라 산정됩니다.\n④ 통관 지연, 불가항력 등으로 인한 배송 지연에 대해 회사는 책임지지 않습니다.',
        contentZh:
          '① 卖家应在付款完成后3个工作日内发货。\n② 国际配送通过公司合作的物流公司进行。\n③ 配送费根据商品重量、交易方向（韩→中、中→韩）及配送地区计算。\n④ 因通关延迟、不可抗力等原因导致的配送延迟，公司不承担责任。',
      },
    ],
  },
  {
    id: 'liability',
    titleKo: '제5장 책임 제한',
    titleZh: '第五章 责任限制',
    articles: [
      {
        titleKo: '제11조 (회사의 책임 제한)',
        titleZh: '第11条（公司的责任限制）',
        contentKo:
          '① 회사는 거래 당사자 간의 거래에 직접 개입하지 않으며, 거래 중개 서비스만 제공합니다.\n② 회사는 다음의 경우 책임을 지지 않습니다:\n  - 천재지변, 전쟁, 기타 불가항력으로 서비스를 제공할 수 없는 경우\n  - 이용자의 귀책 사유로 서비스 이용에 장애가 발생한 경우\n  - 이용자 간 거래에서 발생한 분쟁의 결과\n③ 회사는 에스크로 시스템을 통해 거래의 안전성을 높이기 위해 노력합니다.',
        contentZh:
          '① 公司不直接介入交易当事人之间的交易，仅提供交易中介服务。\n② 以下情况公司不承担责任：\n  - 因自然灾害、战争及其他不可抗力导致无法提供服务的情况\n  - 因用户自身原因导致服务使用障碍的情况\n  - 用户间交易中产生的争议结果\n③ 公司通过担保支付系统努力提高交易安全性。',
      },
      {
        titleKo: '제12조 (이용자의 의무)',
        titleZh: '第12条（用户的义务）',
        contentKo:
          '이용자는 다음 행위를 하여서는 안 됩니다:\n  - 타인의 정보를 도용하거나 허위 정보를 등록하는 행위\n  - 서비스를 이용하여 불법 상품을 거래하는 행위\n  - 회사의 지식재산권을 침해하는 행위\n  - 다른 이용자의 개인정보를 수집하거나 유포하는 행위\n  - 서비스의 운영을 방해하는 행위',
        contentZh:
          '用户不得进行以下行为：\n  - 盗用他人信息或注册虚假信息的行为\n  - 利用服务交易非法商品的行为\n  - 侵犯公司知识产权的行为\n  - 收集或传播其他用户个人信息的行为\n  - 妨碍服务运营的行为',
      },
    ],
  },
  {
    id: 'dispute',
    titleKo: '제6장 분쟁 해결',
    titleZh: '第六章 争议解决',
    articles: [
      {
        titleKo: '제13조 (분쟁 해결 절차)',
        titleZh: '第13条（争议解决程序）',
        contentKo:
          '① 거래 관련 분쟁 발생 시, 이용자는 서비스 내 분쟁 해결 시스템을 통해 분쟁을 신청할 수 있습니다.\n② 분쟁 해결은 다음 단계로 진행됩니다:\n  1단계: 당사자 간 직접 협의 (3일)\n  2단계: 커뮤니티 중재 (5일)\n  3단계: 회사 최종 판정\n③ 분쟁 기간 동안 에스크로 보관 중인 결제 대금은 동결됩니다.',
        contentZh:
          '① 发生交易相关争议时，用户可通过服务内争议解决系统申请争议。\n② 争议解决按以下步骤进行：\n  第1步：当事人直接协商（3天）\n  第2步：社区调解（5天）\n  第3步：公司最终裁定\n③ 争议期间，担保支付中保管的付款金额将被冻结。',
      },
      {
        titleKo: '제14조 (준거법 및 관할법원)',
        titleZh: '第14条（适用法律及管辖法院）',
        contentKo:
          '① 이 약관의 해석 및 적용에 관하여는 대한민국 법률을 준거법으로 합니다.\n② 서비스 이용과 관련하여 분쟁이 발생한 경우, 서울중앙지방법원을 관할법원으로 합니다.',
        contentZh:
          '① 本条款的解释和适用以大韩民国法律为准据法。\n② 与服务使用相关的争议，以首尔中央地方法院为管辖法院。',
      },
    ],
  },
];

export default function TermsContent() {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([TERMS_SECTIONS[0].id]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb
        items={[{ labelKo: '이용약관', labelZh: '服务条款' }]}
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
          <Scale className="h-5 w-5 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">
          {language === 'ko' ? '이용약관' : '服务条款'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        {language === 'ko'
          ? '최종 수정일: 2026년 2월 1일 | 시행일: 2026년 2월 10일'
          : '最后修改日期：2026年2月1日 | 生效日期：2026年2月10日'}
      </p>

      <div className="space-y-4">
        {TERMS_SECTIONS.map((section) => {
          const isExpanded = expandedSections.includes(section.id);

          return (
            <Card key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <h2 className="text-xl font-semibold">
                  {language === 'ko' ? section.titleKo : section.titleZh}
                </h2>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isExpanded && (
                <CardContent className="pt-0 pb-5 px-5 space-y-6">
                  {section.articles.map((article, idx) => (
                    <div key={idx}>
                      <h3 className="font-medium text-base mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {language === 'ko' ? article.titleKo : article.titleZh}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-6">
                        {language === 'ko' ? article.contentKo : article.contentZh}
                      </p>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === 'ko'
              ? '본 약관에 대해 궁금한 사항이 있으시면 고객센터(1588-0000)로 문의해 주시기 바랍니다. 이 약관은 대한민국 법률에 의해 규율되며, 한국어 버전이 법적 기준이 됩니다.'
              : '如有关于本条款的疑问，请联系客服中心（400-000-0000）。本条款受大韩民国法律管辖，韩语版本为法律依据。'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
