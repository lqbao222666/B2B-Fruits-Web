import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { ten_nong_san: 'Sầu riêng RI6 (Mua sỉ lớn)', don_vi: 'kg', gia: 75000 },
  { ten_nong_san: 'Xoài Cát Hòa Lộc (Xuất khẩu)', don_vi: 'kg', gia: 65000 },
  { ten_nong_san: 'Thanh Long Ruột Đỏ (Chuẩn VietGAP)', don_vi: 'kg', gia: 22000 },
  { ten_nong_san: 'Bưởi Da Xanh Bến Tre', don_vi: 'kg', gia: 45000 },
  { ten_nong_san: 'Măng Cụt Lái Thiêu', don_vi: 'kg', gia: 55000 },
  { ten_nong_san: 'Mít Thái Siêu Sớm', don_vi: 'kg', gia: 15000 },
  { ten_nong_san: 'Cà phê Robusta Đắk Lắk', don_vi: 'kg', gia: 95000 },
  { ten_nong_san: 'Hạt Tiêu Đen Chư Sê', don_vi: 'kg', gia: 120000 },
  { ten_nong_san: 'Chôm Chôm Nhãn Đồng Nai', don_vi: 'kg', gia: 35000 },
  { ten_nong_san: 'Sầu riêng Monthong Thái', don_vi: 'kg', gia: 85000 },
];

async function main() {
  const enterpriseEmails = Array.from({length: 10}, (_, i) => `doanhnghiep${i+1}@gmail.com`);
  const farmerEmails = Array.from({length: 10}, (_, i) => `nongdan${i+1}@gmail.com`);

  // Lấy danh sách doanh nghiệp
  const enterprises = await prisma.users.findMany({ 
    where: { 
      email: { in: enterpriseEmails }
    } 
  });

  // Lấy danh sách nông dân
  const farmers = await prisma.users.findMany({
    where: {
      email: { in: farmerEmails }
    }
  });

  if (!enterprises.length || !farmers.length) {
    console.log('Không tìm đủ tài khoản doanh nghiệp hoặc nông dân theo yêu cầu.');
    return;
  }

  let createdCount = 0;
  const numOrdersToCreate = 40;

  console.log(`Tiến hành tạo ${numOrdersToCreate} đơn hàng từ Nhu Cầu Thu Mua...`);

  const firstDm = await prisma.danhMuc.findFirst();
  const danhmucId = firstDm ? firstDm.danhmuc_id : 1;

  for (let i = 0; i < numOrdersToCreate; i++) {
    const buyer = enterprises[Math.floor(Math.random() * enterprises.length)];
    const seller = farmers[Math.floor(Math.random() * farmers.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    const orderQty = Math.floor(Math.random() * 90) * 10 + 100; // 100 to 1000
    const giaThuongLuong = product.gia * (1 + (Math.random() * 0.1 - 0.05)); // +/- 5%
    const finalPrice = Math.round(giaThuongLuong / 1000) * 1000;
    const totalAmount = orderQty * finalPrice;

    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000); 
    const nextMonth = new Date(orderDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // 1. Tạo NhuCauThuMua
    const nhuCau = await prisma.nhuCauThuMua.create({
      data: {
        doanh_nghiep_id: buyer.user_id,
        danhmuc_id: danhmucId,
        ten_nong_san: product.ten_nong_san,
        mo_ta: `Cần thu mua gấp ${product.ten_nong_san} số lượng lớn.`,
        so_luong_can: orderQty,
        don_vi: product.don_vi,
        gia_tham_khao: product.gia,
        cho_thuong_luong: true,
        tinh_thanh_giao: 'Hồ Chí Minh',
        dia_chi_giao: 'Kho thu mua Doanh nghiệp',
        trang_thai: 'dang_thu_mua',
        ngay_bat_dau: orderDate,
        ngay_ket_thuc: nextMonth,
      }
    });

    // 2. Tạo BaoGiaNhuCau (đã thống nhất)
    const baoGia = await prisma.baoGiaNhuCau.create({
      data: {
        nhucau_id: nhuCau.nhucau_id,
        nong_dan_id: seller.user_id,
        so_luong_cung_cap: orderQty,
        don_vi: product.don_vi,
        gia_de_xuat: finalPrice,
        tinh_thanh_cung_cap: 'Tiền Giang',
        dia_chi_cung_cap: 'Nhà vườn Nông dân',
        khoang_cach_km: Math.floor(Math.random() * 200) + 10,
        phi_van_chuyen: (Math.floor(Math.random() * 5) + 1) * 100000,
        trang_thai: 'da_thong_nhat',
        created_at: orderDate,
        updated_at: orderDate,
      }
    });

    // 3. Logic tự động sinh Bài Đăng ẩn (giống trong hệ thống)
    const baiDang = await prisma.baiDang.create({
      data: {
        nguoi_dang_id: seller.user_id,
        danhmuc_id: danhmucId,
        tieu_de: `Giao dịch B2B - ${nhuCau.ten_nong_san}`,
        ten_nong_san: nhuCau.ten_nong_san,
        mo_ta: `Bài đăng B2B tự động khởi tạo phục vụ giao dịch B2B từ Nhu Cầu Thu Mua: ${nhuCau.ten_nong_san}`,
        don_vi_tinh: nhuCau.don_vi,
        so_luong_co: 0,
        so_luong_con_lai: 0,
        gia_per_kg: finalPrice,
        tinh_thanh: 'Hồ Chí Minh',
        trang_thai: 'an',
        created_at: orderDate,
      },
    });

    const phanLoai = await prisma.phanLoaiSanPham.create({
      data: {
        baidang_id: baiDang.baidang_id,
        ten_phan_loai: 'Loại Chuẩn B2B',
        so_luong_co: orderQty,
        so_luong_con_lai: orderQty,
        gia: finalPrice,
      },
    });

    // 4. Trạng thái đơn hàng
    let trangThaiDon: 'cho_xac_nhan' | 'da_xac_nhan' | 'dang_giao' | 'hoan_thanh' | 'da_huy' = 'hoan_thanh';
    let trangThaiTT: 'chua_thanh_toan' | 'da_thanh_toan' = 'da_thanh_toan';

    let ngayXacNhan: Date | null = new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    let ngayGiaoDuKien: Date | null = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    let ngayHoanThanh: Date | null = new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000);

    const randStatus = Math.random();
    if (daysAgo < 2) {
      trangThaiDon = 'cho_xac_nhan';
      trangThaiTT = 'chua_thanh_toan';
      ngayXacNhan = null;
      ngayGiaoDuKien = null;
      ngayHoanThanh = null;
    } else if (daysAgo < 5) {
      if (randStatus < 0.3) {
         trangThaiDon = 'cho_xac_nhan';
         ngayXacNhan = null;
      } else {
         trangThaiDon = 'da_xac_nhan';
         trangThaiTT = 'chua_thanh_toan';
      }
      ngayHoanThanh = null;
    } else if (daysAgo < 10) {
      if (randStatus < 0.2) {
         trangThaiDon = 'dang_giao';
         trangThaiTT = 'chua_thanh_toan';
         ngayHoanThanh = null;
      } else if (randStatus < 0.3) {
         trangThaiDon = 'da_huy';
         ngayHoanThanh = null;
      } else {
         trangThaiDon = 'hoan_thanh';
         trangThaiTT = 'da_thanh_toan';
      }
    }

    // 5. Tạo DonHang
    const donHang = await prisma.donHang.create({
      data: {
        ma_don_hang: `B2B-NC-${Date.now()}-${i}`,
        nguoi_mua_id: buyer.user_id,
        nguoi_ban_id: seller.user_id,
        baidang_id: baiDang.baidang_id,
        tong_tien: totalAmount,
        tien_coc: totalAmount * 0.15,
        dia_chi_giao: 'Kho thu mua doanh nghiệp',
        tinh_thanh_giao: 'Hồ Chí Minh',
        khoang_cach: Number(baoGia.khoang_cach_km) || 100,
        phi_van_chuyen: Number(baoGia.phi_van_chuyen) || 500000,
        trang_thai_don: trangThaiDon,
        trang_thai_tt: trangThaiTT,
        ngay_tao: orderDate,
        ngay_xac_nhan: ngayXacNhan,
        ngay_giao_du_kien: ngayGiaoDuKien,
        ngay_hoan_thanh: ngayHoanThanh,
        phuong_thuc_tt: 'chuyen_khoan',
        nong_dan_xac_nhan_giao: ['dang_giao', 'hoan_thanh'].includes(trangThaiDon),
        ngay_nong_dan_xac_nhan: ['dang_giao', 'hoan_thanh'].includes(trangThaiDon) ? new Date(ngayXacNhan!.getTime() + 12 * 60 * 60 * 1000) : null
      }
    });

    // 6. Tạo DonHangChiTiet
    await prisma.donHangChiTiet.create({
      data: {
        donhang_id: donHang.donhang_id,
        phanloai_id: phanLoai.phanloai_id,
        so_luong: orderQty,
        don_gia: finalPrice,
        thanh_tien: totalAmount,
      }
    });

    // 7. Cập nhật số lượng còn lại của bài đăng
    if (trangThaiDon !== 'da_huy') {
      await prisma.baiDang.update({
        where: { baidang_id: baiDang.baidang_id },
        data: { so_luong_con_lai: 0 } // Vì B2B tạo bài ẩn số lượng = số lượng đơn
      });

      await prisma.phanLoaiSanPham.update({
        where: { phanloai_id: phanLoai.phanloai_id },
        data: { so_luong_con_lai: 0 }
      });
    }

    // 8. Đánh giá nếu hoàn thành
    if (trangThaiDon === 'hoan_thanh' && randStatus > 0.3) {
      const reviewDate = new Date(ngayHoanThanh!.getTime() + 24 * 60 * 60 * 1000);
      const isFiveStar = Math.random() > 0.3; 
      
      const nhanXet = isFiveStar 
          ? `Giao dịch báo giá thành công. Nông sản ${nhuCau.ten_nong_san} đúng với mô tả, hợp tác lâu dài.` 
          : `Giao dịch Nhu Cầu thành công nhưng thời gian giao hơi chậm một chút.`;

      await prisma.danhGia.create({
        data: {
          donhang_id: donHang.donhang_id,
          baidang_id: baiDang.baidang_id,
          nguoi_danhgia_id: buyer.user_id,
          nguoi_duoc_dg_id: seller.user_id,
          diem_tong: isFiveStar ? 5 : 4,
          diem_chat_luong: isFiveStar ? 5 : 3,
          diem_dung_hen: isFiveStar ? 5 : 4,
          diem_thai_do: 5,
          nhan_xet: nhanXet,
          created_at: reviewDate,
        }
      });
    }

    createdCount++;
    console.log(`[Nhu cầu B2B ${createdCount}] Đã tạo Đơn hàng ${donHang.ma_don_hang} từ Nhu Cầu Thu Mua - SP: ${nhuCau.ten_nong_san} - DN: ${buyer.full_name} - ND báo giá: ${seller.full_name}`);
  }
  
  console.log(`\nHoàn tất! Đã tạo thành công ${createdCount} bộ dữ liệu (Nhu Cầu -> Báo Giá -> Đơn Hàng).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
