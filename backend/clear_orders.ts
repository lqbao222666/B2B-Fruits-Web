import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu xoá tất cả dữ liệu đơn hàng cũ...');
  
  await prisma.thanhToan.deleteMany({});
  await prisma.danhGia.deleteMany({});
  await prisma.donHang.deleteMany({});
  
  console.log('Xoá thành công tất cả đơn hàng cũ!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
