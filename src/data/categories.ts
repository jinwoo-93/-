/**
 * 2단계 카테고리 데이터
 * 크림 스타일의 카테고리 구조
 */

export interface SubCategory {
  id: string;
  nameKo: string;
  nameZh: string;
  slug: string;
  icon?: string;
}

export interface MainCategory {
  id: string;
  nameKo: string;
  nameZh: string;
  slug: string;
  icon?: string;
  subCategories: SubCategory[];
}

export const mainCategories: MainCategory[] = [
  {
    id: 'recommend',
    nameKo: '추천',
    nameZh: '推荐',
    slug: 'recommend',
    icon: '⭐',
    subCategories: [
      { id: 'popular', nameKo: '인기 상품', nameZh: '热门商品', slug: 'popular' },
      { id: 'new', nameKo: '신상품', nameZh: '新品', slug: 'new' },
      { id: 'best-seller', nameKo: '베스트셀러', nameZh: '畅销', slug: 'best-seller' },
      { id: 'trending', nameKo: '트렌딩', nameZh: '趋势', slug: 'trending' },
    ],
  },
  {
    id: 'gift',
    nameKo: '💝선물',
    nameZh: '💝礼物',
    slug: 'gift',
    subCategories: [
      { id: 'birthday', nameKo: '생일 선물', nameZh: '生日礼物', slug: 'birthday' },
      { id: 'anniversary', nameKo: '기념일 선물', nameZh: '纪念日礼物', slug: 'anniversary' },
      { id: 'holiday', nameKo: '명절 선물', nameZh: '节日礼物', slug: 'holiday' },
      { id: 'couple', nameKo: '커플 선물', nameZh: '情侣礼物', slug: 'couple' },
    ],
  },
  {
    id: 'sale',
    nameKo: '세일',
    nameZh: '特价',
    slug: 'sale',
    icon: '🔥',
    subCategories: [
      {
        id: 'clothing',
        nameKo: '의류',
        nameZh: '服装',
        slug: 'clothing',
      },
      {
        id: 'shoes',
        nameKo: '신발',
        nameZh: '鞋类',
        slug: 'shoes',
      },
      {
        id: 'bags',
        nameKo: '가방',
        nameZh: '包',
        slug: 'bags',
      },
      {
        id: 'accessories',
        nameKo: '액세서리',
        nameZh: '配饰',
        slug: 'accessories',
      },
    ],
  },
  {
    id: 'luxury',
    nameKo: '럭셔리',
    nameZh: '奢侈品',
    slug: 'luxury',
    icon: '💎',
    subCategories: [
      { id: 'luxury-bags', nameKo: '명품 가방', nameZh: '奢侈包', slug: 'luxury-bags' },
      { id: 'luxury-watches', nameKo: '명품 시계', nameZh: '奢侈手表', slug: 'luxury-watches' },
      { id: 'luxury-jewelry', nameKo: '명품 주얼리', nameZh: '奢侈珠宝', slug: 'luxury-jewelry' },
      { id: 'luxury-clothing', nameKo: '명품 의류', nameZh: '奢侈服装', slug: 'luxury-clothing' },
    ],
  },
  {
    id: 'ranking',
    nameKo: '랭킹',
    nameZh: '排行榜',
    slug: 'ranking',
    icon: '🏆',
    subCategories: [
      { id: 'daily', nameKo: '일간 랭킹', nameZh: '日榜', slug: 'daily' },
      { id: 'weekly', nameKo: '주간 랭킹', nameZh: '周榜', slug: 'weekly' },
      { id: 'monthly', nameKo: '월간 랭킹', nameZh: '月榜', slug: 'monthly' },
      { id: 'real-time', nameKo: '실시간 랭킹', nameZh: '实时榜', slug: 'real-time' },
    ],
  },
  {
    id: 'used',
    nameKo: '중고',
    nameZh: '二手',
    slug: 'used',
    icon: '♻️',
    subCategories: [
      { id: 'used-clothing', nameKo: '중고 의류', nameZh: '二手服装', slug: 'used-clothing' },
      { id: 'used-shoes', nameKo: '중고 신발', nameZh: '二手鞋类', slug: 'used-shoes' },
      { id: 'used-bags', nameKo: '중고 가방', nameZh: '二手包', slug: 'used-bags' },
      { id: 'used-electronics', nameKo: '중고 전자기기', nameZh: '二手电子', slug: 'used-electronics' },
    ],
  },
  {
    id: 'beauty',
    nameKo: '뷰티',
    nameZh: '美妆',
    slug: 'beauty',
    icon: '💄',
    subCategories: [
      { id: 'skincare', nameKo: '스킨케어', nameZh: '护肤', slug: 'skincare' },
      { id: 'makeup', nameKo: '메이크업', nameZh: '彩妆', slug: 'makeup' },
      { id: 'fragrance', nameKo: '향수', nameZh: '香水', slug: 'fragrance' },
      { id: 'hair', nameKo: '헤어케어', nameZh: '护发', slug: 'hair' },
    ],
  },
  {
    id: 'event',
    nameKo: '이벤트',
    nameZh: '活动',
    slug: 'event',
    icon: '🎉',
    subCategories: [
      { id: 'current', nameKo: '진행중 이벤트', nameZh: '进行中', slug: 'current' },
      { id: 'upcoming', nameKo: '예정 이벤트', nameZh: '即将开始', slug: 'upcoming' },
      { id: 'coupons', nameKo: '쿠폰', nameZh: '优惠券', slug: 'coupons' },
      { id: 'flash-sale', nameKo: '타임세일', nameZh: '限时抢购', slug: 'flash-sale' },
    ],
  },
];

// 세부 카테고리 확장 데이터 (의류 예시)
export const clothingSubCategories: SubCategory[] = [
  { id: 'outer', nameKo: '아우터', nameZh: '外套', slug: 'outer' },
  { id: 'hoodie', nameKo: '후드티', nameZh: '卫衣', slug: 'hoodie' },
  { id: 'tshirt', nameKo: '티셔츠', nameZh: 'T恤', slug: 'tshirt' },
  { id: 'pants', nameKo: '바지', nameZh: '裤子', slug: 'pants' },
  { id: 'skirt', nameKo: '치마', nameZh: '裙子', slug: 'skirt' },
  { id: 'dress', nameKo: '원피스', nameZh: '连衣裙', slug: 'dress' },
];

// 신발 세부 카테고리
export const shoesSubCategories: SubCategory[] = [
  { id: 'sneakers', nameKo: '스니커즈', nameZh: '运动鞋', slug: 'sneakers' },
  { id: 'boots', nameKo: '부츠', nameZh: '靴子', slug: 'boots' },
  { id: 'sandals', nameKo: '샌들', nameZh: '凉鞋', slug: 'sandals' },
  { id: 'slippers', nameKo: '슬리퍼', nameZh: '拖鞋', slug: 'slippers' },
  { id: 'loafers', nameKo: '로퍼', nameZh: '乐福鞋', slug: 'loafers' },
];

// 가방 세부 카테고리
export const bagsSubCategories: SubCategory[] = [
  { id: 'backpack', nameKo: '백팩', nameZh: '背包', slug: 'backpack' },
  { id: 'shoulder', nameKo: '숄더백', nameZh: '单肩包', slug: 'shoulder' },
  { id: 'crossbody', nameKo: '크로스백', nameZh: '斜挎包', slug: 'crossbody' },
  { id: 'tote', nameKo: '토트백', nameZh: '托特包', slug: 'tote' },
  { id: 'clutch', nameKo: '클러치', nameZh: '手拿包', slug: 'clutch' },
];

// 액세서리 세부 카테고리
export const accessoriesSubCategories: SubCategory[] = [
  { id: 'hat', nameKo: '모자', nameZh: '帽子', slug: 'hat' },
  { id: 'watch', nameKo: '시계', nameZh: '手表', slug: 'watch' },
  { id: 'wallet', nameKo: '지갑', nameZh: '钱包', slug: 'wallet' },
  { id: 'sunglasses', nameKo: '선글라스', nameZh: '墨镜', slug: 'sunglasses' },
  { id: 'jewelry', nameKo: '주얼리', nameZh: '首饰', slug: 'jewelry' },
];
