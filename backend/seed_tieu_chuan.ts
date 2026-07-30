import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const standards = [
    { ten_tieu_chuan: 'VietGAP', icon_url: 'verified' },
    { ten_tieu_chuan: 'GlobalGAP', icon_url: 'public' },
    { ten_tieu_chuan: 'Hữu cơ (Organic)', icon_url: 'eco' },
    { ten_tieu_chuan: 'OCOP 3 Sao', icon_url: 'stars' },
    { ten_tieu_chuan: 'OCOP 4 Sao', icon_url: 'stars' },
    { ten_tieu_chuan: 'OCOP 5 Sao', icon_url: 'stars' },
    { ten_tieu_chuan: 'ISO 22000', icon_url: 'assignment_turned_in' }
  ];

  for (const std of standards) {
    await prisma.tieuChuan.upsert({
      where: { ten_tieu_chuan: std.ten_tieu_chuan },
      update: {},
      create: std,
    });
  }
  console.log('Seeded standards successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
