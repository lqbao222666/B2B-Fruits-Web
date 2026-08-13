import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Lấy danh sách nông dân (role_id: 2) và doanh nghiệp (role_id: 3)
  const farmers = await prisma.users.findMany({ where: { role_id: 2 }, take: 2 });
  const enterprises = await prisma.users.findMany({ where: { role_id: 3 }, take: 2 });

  if (!farmers.length || !enterprises.length) {
    console.log('Cần ít nhất 1 nông dân và 1 doanh nghiệp để tạo đơn hàng. Hãy đăng ký tài khoản mẫu trước.');
    return;
  }

  const cat = await prisma.danhMuc.findFirst();
  const danhmuc_id = cat ? cat.danhmuc_id : 1;

  let createdCount = 0;

  for (let i = 0; i < 5; i++) {
    const farmer = farmers[i % farmers.length];
    const buyer = enterprises[i % enterprises.length];

    // Ngày tạo bài đăng (cách đây 1, 2, 3... tháng)
    const postDate = new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000); 
    const basePrice = 50000 + i * 5000;

    // Tạo BaiDang
    const baiDang = await prisma.baiDang.create({
      data: {
        nguoi_dang_id: farmer.user_id,
        danhmuc_id,
        tieu_de: `Sản phẩm mẫu B2B ${i + 1}`,
        ten_nong_san: `Nông sản đạt chuẩn ${i + 1}`,
        mo_ta: `Mô tả sản phẩm mẫu B2B ${i + 1}, cung cấp số lượng lớn, bao tiêu chất lượng.`,
        so_luong_co: 5000,
        so_luong_con_lai: 4000,
        don_vi_tinh: 'kg',
        gia_per_kg: basePrice,
        tinh_thanh: 'Cần Thơ',
        trang_thai: 'dang_ban',
        created_at: postDate,
      }
    });

    const phanLoai = await prisma.phanLoaiSanPham.create({
      data: {
        baidang_id: baiDang.baidang_id,
        ten_phan_loai: 'Loại 1 Xuất khẩu',
        so_luong_co: 5000,
        so_luong_con_lai: 4000,
        gia: basePrice,
      }
    });

    // Ngày đặt hàng (sau ngày đăng bài 5 ngày)
    const orderDate = new Date(postDate.getTime() + 5 * 24 * 60 * 60 * 1000); 
    const donHang = await prisma.donHang.create({
      data: {
        ma_don_hang: `B2B-SEED-${Date.now()}-${i}`,
        nguoi_mua_id: buyer.user_id,
        nguoi_ban_id: farmer.user_id,
        baidang_id: baiDang.baidang_id,
        tong_tien: 1000 * basePrice,
        tien_coc: 0.15 * (1000 * basePrice),
        dia_chi_giao: 'Kho thu mua mẫu',
        tinh_thanh_giao: 'Hồ Chí Minh',
        khoang_cach: 150 + i * 10,
        phi_van_chuyen: 500000 + i * 50000,
        trang_thai_don: 'hoan_thanh', // Đơn hàng đã hoàn thành
        trang_thai_tt: 'da_thanh_toan',
        ngay_tao: orderDate,
        updated_at: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000), // Hoàn thành sau 4 ngày
      }
    });

    await prisma.donHangChiTiet.create({
      data: {
        donhang_id: donHang.donhang_id,
        phanloai_id: phanLoai.phanloai_id,
        so_luong: 1000,
        don_gia: basePrice,
        thanh_tien: 1000 * basePrice,
      }
    });

    // Tạo đánh giá sau khi hoàn thành đơn hàng 1 ngày
    const reviewDate = new Date(donHang.updated_at.getTime() + 24 * 60 * 60 * 1000);
    const isFiveStar = i % 2 === 0;
    
    await prisma.danhGia.create({
      data: {
        donhang_id: donHang.donhang_id,
        baidang_id: baiDang.baidang_id,
        nguoi_danhgia_id: buyer.user_id,
        nguoi_duoc_dg_id: farmer.user_id,
        diem_tong: isFiveStar ? 5 : 4,
        diem_chat_luong: isFiveStar ? 5 : 4,
        diem_dung_hen: 5,
        diem_thai_do: 5,
        nhan_xet: isFiveStar 
          ? `Nông sản ${baiDang.ten_nong_san} đạt chuẩn xuất sắc, đóng gói kỹ càng, xe tải giao đúng giờ!` 
          : `Chất lượng ${baiDang.ten_nong_san} khá tốt, tuy nhiên kích thước trái chưa đều lắm. Thái độ nhiệt tình.`,
        created_at: reviewDate,
      }
    });

    console.log(`[Cụm ${i + 1}] Đã tạo Bài đăng, Đơn hàng và Đánh giá thành công.`);
    createdCount++;
  }
  
  console.log(`\nHoàn tất! Đã tạo thành công ${createdCount} bộ dữ liệu mẫu (Bài đăng -> Đơn hàng -> Đánh giá).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
