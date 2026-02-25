'use client';

import { useState } from 'react';
import { ChevronDown, Shield, Lock, Eye, Trash2, Globe, Database, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { useLanguage } from '@/hooks/useLanguage';

interface PrivacySection {
  id: string;
  icon: React.ElementType;
  titleKo: string;
  titleZh: string;
  contentKo: string;
  contentZh: string;
}

const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 'collection',
    icon: Database,
    titleKo: '1. 개인정보 수집 및 이용 목적',
    titleZh: '1. 个人信息收集及使用目的',
    contentKo: `회사는 다음 목적을 위해 개인정보를 수집·이용합니다:

■ 회원가입 및 관리
- 수집 항목: 이름, 이메일, 휴대폰 번호, 소셜 로그인 정보(Google/Kakao)
- 목적: 회원 식별, 서비스 제공, 본인확인, 부정이용 방지

■ 거래 서비스 제공
- 수집 항목: 배송지 주소, 결제 정보, 거래 내역
- 목적: 상품 배송, 에스크로 결제, 구매/판매 내역 관리

■ 고객 지원
- 수집 항목: 문의 내용, 분쟁 관련 자료
- 목적: 고객 상담, 불만 처리, 분쟁 해결

■ 마케팅 (선택)
- 수집 항목: 관심 카테고리, 서비스 이용 기록
- 목적: 맞춤형 상품 추천, 이벤트 안내 (동의한 회원만)`,
    contentZh: `公司为以下目的收集和使用个人信息：

■ 会员注册及管理
- 收集项目：姓名、邮箱、手机号码、社交登录信息（Google/Kakao）
- 目的：会员识别、服务提供、身份验证、防止不当使用

■ 交易服务提供
- 收集项目：收货地址、支付信息、交易记录
- 目的：商品配送、担保支付、购买/销售记录管理

■ 客户支持
- 收集项目：咨询内容、争议相关资料
- 目的：客户咨询、投诉处理、争议解决

■ 营销（可选）
- 收集项目：感兴趣的类别、服务使用记录
- 目的：个性化商品推荐、活动通知（仅限同意的会员）`,
  },
  {
    id: 'thirdparty',
    icon: Users,
    titleKo: '2. 개인정보 제3자 제공',
    titleZh: '2. 个人信息第三方提供',
    contentKo: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:

■ 거래 이행을 위한 제공
- 제공 대상: 배송업체
- 제공 항목: 수령인 이름, 연락처, 배송지 주소
- 목적: 상품 배송

■ 에스크로 결제 처리
- 제공 대상: 결제 서비스 제공사 (토스페이먼츠, Stripe)
- 제공 항목: 결제 관련 정보
- 목적: 결제 처리 및 환불

■ 법률에 의한 요청
- 법원, 수사기관 등의 적법한 요청이 있는 경우
- 관세청의 통관 관련 요청`,
    contentZh: `公司原则上不向外部提供用户的个人信息。但以下情况除外：

■ 为履行交易提供
- 提供对象：物流公司
- 提供项目：收件人姓名、联系方式、收货地址
- 目的：商品配送

■ 担保支付处理
- 提供对象：支付服务提供商（TossPayments、Stripe）
- 提供项目：支付相关信息
- 目的：支付处理及退款

■ 法律要求
- 法院、调查机关等合法要求的情况
- 海关的通关相关要求`,
  },
  {
    id: 'retention',
    icon: Eye,
    titleKo: '3. 개인정보 보유 및 이용 기간',
    titleZh: '3. 个人信息保留及使用期限',
    contentKo: `회원 탈퇴 시 개인정보는 즉시 파기됩니다. 다만, 관련 법령에 따라 아래 기간 동안 보존합니다:

■ 전자상거래법
- 계약 또는 청약철회 기록: 5년
- 대금결제 및 재화 등의 공급 기록: 5년
- 소비자 불만 또는 분쟁 처리 기록: 3년

■ 통신비밀보호법
- 서비스 이용 관련 기록: 3개월

■ 회사 내부 정책
- 부정이용 방지를 위한 기록: 1년
- 본인확인 기록: 6개월`,
    contentZh: `会员退出时，个人信息将立即销毁。但根据相关法律法规，在以下期限内予以保存：

■ 电子商务法
- 合同或撤回签约记录：5年
- 付款及商品供应记录：5年
- 消费者投诉或争议处理记录：3年

■ 通信秘密保护法
- 服务使用相关记录：3个月

■ 公司内部政策
- 防止不当使用的记录：1年
- 身份验证记录：6个月`,
  },
  {
    id: 'destruction',
    icon: Trash2,
    titleKo: '4. 개인정보 파기 절차 및 방법',
    titleZh: '4. 个人信息销毁程序及方法',
    contentKo: `■ 파기 절차
이용 목적이 달성된 개인정보는 별도의 DB로 옮겨져 내부 방침 및 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.

■ 파기 방법
- 전자적 파일: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제
- 서면 자료: 분쇄기로 분쇄하거나 소각하여 파기

■ 파기 시점
보유 기간이 경과한 개인정보는 경과한 날로부터 5일 이내에 파기합니다.`,
    contentZh: `■ 销毁程序
使用目的达成的个人信息将转移至单独的数据库，根据内部政策和相关法律法规存储一定期限后销毁。

■ 销毁方法
- 电子文件：使用无法再生记录的技术方法删除
- 书面资料：用碎纸机粉碎或焚烧销毁

■ 销毁时间
保留期限届满的个人信息将在届满之日起5日内销毁。`,
  },
  {
    id: 'rights',
    icon: Lock,
    titleKo: '5. 이용자의 권리',
    titleZh: '5. 用户的权利',
    contentKo: `이용자는 다음과 같은 권리를 행사할 수 있습니다:

■ 개인정보 열람 요구
- 회사가 보유한 본인의 개인정보에 대해 열람을 요구할 수 있습니다.

■ 개인정보 정정·삭제 요구
- 잘못된 개인정보의 정정 또는 삭제를 요구할 수 있습니다.
- 서비스 내 마이페이지에서 직접 수정하거나 고객센터를 통해 요청할 수 있습니다.

■ 개인정보 처리 정지 요구
- 개인정보의 처리 정지를 요구할 수 있습니다.

■ 동의 철회
- 마케팅 등 선택적 동의사항에 대해 언제든지 동의를 철회할 수 있습니다.

위 요청은 서비스 내 설정 또는 고객센터(1588-0000)를 통해 하실 수 있습니다.`,
    contentZh: `用户可行使以下权利：

■ 要求查阅个人信息
- 可要求查阅公司持有的本人个人信息。

■ 要求更正·删除个人信息
- 可要求更正或删除错误的个人信息。
- 可在服务内我的页面直接修改或通过客服中心请求。

■ 要求停止处理个人信息
- 可要求停止处理个人信息。

■ 撤回同意
- 可随时撤回营销等可选同意事项。

以上请求可通过服务内设置或客服中心（400-000-0000）提出。`,
  },
  {
    id: 'gdpr',
    icon: Globe,
    titleKo: '6. 국제 개인정보 보호 (GDPR/CCPA)',
    titleZh: '6. 国际个人信息保护（GDPR/CCPA）',
    contentKo: `직구역구는 국제 개인정보 보호 기준을 준수합니다.

■ GDPR (유럽 일반 개인정보 보호법) 준수
- 데이터 최소 수집 원칙 적용
- 명시적 동의 기반 데이터 처리
- 잊힐 권리(삭제권) 보장
- 데이터 이동권 보장
- 개인정보 처리에 대한 투명한 고지

■ CCPA (캘리포니아 소비자 개인정보 보호법) 준수
- 개인정보 판매 거부권 보장
- 수집된 개인정보의 범위 고지
- 비차별적 서비스 제공 원칙

■ 국제 데이터 이전
한중 간 서비스 특성상 개인정보가 국가 간 이전될 수 있으며, 이 경우 적절한 보호 조치를 취합니다.
- 데이터 암호화 전송 (TLS 1.3)
- 접근 권한 최소화
- 정기적인 보안 감사 실시`,
    contentZh: `直购易购遵守国际个人信息保护标准。

■ GDPR（欧盟通用数据保护条例）合规
- 适用数据最小收集原则
- 基于明确同意的数据处理
- 保障被遗忘权（删除权）
- 保障数据可携带权
- 关于个人信息处理的透明告知

■ CCPA（加利福尼亚州消费者隐私法）合规
- 保障拒绝出售个人信息的权利
- 告知收集的个人信息范围
- 非歧视性服务提供原则

■ 国际数据传输
由于韩中之间的服务特性，个人信息可能在国家间传输，此时将采取适当的保护措施。
- 数据加密传输（TLS 1.3）
- 最小化访问权限
- 定期进行安全审计`,
  },
  {
    id: 'security',
    icon: Shield,
    titleKo: '7. 개인정보 보호 조치',
    titleZh: '7. 个人信息保护措施',
    contentKo: `회사는 이용자의 개인정보를 안전하게 보호하기 위해 다음과 같은 조치를 취합니다:

■ 기술적 조치
- 개인정보 암호화 저장 및 전송
- 해킹 등에 대비한 보안 프로그램 설치 및 갱신
- 접근 통제 시스템 운영

■ 관리적 조치
- 개인정보 취급 직원의 최소화 및 교육
- 내부관리계획의 수립 및 시행
- 정기적인 자체 감사 실시

■ 물리적 조치
- 전산실 및 자료 보관실의 접근 통제`,
    contentZh: `公司为安全保护用户的个人信息采取以下措施：

■ 技术措施
- 个人信息加密存储及传输
- 安装和更新防黑客等安全程序
- 运营访问控制系统

■ 管理措施
- 最小化个人信息处理人员并进行培训
- 制定和实施内部管理计划
- 定期进行内部审计

■ 物理措施
- 机房及资料存储室的访问控制`,
  },
];

export default function PrivacyContent() {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState<string[]>([PRIVACY_SECTIONS[0].id]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb
        items={[{ labelKo: '개인정보처리방침', labelZh: '隐私政策' }]}
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">
          {language === 'ko' ? '개인정보처리방침' : '隐私政策'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        {language === 'ko'
          ? '최종 수정일: 2026년 2월 1일 | 시행일: 2026년 2월 10일'
          : '最后修改日期：2026年2月1日 | 生效日期：2026年2月10日'}
      </p>

      <Card className="mb-6 bg-green-50 border-green-200">
        <CardContent className="p-5">
          <p className="text-sm text-green-800 leading-relaxed">
            {language === 'ko'
              ? '직구역구는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다. GDPR 및 CCPA 기준에도 부합하는 국제 수준의 개인정보 보호 체계를 운영합니다.'
              : '直购易购重视用户的个人信息，遵守《个人信息保护法》、《信息通信网络利用促进及信息保护等相关法律》等相关法规。运营符合GDPR和CCPA标准的国际级个人信息保护体系。'}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {PRIVACY_SECTIONS.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const Icon = section.icon;

          return (
            <Card key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold">
                    {language === 'ko' ? section.titleKo : section.titleZh}
                  </h2>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isExpanded && (
                <CardContent className="pt-0 pb-5 px-5">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {language === 'ko' ? section.contentKo : section.contentZh}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 bg-muted/50">
        <CardContent className="p-5 space-y-2">
          <p className="text-sm font-medium">
            {language === 'ko' ? '개인정보 보호 책임자' : '个人信息保护负责人'}
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{language === 'ko' ? '이름: 김보안 | 직위: CPO (개인정보보호 최고책임자)' : '姓名：金保安 | 职务：CPO（首席隐私官）'}</p>
            <p>{language === 'ko' ? '이메일: privacy@jikguyeokgu.com' : '邮箱：privacy@jikguyeokgu.com'}</p>
            <p>{language === 'ko' ? '전화: 1588-0000 (내선 2번)' : '电话：400-000-0000（转2）'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
