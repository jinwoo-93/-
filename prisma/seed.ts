import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 카테고리 생성
  const categories = [
    { nameKo: 'K-뷰티', nameZh: 'K-美妆', slug: 'k-beauty', icon: '💄' },
    { nameKo: 'K-패션', nameZh: 'K-时尚', slug: 'k-fashion', icon: '👗' },
    { nameKo: 'K-푸드', nameZh: 'K-食品', slug: 'k-food', icon: '🍜' },
    { nameKo: 'K-팝/굿즈', nameZh: 'K-POP周边', slug: 'k-pop', icon: '🎵' },
    { nameKo: '전자제품', nameZh: '电子产品', slug: 'electronics', icon: '📱' },
    { nameKo: '생활용품', nameZh: '生活用品', slug: 'home', icon: '🏠' },
    { nameKo: '유아용품', nameZh: '母婴用品', slug: 'baby', icon: '👶' },
    { nameKo: '스포츠/레저', nameZh: '运动休闲', slug: 'sports', icon: '⚽' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Categories created');

  // 환율 설정
  await prisma.exchangeRate.upsert({
    where: {
      fromCurrency_toCurrency: {
        fromCurrency: 'KRW',
        toCurrency: 'CNY',
      },
    },
    update: { rate: 0.0054 },
    create: {
      fromCurrency: 'KRW',
      toCurrency: 'CNY',
      rate: 0.0054,
    },
  });

  console.log('Exchange rate created');

  // 테스트 관리자 계정 생성
  const admin = await prisma.user.upsert({
    where: { email: 'admin@jikguyeokgu.com' },
    update: {},
    create: {
      email: 'admin@jikguyeokgu.com',
      name: '관리자',
      nickname: 'Admin',
      userType: 'ADMIN',
      country: 'KR',
      language: 'KO',
      isPhoneVerified: true,
      isIdentityVerified: true,
    },
  });

  console.log('Admin user created:', admin.email);

  // 광고 슬롯 생성
  const categoryList = await prisma.category.findMany();

  for (const category of categoryList) {
    for (let position = 1; position <= 3; position++) {
      // 상품 광고 슬롯
      await prisma.adSlot.upsert({
        where: {
          categoryId_slotType_position: {
            categoryId: category.id,
            slotType: 'PRODUCT',
            position,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          slotType: 'PRODUCT',
          position,
        },
      });

      // 배송업체 광고 슬롯
      await prisma.adSlot.upsert({
        where: {
          categoryId_slotType_position: {
            categoryId: category.id,
            slotType: 'SHIPPING',
            position,
          },
        },
        update: {},
        create: {
          categoryId: category.id,
          slotType: 'SHIPPING',
          position,
        },
      });
    }
  }

  console.log('Ad slots created');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
