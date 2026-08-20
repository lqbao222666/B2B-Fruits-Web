import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  const farmerIds = farmers.map(f => f.user_id);

  // Lấy các bài đăng hiện có đang bán của các nông dân này
  const posts = await prisma.baiDang.findMany({
    where: { 
      trang_thai: 'dang_ban',
      nguoi_dang_id: { in: farmerIds }
    },
    include: { 
      phanLoais: true,
      nguoiDang: true
    }
  });

  if (!posts.length) {
    console.log('Không có bài đăng nào ở trạng thái "dang_ban".');
    return;
  }

  const validPosts = posts.filter(p => p.phanLoais.length > 0 && Number(p.so_luong_con_lai) > 0);

  if (!validPosts.length) {
    console.log('Không có bài đăng nào hợp lệ (có phân loại và còn số lượng).');
    return;
  }

  let createdCount = 0;
  const numOrdersToCreate = 40;

  console.log(`Tiến hành tạo ${numOrdersToCreate} đơn hàng từ dữ liệu thật...`);

  for (let i = 0; i < numOrdersToCreate; i++) {
    // Random chọn 1 doanh nghiệp
    const buyer = enterprises[Math.floor(Math.random() * enterprises.length)];

    // Random chọn 1 bài đăng
    const post = validPosts[Math.floor(Math.random() * validPosts.length)];
    const farmer = post.nguoiDang;

    // Random chọn 1 phân loại của bài đăng đó
    const phanLoaisWithQty = post.phanLoais.filter(pl => Number(pl.so_luong_con_lai) > 0);
    if (!phanLoaisWithQty.length) continue; // Bỏ qua nếu phân loại đã hết hàng

    const phanLoai = phanLoaisWithQty[Math.floor(Math.random() * phanLoaisWithQty.length)];

    // Tạo số lượng đặt hàng ngẫu nhiên, không vượt quá số lượng còn lại
    // Tối thiểu 50, tối đa 500 hoặc số lượng còn lại
    const maxQty = Math.min(Number(phanLoai.so_luong_con_lai), 500);
    if (maxQty < 50) continue; // Ít quá không bõ tạo đơn

    const orderQty = Math.floor(Math.random() * ((maxQty - 50) / 10)) * 10 + 50; 
    const unitPrice = Number(phanLoai.gia);
    const totalAmount = orderQty * unitPrice;

    // Ngày tạo đơn hàng ngẫu nhiên trong khoảng 60 ngày qua
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000); 

    // Xác định trạng thái đơn hàng: 
    // Các đơn xa hơn 7 ngày thường đã hoàn thành. Các đơn gần đây có thể đang giao hoặc chờ xác nhận.
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

    // Tạo đơn hàng
    const donHang = await prisma.donHang.create({
      data: {
        ma_don_hang: `B2B-${Date.now()}-${i}`,
        nguoi_mua_id: buyer.user_id,
        nguoi_ban_id: farmer.user_id,
        baidang_id: post.baidang_id,
        tong_tien: totalAmount,
        tien_coc: totalAmount * 0.15,
        dia_chi_giao: 'Kho thu mua doanh nghiệp',
        tinh_thanh_giao: 'Hồ Chí Minh',
        khoang_cach: Math.floor(Math.random() * 200) + 10,
        phi_van_chuyen: (Math.floor(Math.random() * 5) + 1) * 100000,
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

    // Tạo chi tiết đơn hàng
    await prisma.donHangChiTiet.create({
      data: {
        donhang_id: donHang.donhang_id,
        phanloai_id: phanLoai.phanloai_id,
        so_luong: orderQty,
        don_gia: unitPrice,
        thanh_tien: totalAmount,
      }
    });

    // Trừ số lượng còn lại của bài đăng và phân loại
    if (trangThaiDon !== 'da_huy') {
      await prisma.baiDang.update({
        where: { baidang_id: post.baidang_id },
        data: { so_luong_con_lai: { decrement: orderQty } }
      });

      await prisma.phanLoaiSanPham.update({
        where: { phanloai_id: phanLoai.phanloai_id },
        data: { so_luong_con_lai: { decrement: orderQty } }
      });
      
      // Update locally
      // @ts-ignore
      post.so_luong_con_lai = Number(post.so_luong_con_lai) - orderQty;
      // @ts-ignore
      phanLoai.so_luong_con_lai = Number(phanLoai.so_luong_con_lai) - orderQty;
    }

    // Tạo đánh giá cho các đơn hàng hoàn thành
    if (trangThaiDon === 'hoan_thanh' && randStatus > 0.3) { // 70% có đánh giá
      const reviewDate = new Date(ngayHoanThanh!.getTime() + 24 * 60 * 60 * 1000);
      const isFiveStar = Math.random() > 0.3; // 70% 5 sao
      
      const nhanXet = isFiveStar 
          ? `Nông sản ${post.ten_nong_san} chất lượng rất tốt, ${farmer.ho_ten} giao hàng đúng hẹn và uy tín.` 
          : `Chất lượng ${post.ten_nong_san} ổn nhưng mẫu mã chưa đẹp lắm.`;

      await prisma.danhGia.create({
        data: {
          donhang_id: donHang.donhang_id,
          baidang_id: post.baidang_id,
          nguoi_danhgia_id: buyer.user_id,
          nguoi_duoc_dg_id: farmer.user_id,
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
    console.log(`[Đơn hàng ${createdCount}] Đã tạo đơn hàng ${donHang.ma_don_hang} - ${orderQty} ${post.don_vi_tinh} ${post.ten_nong_san} (${phanLoai.ten_phan_loai}) - Doanh nghiệp mua: ${buyer.full_name} - Nông dân bán: ${farmer.ho_ten}`);
  }
  
  console.log(`\nHoàn tất! Đã tạo thành công ${createdCount} bộ dữ liệu đơn hàng mẫu từ bài đăng thật.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
