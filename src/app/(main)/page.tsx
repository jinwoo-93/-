'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Globe, Users, Truck, CreditCard, AlertTriangle, Ban, Receipt, Info, Radio, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';
import { HeroBanner } from '@/components/home/HeroBanner';
import { ExchangeRateWidget } from '@/components/home/ExchangeRateWidget';
import LiveStreamList from '@/components/live/LiveStreamList';
import PurchaseRequestList from '@/components/purchase/PurchaseRequestList';
import ProductRecommendations from '@/components/product/ProductRecommendations';

const categories = [
  { id: '1', nameKo: 'K-뷰티', nameZh: 'K-美妆', icon: '💄', slug: 'k-beauty', color: 'bg-pink-50 hover:bg-pink-100' },
  { id: '2', nameKo: 'K-패션', nameZh: 'K-时尚', icon: '👗', slug: 'k-fashion', color: 'bg-purple-50 hover:bg-purple-100' },
  { id: '3', nameKo: 'K-푸드', nameZh: 'K-食品', icon: '🍜', slug: 'k-food', color: 'bg-orange-50 hover:bg-orange-100' },
  { id: '4', nameKo: '전자제품', nameZh: '电子产品', icon: '📱', slug: 'electronics', color: 'bg-blue-50 hover:bg-blue-100' },
  { id: '5', nameKo: '생활용품', nameZh: '生活用品', icon: '🏠', slug: 'home', color: 'bg-green-50 hover:bg-green-100' },
  { id: '6', nameKo: '유아용품', nameZh: '母婴用品', icon: '👶', slug: 'baby', color: 'bg-yellow-50 hover:bg-yellow-100' },
  { id: '7', nameKo: '건강식품', nameZh: '保健食品', icon: '💊', slug: 'health', color: 'bg-red-50 hover:bg-red-100' },
  { id: '8', nameKo: '스포츠', nameZh: '运动', icon: '⚽', slug: 'sports', color: 'bg-teal-50 hover:bg-teal-100' },
];

const features = [
  {
    icon: Shield,
    titleKo: '에스크로 결제',
    titleZh: '托管支付',
    descKo: '구매 확정 전까지 안전 보관',
    descZh: '确认收货前安全保管',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: Truck,
    titleKo: '국제 배송',
    titleZh: '国际配送',
    descKo: '항공/해상 배송 지원',
    descZh: '支持空运/海运',
    color: 'text-green-600 bg-green-50',
  },
  {
    icon: Users,
    titleKo: '커뮤니티 분쟁해결',
    titleZh: '社区仲裁',
    descKo: '공정한 배심원 투표',
    descZh: '公平的陪审团投票',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    icon: CreditCard,
    titleKo: '낮은 수수료',
    titleZh: '低手续费',
    descKo: '일반 5% / 사업자 3%',
    descZh: '普通5% / 企业3%',
    color: 'text-orange-600 bg-orange-50',
  },
];

export default function HomePage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 배너 캐러셀 */}
      <HeroBanner />

      {/* 실시간 환율 위젯 */}
      <div className="container-app py-4">
        <ExchangeRateWidget />
      </div>

      {/* 특징 바 */}
      <div className="border-b">
        <div className="container-app py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {language === 'ko' ? feature.titleKo : feature.titleZh}
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === 'ko' ? feature.descKo : feature.descZh}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app py-8 space-y-10">
        {/* 카테고리 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ko' ? '카테고리' : '分类'}
            </h2>
            <Link href="/categories">
              <Button variant="ghost" size="sm" className="text-gray-600">
                {language === 'ko' ? '전체보기' : '查看全部'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/posts?category=${category.slug}`}>
                <div className={`flex flex-col items-center p-4 rounded-xl transition-all cursor-pointer ${category.color}`}>
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">
                    {language === 'ko' ? category.nameKo : category.nameZh}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 퀵 링크 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 한국 → 중국 */}
          <Link href="/posts?direction=KR_TO_CN">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">
                      {language === 'ko' ? '역직구' : '代购'}
                    </p>
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ko' ? '한국 → 중국' : '韩国 → 中国'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'ko'
                        ? 'K-뷰티, K-패션 등 한국 인기 상품'
                        : 'K-Beauty, K-Fashion等韩国热门商品'}
                    </p>
                  </div>
                  <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform">
                    🇰🇷
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* 중국 → 한국 */}
          <Link href="/posts?direction=CN_TO_KR">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80 mb-1">
                      {language === 'ko' ? '직구' : '直购'}
                    </p>
                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ko' ? '중국 → 한국' : '中国 → 韩国'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {language === 'ko'
                        ? '전자제품, 생활용품 등 합리적인 가격'
                        : '电子产品、生活用品等实惠价格'}
                    </p>
                  </div>
                  <div className="text-6xl opacity-30 group-hover:scale-110 transition-transform">
                    🇨🇳
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </section>

        {/* 라이브 커머스 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500" />
              {language === 'ko' ? '라이브 방송' : '直播'}
            </h2>
            <Link href="/live">
              <Button variant="ghost" size="sm" className="text-gray-600">
                {language === 'ko' ? '전체보기' : '查看全部'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <LiveStreamList limit={4} showTitle={false} />
        </section>

        {/* AI 추천 상품 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {language === 'ko' ? '맞춤 추천' : '个性化推荐'}
            </h2>
          </div>
          <ProductRecommendations limit={8} showTitle={false} />
        </section>

        {/* 구매대행 요청 섹션 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              {language === 'ko' ? '구매대행 요청' : '代购请求'}
            </h2>
            <Link href="/purchase-requests">
              <Button variant="ghost" size="sm" className="text-gray-600">
                {language === 'ko' ? '전체보기' : '查看全部'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <PurchaseRequestList status="OPEN" limit={4} showTitle={false} />
        </section>

        {/* 서비스 안내 */}
        <section className="border rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {language === 'ko' ? '직구역구가 특별한 이유' : '直购易购的独特之处'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ko' ? '안전한 거래' : '安全交易'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ko'
                  ? '에스크로 시스템으로 구매 확정 전까지 결제금이 안전하게 보관됩니다'
                  : '通过托管系统，在确认收货前货款将被安全保管'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ko' ? '양방향 거래' : '双向交易'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ko'
                  ? '한국과 중국 양방향으로 상품을 판매하고 구매할 수 있습니다'
                  : '可以在韩国和中国双向销售和购买商品'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ko' ? '공정한 분쟁해결' : '公平仲裁'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'ko'
                  ? '한중 양국 배심원의 공정한 투표로 분쟁을 해결합니다'
                  : '通过韩中两国陪审团的公平投票解决纠纷'}
              </p>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {language === 'ko'
              ? '지금 바로 시작하세요'
              : '立即开始'}
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            {language === 'ko'
              ? '간단한 가입으로 한국과 중국의 수백만 고객에게 상품을 판매하세요'
              : '简单注册，向韩国和中国数百万客户销售商品'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/posts/create">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                {language === 'ko' ? '판매 시작하기' : '开始销售'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/posts">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {language === 'ko' ? '상품 둘러보기' : '浏览商品'}
              </Button>
            </Link>
          </div>
        </section>

        {/* 세관 공지사항 및 주의사항 */}
        <section className="space-y-6">
          {/* 공지사항 헤더 */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ko' ? '세관 통관 안내 및 주의사항' : '海关通关须知及注意事项'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 한국 → 중국 세관 안내 */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex items-center gap-2">
                <span className="text-xl">🇰🇷</span>
                <span className="font-semibold">→</span>
                <span className="text-xl">🇨🇳</span>
                <span className="ml-2 font-semibold">
                  {language === 'ko' ? '한국 → 중국 통관 안내' : '韩国 → 中国 通关须知'}
                </span>
              </div>
              <div className="p-4 space-y-4">
                {/* 통관 불가 품목 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-red-600">
                      {language === 'ko' ? '통관 불가 품목' : '禁止入境物品'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-7">
                    <li>• {language === 'ko' ? '의약품 (처방약, 마약류)' : '药品（处方药、毒品类）'}</li>
                    <li>• {language === 'ko' ? '무기류 및 모조 무기' : '武器及仿制武器'}</li>
                    <li>• {language === 'ko' ? '동식물 및 동식물 제품 (검역 미통과)' : '动植物及动植物产品（未经检疫）'}</li>
                    <li>• {language === 'ko' ? '음란물 및 정치적 민감 자료' : '淫秽物品及政治敏感资料'}</li>
                    <li>• {language === 'ko' ? '위조품 및 저작권 침해 상품' : '假冒伪劣及侵权商品'}</li>
                    <li>• {language === 'ko' ? '인삼 제품 (개인 휴대 5kg 초과 시)' : '人参产品（个人携带超过5kg时）'}</li>
                  </ul>
                </div>
                {/* 관세 부과 품목 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-600">
                      {language === 'ko' ? '관세 부과 기준' : '关税征收标准'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-7">
                    <li>• {language === 'ko' ? '개인 물품: 5,000위안 초과 시 과세' : '个人物品：超过5000元人民币征税'}</li>
                    <li>• {language === 'ko' ? '화장품: 30% 관세 (고급품 50%)' : '化妆品：30%关税（高档品50%）'}</li>
                    <li>• {language === 'ko' ? '전자제품: 15~20% 관세' : '电子产品：15~20%关税'}</li>
                    <li>• {language === 'ko' ? '식품류: 15~35% 관세' : '食品类：15~35%关税'}</li>
                    <li>• {language === 'ko' ? '의류/패션: 20~25% 관세' : '服装/时尚：20~25%关税'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 중국 → 한국 세관 안내 */}
            <div className="border rounded-xl overflow-hidden">
              <div className="bg-red-600 text-white p-4 flex items-center gap-2">
                <span className="text-xl">🇨🇳</span>
                <span className="font-semibold">→</span>
                <span className="text-xl">🇰🇷</span>
                <span className="ml-2 font-semibold">
                  {language === 'ko' ? '중국 → 한국 통관 안내' : '中国 → 韩国 通关须知'}
                </span>
              </div>
              <div className="p-4 space-y-4">
                {/* 통관 불가 품목 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h4 className="font-semibold text-red-600">
                      {language === 'ko' ? '통관 불가 품목' : '禁止入境物品'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-7">
                    <li>• {language === 'ko' ? '의약품 (전문의약품, 한약재 일부)' : '药品（处方药、部分中药材）'}</li>
                    <li>• {language === 'ko' ? '육류, 유제품 등 축산물' : '肉类、乳制品等畜产品'}</li>
                    <li>• {language === 'ko' ? '과일, 채소 등 신선 농산물' : '水果、蔬菜等新鲜农产品'}</li>
                    <li>• {language === 'ko' ? '멸종위기종 관련 제품' : '濒危物种相关产品'}</li>
                    <li>• {language === 'ko' ? '위조 브랜드 상품' : '假冒品牌商品'}</li>
                    <li>• {language === 'ko' ? '리튬 배터리 (160Wh 초과)' : '锂电池（超过160Wh）'}</li>
                  </ul>
                </div>
                {/* 관세 부과 품목 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-amber-600">
                      {language === 'ko' ? '관세 부과 기준' : '关税征收标准'}
                    </h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-7">
                    <li>• {language === 'ko' ? '개인 면세: 미화 $150 이하' : '个人免税：150美元以下'}</li>
                    <li>• {language === 'ko' ? '자가사용 인정: 미화 $200 이하 (간이과세)' : '自用认定：200美元以下（简易征税）'}</li>
                    <li>• {language === 'ko' ? '의류/신발: 13% 관세 + 10% 부가세' : '服装/鞋类：13%关税 + 10%增值税'}</li>
                    <li>• {language === 'ko' ? '전자제품: 8% 관세 + 10% 부가세' : '电子产品：8%关税 + 10%增值税'}</li>
                    <li>• {language === 'ko' ? '건강식품: 8% 관세 + 10% 부가세' : '保健食品：8%关税 + 10%增值税'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 일반 주의사항 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">
                  {language === 'ko' ? '일반 주의사항' : '一般注意事项'}
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• {language === 'ko'
                    ? '통관 규정은 수시로 변경될 수 있으니, 구매 전 반드시 최신 규정을 확인하세요.'
                    : '通关规定可能随时变更，购买前请务必确认最新规定。'}</li>
                  <li>• {language === 'ko'
                    ? '관세 및 부가세는 구매자 부담이며, 통관 지연 시 추가 비용이 발생할 수 있습니다.'
                    : '关税及增值税由买家承担，通关延迟时可能产生额外费用。'}</li>
                  <li>• {language === 'ko'
                    ? '상품 가격을 허위로 신고할 경우 벌금 및 법적 책임이 발생할 수 있습니다.'
                    : '虚假申报商品价格可能导致罚款及法律责任。'}</li>
                  <li>• {language === 'ko'
                    ? '식품, 건강기능식품은 수량 제한이 있으니 구매 전 확인하세요.'
                    : '食品、保健食品有数量限制，购买前请确认。'}</li>
                  <li>• {language === 'ko'
                    ? '통관 불가 품목 거래 시 직구역구는 책임지지 않습니다.'
                    : '交易禁止入境物品时，直购易购不承担责任。'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 문의 안내 */}
          <div className="text-center text-sm text-gray-500">
            <p>
              {language === 'ko'
                ? '세관 통관에 대한 자세한 문의는 관세청(☎ 125) 또는 중국 해관(☎ 12360)으로 연락하세요.'
                : '如有通关详细咨询，请联系韩国关税厅(☎ 125)或中国海关(☎ 12360)。'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
