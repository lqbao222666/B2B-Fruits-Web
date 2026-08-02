const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.baiDang.findMany({
    include: { phanLoais: true },
    orderBy: { baidang_id: 'desc' },
    take: 1
  });
  console.log(JSON.stringify(posts, null, 2));
}

main().finally(() => prisma.$disconnect());
