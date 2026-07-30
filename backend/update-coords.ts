import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.baiDang.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    }
  });
  
  console.log(`Found ${posts.length} posts to update.`);
  for (const p of posts) {
    await prisma.baiDang.update({
      where: { baidang_id: p.baidang_id },
      data: {
        // default to HCM center
        latitude: 10.762622,
        longitude: 106.660172
      }
    });
  }
  console.log('Update finished.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
