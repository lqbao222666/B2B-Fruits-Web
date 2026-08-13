import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const enterprises = await prisma.doanhNghiep.findMany({ take: 5 });
  
  if (enterprises.length === 0) {
    console.log('Không tìm thấy doanh nghiệp nào trong CSDL. Vui lòng tạo doanh nghiệp trước.');
    return;
  }
  
  const demands = [
    {
      ten_nong_san: 'Sầu riêng RI6',
      mo_ta: 'Thu mua sầu riêng RI6 loại 1, yêu cầu trái đều, cơm vàng hạt lép. Cần nguồn cung ổn định để xuất khẩu.',
      so_luong_can: 5000,
      don_vi: 'kg',
      gia_tham_khao: 75000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Hồ Chí Minh',
      dia_chi_giao: 'Kho bãi Thủ Đức, TP. Hồ Chí Minh'
    },
    {
      ten_nong_san: 'Xoài Cát Hòa Lộc',
      mo_ta: 'Cần mua xoài cát Hòa Lộc đạt chuẩn để phân phối chuỗi siêu thị. Yêu cầu da sáng, không tỳ vết.',
      so_luong_can: 2000,
      don_vi: 'kg',
      gia_tham_khao: 65000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'Cần Thơ',
      dia_chi_giao: 'Cảng Cần Thơ, Q. Bình Thủy'
    },
    {
      ten_nong_san: 'Thanh Long Ruột Đỏ',
      mo_ta: 'Thu mua thanh long ruột đỏ xuất khẩu sang châu Á, trọng lượng tối thiểu 400g/trái.',
      so_luong_can: 10000,
      don_vi: 'kg',
      gia_tham_khao: 22000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Bình Thuận',
      dia_chi_giao: 'KCN Hàm Kiệm, Bình Thuận'
    },
    {
      ten_nong_san: 'Bưởi Da Xanh',
      mo_ta: 'Tuyển nguồn bưởi da xanh Bến Tre cho dịp lễ tết, cần vỏ mỏng, nước nhiều, độ ngọt cao.',
      so_luong_can: 3000,
      don_vi: 'kg',
      gia_tham_khao: 45000,
      yeu_cau_chung_nhan: 'Hữu cơ',
      tinh_thanh_giao: 'Bến Tre',
      dia_chi_giao: 'Châu Thành, Bến Tre'
    },
    {
      ten_nong_san: 'Măng Cụt',
      mo_ta: 'Tìm nhà vườn cung cấp măng cụt loại 1, quả tròn đều không sượng.',
      so_luong_can: 1500,
      don_vi: 'kg',
      gia_tham_khao: 55000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Hồ Chí Minh',
      dia_chi_giao: 'Chợ đầu mối Bình Điền'
    }
  ];

  const cat = await prisma.danhMuc.findFirst();
  const danhmuc_id = cat ? cat.danhmuc_id : 1;

  let createdCount = 0;

  for (let i = 0; i < enterprises.length; i++) {
    const dn = enterprises[i];
    const demand = demands[i] || demands[0];
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.nhuCauThuMua.create({
      data: {
        doanh_nghiep_id: dn.user_id,
        danhmuc_id: danhmuc_id,
        ten_nong_san: demand.ten_nong_san,
        mo_ta: demand.mo_ta,
        so_luong_can: demand.so_luong_can,
        don_vi: demand.don_vi,
        gia_tham_khao: demand.gia_tham_khao,
        cho_thuong_luong: true,
        yeu_cau_chung_nhan: demand.yeu_cau_chung_nhan,
        tinh_thanh_giao: demand.tinh_thanh_giao,
        dia_chi_giao: demand.dia_chi_giao,
        trang_thai: 'dang_thu_mua',
        ngay_bat_dau: new Date(),
        ngay_ket_thuc: nextMonth,
      }
    });
    console.log(`Đã tạo nhu cầu cho doanh nghiệp ID ${dn.user_id}: ${demand.ten_nong_san}`);
    createdCount++;
  }
  
  console.log(`\n Hoàn tất! Đã tạo thành công ${createdCount} nhu cầu thu mua.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
