
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    include: {
      nongDan: true,
      doanhNghiep: true
    }
  });
  
  let ndCount = 1;
  let dnCount = 1;
  let otherCount = 1;

  for (const user of users) {
    let phone = user.phone;
    if (!phone) {
      if (user.nongDan) {
        phone = '09415204' + String(ndCount).padStart(2, '0');
        ndCount++;
      } else if (user.doanhNghiep) {
        phone = '09415205' + String(dnCount).padStart(2, '0');
        dnCount++;
      } else {
        phone = '09415206' + String(otherCount).padStart(2, '0');
        otherCount++;
      }
      
      await prisma.users.update({
        where: { user_id: user.user_id },
        data: { phone }
      });
      console.log('Updated user ' + user.user_id + ' with phone ' + phone);
    }

    if (user.nongDan && !user.nongDan.so_dien_thoai) {
       await prisma.nongDan.update({
         where: { user_id: user.user_id },
         data: { so_dien_thoai: phone }
       });
       console.log('Updated nongdan ' + user.user_id + ' with phone ' + phone);
    }
    
    if (user.doanhNghiep && !user.doanhNghiep.so_dien_thoai) {
       await prisma.doanhNghiep.update({
         where: { user_id: user.user_id },
         data: { so_dien_thoai: phone }
       });
       console.log('Updated doanhnghiep ' + user.user_id + ' with phone ' + phone);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

