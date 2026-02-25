'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, Users, CreditCard, AlertTriangle, Ban, Receipt, Info, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { HeroBanner } from '@/components/home/HeroBanner';
import LiveStreamList from '@/components/live/LiveStreamList';
import PurchaseRequestList from '@/components/purchase/PurchaseRequestList';
import ProductRecommendations from '@/components/product/ProductRecommendations';
import FloatingExchangeCalculator from '@/components/common/FloatingExchangeCalculator';
import { TradeDirectionModal, getSavedDirection, type TradeDirection } from '@/components/common/TradeDirectionModal';

const features = [
  {
    icon: Shield,
    titleKo: '에스크로 결제',
    titleZh: '托管支付',
    descKo: '구매 확정 전까지 안전 보관',
    descZh: '确认收货前安全保管',
  },
  {
    icon: Truck,
    titleKo: '국제 배송',
    titleZh: '国际配送',
    descKo: '항공/해상 배송 지원',
    descZh: '支持空运/海运',
  },
  {
    icon: Users,
    titleKo: '커뮤니티 분쟁해결',
    titleZh: '社区仲裁',
    descKo: '공정한 배심원 투표',
    descZh: '公平的陪审团投票',
  },
  {
    icon: CreditCard,
    titleKo: '낮은 수수료',
    titleZh: '低手续费',
    descKo: '일반 5% / 사업자 3%',
    descZh: '普通5% / 企业3%',
  },
];

export default function HomePage() {
  const { language } = useLanguage();
  const [tradeDirection, setTradeDirection] = useState<TradeDirection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const saved = getSavedDirection();
    if (saved) setTradeDirection(saved);
  }, []);

  // 헤더의 직구/역직구 버튼 클릭 이벤트 수신
  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-trade-direction-modal', handleOpenModal);
    return () => window.removeEventListener('open-trade-direction-modal', handleOpenModal);
  }, []);

  const handleDirectionSelect = (direction: TradeDirection) => {
    setTradeDirection(direction);
    setIsModalOpen(false);
    // Header의 직구/역직구 버튼 텍스트 갱신
    window.dispatchEvent(new Event('trade-direction-changed'));
  };

  const handleOpenModal = () => {
    // sessionStorage 초기화하여 팝업이 다시 뜨도록
    sessionStorage.removeItem('jikguyeokgu_popup_shown');
    setIsModalOpen(true);
  };

  // 방향에 따라 라벨 결정
  const direction = tradeDirection ?? (language === 'ko' ? 'CN_TO_KR' : 'KR_TO_CN');
  const defaultDirection = direction;

  const directionLabel = direction === 'CN_TO_KR'
    ? { ko: '직구', zh: '直购', flag: '🇨🇳→🇰🇷', desc: language === 'ko' ? '중국 상품 구매' : '购买中国商品' }
    : { ko: '역직구', zh: '逆直购', flag: '🇰🇷→🇨🇳', desc: language === 'ko' ? '한국 상품 구매' : '购买韩国商品' };

  return (
    <div className="min-h-screen bg-white">
      {/* 직구/역직구 선택 팝업 */}
      <TradeDirectionModal
        onSelect={handleDirectionSelect}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <HeroBanner />

      {/* 선택된 모드 표시 바 */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="container-app py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-black text-black">
              {directionLabel.flag}
            </span>
            <span className="text-[13px] font-black text-black">
              {language === 'ko' ? directionLabel.ko : directionLabel.zh}
            </span>
            <span className="text-[12px] text-gray-400">
              {directionLabel.desc}
            </span>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-black transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {language === 'ko' ? '변경' : '切换'}
          </button>
        </div>
      </div>

      <div className="container-app py-8 space-y-10">
        {/* 추천 상품 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-black text-black">
              {language === 'ko' ? '추천 상품' : '推荐商品'}
            </h2>
            <Link
              href={`/posts?direction=${defaultDirection}`}
              className="text-[13px] text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              {language === 'ko' ? '전체보기' : '查看全部'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ProductRecommendations limit={8} showTitle={false} />
        </section>

        {/* 구매대행 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-black text-black">
              {language === 'ko' ? '구매대행 요청' : '代购请求'}
            </h2>
            <Link
              href="/purchase-requests"
              className="text-[13px] text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              {language === 'ko' ? '전체보기' : '查看全部'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <PurchaseRequestList status="OPEN" limit={4} showTitle={false} />
        </section>

        {/* 라이브 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-black text-black flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-orange rounded-full" />
              LIVE
            </h2>
            <Link
              href="/live"
              className="text-[13px] text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              {language === 'ko' ? '전체보기' : '查看全部'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <LiveStreamList limit={4} showTitle={false} />
        </section>

        {/* 서비스 안내 */}
        <section className="border border-gray-200 p-6 md:p-8">
          <h2 className="text-[16px] font-black text-black text-center mb-6">
            {language === 'ko' ? '직구역구가 특별한 이유' : '直购易购的独特之处'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center py-4">
              <Shield className="w-8 h-8 mx-auto mb-3 text-black" />
              <h3 className="text-[14px] font-bold text-black mb-1">
                {language === 'ko' ? '안전한 거래' : '安全交易'}
              </h3>
              <p className="text-[12px] text-gray-500">
                {language === 'ko'
                  ? '에스크로 시스템으로 구매 확정 전까지 결제금이 안전하게 보관됩니다'
                  : '通过托管系统，在确认收货前货款将被安全保管'}
              </p>
            </div>
            <div className="text-center py-4">
              <Truck className="w-8 h-8 mx-auto mb-3 text-black" />
              <h3 className="text-[14px] font-bold text-black mb-1">
                {language === 'ko' ? '양방향 거래' : '双向交易'}
              </h3>
              <p className="text-[12px] text-gray-500">
                {language === 'ko'
                  ? '한국과 중국 양방향으로 상품을 판매하고 구매할 수 있습니다'
                  : '可以在韩国和中国双向销售和购买商品'}
              </p>
            </div>
            <div className="text-center py-4">
              <Users className="w-8 h-8 mx-auto mb-3 text-black" />
              <h3 className="text-[14px] font-bold text-black mb-1">
                {language === 'ko' ? '공정한 분쟁해결' : '公平仲裁'}
              </h3>
              <p className="text-[12px] text-gray-500">
                {language === 'ko'
                  ? '한중 양국 배심원의 공정한 투표로 분쟁을 해결합니다'
                  : '通过韩中两国陪审团的公平投票解决纠纷'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black p-8 md:p-12 text-center">
          <h2 className="text-[22px] md:text-[28px] font-black text-white mb-3">
            {language === 'ko' ? '지금 바로 시작하세요' : '立即开始'}
          </h2>
          <p className="text-[14px] text-white/60 mb-6 max-w-xl mx-auto">
            {language === 'ko'
              ? '간단한 가입으로 한국과 중국의 수백만 고객에게 상품을 판매하세요'
              : '简单注册，向韩国和中国数百万客户销售商品'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/posts/create"
              className="inline-flex items-center justify-center h-[44px] px-8 bg-white text-black text-[14px] font-bold hover:bg-gray-100 transition-colors"
            >
              {language === 'ko' ? '판매 시작하기' : '开始销售'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/posts?direction=${defaultDirection}`}
              className="inline-flex items-center justify-center h-[44px] px-8 border border-white/30 text-white text-[14px] font-bold hover:border-white transition-colors"
            >
              {language === 'ko' ? '상품 둘러보기' : '浏览商品'}
            </Link>
          </div>
        </section>

        {/* 특징 바 - 하단 배치 */}
        <section className="border-t border-gray-100 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 py-3">
                <feature.icon className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-black">
                    {language === 'ko' ? feature.titleKo : feature.titleZh}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {language === 'ko' ? feature.descKo : feature.descZh}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 세관 안내 */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-400" />
            <h2 className="text-[16px] font-black text-black">
              {language === 'ko' ? '세관 통관 안내' : '海关通关须知'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 한국 → 중국 */}
            <div className="border border-gray-200">
              <div className="bg-black text-white p-4">
                <span className="text-[14px] font-bold">
                  {language === 'ko' ? '한국 → 중국 통관 안내' : '韩国 → 中国 通关须知'}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-4 h-4 text-brand-orange" />
                    <h4 className="text-[13px] font-bold text-black">
                      {language === 'ko' ? '통관 불가 품목' : '禁止入境物品'}
                    </h4>
                  </div>
                  <ul className="text-[12px] text-gray-500 space-y-1 ml-6">
                    <li>- {language === 'ko' ? '의약품 (처방약, 마약류)' : '药品（处方药、毒品类）'}</li>
                    <li>- {language === 'ko' ? '무기류 및 모조 무기' : '武器及仿制武器'}</li>
                    <li>- {language === 'ko' ? '동식물 및 동식물 제품' : '动植物及动植物产品'}</li>
                    <li>- {language === 'ko' ? '위조품 및 저작권 침해 상품' : '假冒伪劣及侵权商品'}</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <h4 className="text-[13px] font-bold text-black">
                      {language === 'ko' ? '관세 부과 기준' : '关税征收标准'}
                    </h4>
                  </div>
                  <ul className="text-[12px] text-gray-500 space-y-1 ml-6">
                    <li>- {language === 'ko' ? '개인 물품: 5,000위안 초과 시 과세' : '个人物品：超过5000元人民币征税'}</li>
                    <li>- {language === 'ko' ? '화장품: 30% 관세' : '化妆品：30%关税'}</li>
                    <li>- {language === 'ko' ? '전자제품: 15~20% 관세' : '电子产品：15~20%关税'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 중국 → 한국 */}
            <div className="border border-gray-200">
              <div className="bg-black text-white p-4">
                <span className="text-[14px] font-bold">
                  {language === 'ko' ? '중국 → 한국 통관 안내' : '中国 → 韩国 通关须知'}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-4 h-4 text-brand-orange" />
                    <h4 className="text-[13px] font-bold text-black">
                      {language === 'ko' ? '통관 불가 품목' : '禁止入境物品'}
                    </h4>
                  </div>
                  <ul className="text-[12px] text-gray-500 space-y-1 ml-6">
                    <li>- {language === 'ko' ? '의약품 (전문의약품, 한약재 일부)' : '药品（处方药、部分中药材）'}</li>
                    <li>- {language === 'ko' ? '육류, 유제품 등 축산물' : '肉类、乳制品等畜产品'}</li>
                    <li>- {language === 'ko' ? '과일, 채소 등 신선 농산물' : '水果、蔬菜等新鲜农产品'}</li>
                    <li>- {language === 'ko' ? '위조 브랜드 상품' : '假冒品牌商品'}</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-gray-400" />
                    <h4 className="text-[13px] font-bold text-black">
                      {language === 'ko' ? '관세 부과 기준' : '关税征收标准'}
                    </h4>
                  </div>
                  <ul className="text-[12px] text-gray-500 space-y-1 ml-6">
                    <li>- {language === 'ko' ? '개인 면세: 미화 $150 이하' : '个人免税：150美元以下'}</li>
                    <li>- {language === 'ko' ? '의류/신발: 13% 관세 + 10% 부가세' : '服装/鞋类：13%关税 + 10%增值税'}</li>
                    <li>- {language === 'ko' ? '전자제품: 8% 관세 + 10% 부가세' : '电子产品：8%关税 + 10%增值税'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[13px] font-bold text-black mb-2">
                  {language === 'ko' ? '주의사항' : '注意事项'}
                </h4>
                <ul className="text-[12px] text-gray-500 space-y-1">
                  <li>- {language === 'ko'
                    ? '통관 규정은 수시로 변경될 수 있으니, 구매 전 최신 규정을 확인하세요.'
                    : '通关规定可能随时变更，购买前请确认最新规定。'}</li>
                  <li>- {language === 'ko'
                    ? '관세 및 부가세는 구매자 부담이며, 통관 지연 시 추가 비용이 발생할 수 있습니다.'
                    : '关税及增值税由买家承担，通关延迟时可能产生额外费用。'}</li>
                  <li>- {language === 'ko'
                    ? '통관 불가 품목 거래 시 직구역구는 책임지지 않습니다.'
                    : '交易禁止入境物品时，直购易购不承担责任。'}</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400">
            {language === 'ko'
              ? '세관 통관 문의: 관세청(125) / 중국 해관(12360)'
              : '通关咨询: 韩国关税厅(125) / 中国海关(12360)'}
          </p>
        </section>
      </div>

      <FloatingExchangeCalculator />
    </div>
  );
}
