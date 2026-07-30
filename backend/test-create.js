const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const post = await prisma.baiDang.findFirst();
    if (!post) return console.log("No post found");
    const buyer = await prisma.doanhNghiep.findFirst();
    
    const res = await prisma.donHang.create({
      data: {
        nguoi_mua_id: buyer.user_id,
        nguoi_ban_id: post.nguoi_dang_id,
        baidang_id: post.baidang_id,
        ma_don_hang: 'DH' + Date.now(),
        so_luong: 100,
        don_vi_tinh: 'kg',
        don_gia: 1000,
        tong_tien: 100000,
        dia_chi_giao: 'abc',
        tinh_thanh_giao: 'def',
        hinh_thuc_giao_hang: 'giao_tan_noi',
        khoang_cach: 10,
        phi_van_chuyen: 10000,
        tien_coc: 15000,
        phuong_thuc_tt: 'chuyen_khoan',
      }
    });
    console.log("Success", res.donhang_id);
  } catch (e) {
    console.log("Error", e);
  }
}
run();
