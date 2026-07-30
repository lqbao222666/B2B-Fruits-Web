import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Đang lấy danh sách các bài đăng hiện tại...');
  const baiDangs = await prisma.baiDang.findMany({
    include: {
      phanLoais: true
    }
  });

  let count = 0;
  for (const bd of baiDangs) {
    if (bd.phanLoais.length === 0) {
      // Create a default 'Loại 1' variant
      await prisma.phanLoaiSanPham.create({
        data: {
          baidang_id: bd.baidang_id,
          ten_phan_loai: 'Loại 1',
          gia: bd.gia_per_kg,
          so_luong_co: bd.so_luong_co,
          so_luong_con_lai: bd.so_luong_con_lai
        }
      });
      count++;
    }
  }

  console.log(`Đã tạo thành công ${count} phân loại cho các bài đăng cũ!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
