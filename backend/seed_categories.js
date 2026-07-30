const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = await prisma.danhMuc.findMany();
  console.log("Current Categories:", cats.map(c => c.ten_danh_muc));

  // 1. Create Parent Categories
  const parents = [
    { ten_danh_muc: "Trái cây", slug: "trai-cay" },
    { ten_danh_muc: "Rau củ", slug: "rau-cu" },
    { ten_danh_muc: "Lương thực", slug: "luong-thuc" },
    { ten_danh_muc: "Các loại hạt", slug: "cac-loai-hat" },
  ];

  const createdParents = {};
  for (const p of parents) {
    let parent = await prisma.danhMuc.findUnique({ where: { slug: p.slug } });
    if (!parent) {
      parent = await prisma.danhMuc.create({ data: p });
      console.log("Created parent:", parent.ten_danh_muc);
    }
    createdParents[p.slug] = parent;
  }

  // 2. Map existing categories to parent
  for (const c of cats) {
    if (c.danhmuc_cha_id === null && !parents.some(p => p.slug === c.slug)) {
      const name = c.ten_danh_muc.toLowerCase();
      let parentSlug = null;
      
      if (name.includes('xoài') || name.includes('cam') || name.includes('bưởi') || name.includes('chôm chôm') || name.includes('măng cụt')) {
        parentSlug = 'trai-cay';
      } else if (name.includes('rau') || name.includes('củ') || name.includes('khoai') || name.includes('cà rốt')) {
        parentSlug = 'rau-cu';
      } else if (name.includes('gạo') || name.includes('lúa') || name.includes('bắp') || name.includes('ngô')) {
        parentSlug = 'luong-thuc';
      } else if (name.includes('hạt') || name.includes('điều') || name.includes('tiêu')) {
        parentSlug = 'cac-loai-hat';
      }
      
      if (parentSlug) {
        await prisma.danhMuc.update({
          where: { danhmuc_id: c.danhmuc_id },
          data: { danhmuc_cha_id: createdParents[parentSlug].danhmuc_id }
        });
        console.log(`Moved ${c.ten_danh_muc} -> ${parentSlug}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
