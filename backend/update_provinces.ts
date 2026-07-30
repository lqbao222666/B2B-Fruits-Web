import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const newProvince = 'Vĩnh Long';
  
  await prisma.nongDan.updateMany({
    data: { tinh_thanh: newProvince }
  });
  console.log('Updated NongDan');

  await prisma.doanhNghiep.updateMany({
    data: { tinh_thanh: newProvince }
  });
  console.log('Updated DoanhNghiep');

  await prisma.baiDang.updateMany({
    data: { tinh_thanh: newProvince }
  });
  console.log('Updated BaiDang');

  await prisma.nhuCauThuMua.updateMany({
    where: { tinh_thanh_giao: { not: null } },
    data: { tinh_thanh_giao: newProvince }
  });
  console.log('Updated NhuCauThuMua');

  await prisma.donHang.updateMany({
    data: { tinh_thanh_giao: newProvince }
  });
  console.log('Updated DonHang');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
