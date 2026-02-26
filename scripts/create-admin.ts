import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@jikguyeokgu.com';

  // 기존 관리자 계정 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ 관리자 계정이 이미 존재합니다.');
    console.log('이메일:', existingAdmin.email);
    console.log('이름:', existingAdmin.name);
    console.log('권한:', existingAdmin.userType);
    return;
  }

  // 슈퍼 관리자 계정 생성
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: '박병찬',
      nickname: '관리자',
      userType: 'ADMIN',
      country: 'KR',
      language: 'KO',
      // OAuth로 로그인할 예정이므로 password는 null
    },
  });

  console.log('✅ 슈퍼 관리자 계정이 생성되었습니다!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('이메일:', admin.email);
  console.log('이름:', admin.name);
  console.log('권한:', admin.userType);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('💡 사용 방법:');
  console.log('1. Google/Kakao/Naver로 admin@jikguyeokgu.com 계정 생성');
  console.log('2. 해당 계정으로 로그인');
  console.log('3. /admin 페이지 접속');
}

main()
  .catch((e) => {
    console.error('❌ 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
