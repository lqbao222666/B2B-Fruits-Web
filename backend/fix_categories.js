const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const traiCayIds = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,3];
  const rauCuIds = [26,27,28,29,30,31,32,33,34];
  const luongThucIds = [24,25];

  await prisma.danhMuc.updateMany({
    where: { danhmuc_id: { in: traiCayIds } },
    data: { danhmuc_cha_id: 2 }
  });

  await prisma.danhMuc.updateMany({
    where: { danhmuc_id: { in: rauCuIds } },
    data: { danhmuc_cha_id: 1 }
  });

  await prisma.danhMuc.updateMany({
    where: { danhmuc_id: { in: luongThucIds } },
    data: { danhmuc_cha_id: 35 }
  });
  console.log('Fixed relations');
}

main().finally(() => prisma.$disconnect());
