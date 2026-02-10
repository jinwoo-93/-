import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin() {
  const args = process.argv.slice(2);
  const email = args[0];

  try {
    // 이메일이 주어진 경우 해당 유저를 관리자로 설정
    if (email) {
      const user = await prisma.user.update({
        where: { email },
        data: { userType: 'ADMIN' },
      });
      console.log(`\n✅ 관리자 설정 완료!`);
      console.log(`   이름: ${user.name || '(없음)'}`);
      console.log(`   이메일: ${user.email}`);
      console.log(`   userType: ${user.userType}\n`);
      return;
    }

    // 이메일이 없으면 전체 유저 목록 표시
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        userType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('\n⚠️  등록된 유저가 없습니다.');
      console.log('   먼저 웹사이트에서 회원가입을 해주세요.\n');
      return;
    }

    console.log('\n📋 등록된 유저 목록:\n');
    console.log('  #  | 이메일                          | 이름       | 타입    | 가입일');
    console.log('  ---|-------------------------------|----------|-------|----------');
    users.forEach((user, i) => {
      const email = (user.email || '(없음)').padEnd(30);
      const name = (user.name || user.nickname || '(없음)').padEnd(8);
      const type = user.userType.padEnd(7);
      const date = user.createdAt.toISOString().split('T')[0];
      const marker = user.userType === 'ADMIN' ? ' ⭐' : '';
      console.log(`  ${String(i + 1).padStart(2)} | ${email} | ${name} | ${type} | ${date}${marker}`);
    });

    console.log('\n💡 사용법:');
    console.log('   npx ts-node prisma/set-admin.ts 이메일주소\n');
    console.log('   예시: npx ts-node prisma/set-admin.ts admin@example.com\n');

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`\n❌ 해당 이메일의 유저를 찾을 수 없습니다: ${email}\n`);
    } else {
      console.error('\n❌ 오류 발생:', error.message, '\n');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
