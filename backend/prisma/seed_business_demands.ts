import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mẫu nhu cầu thu mua nông sản theo kho của từng Doanh nghiệp
const businessDemandsData = [
  // Doanh nghiệp 1 - TP. Hồ Chí Minh
  [
    {
      ten_nong_san: 'Sầu Riêng RI6',
      mo_ta: 'Thu mua sầu riêng RI6 loại 1 chuẩn VietGAP. Yêu cầu trái tròn đều từ 2.5kg - 4.5kg, cơm vàng dẻo hạt lép. Cần nguồn cung ổn định giao về kho Bình Tân.',
      so_luong_can: 5000,
      don_vi: 'kg',
      gia_tham_khao: 80000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Đường Mã Lò, P. Bình Trị Đông A, Q. Bình Tân, TP.HCM',
      dia_chi_giao: 'Kho Tổng Nông Sản Bình Tân, Đường Mã Lò, Q. Bình Tân, TP.HCM',
      latitude: 10.7712,
      longitude: 106.6025,
    },
    {
      ten_nong_san: 'Măng Cụt',
      mo_ta: 'Thu mua măng cụt miệt vườn loại 1 phục vụ chuỗi siêu thị TP.HCM. Yêu cầu trái vỏ mỏng, tím sẫm, múi trắng không sượng.',
      so_luong_can: 3000,
      don_vi: 'kg',
      gia_tham_khao: 58000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'Xã Xuân Thới Sơn, Huyện Hóc Môn, TP.HCM',
      dia_chi_giao: 'Kho Lạnh Thu Mua Hóc Môn, Xã Xuân Thới Sơn, Hóc Môn, TP.HCM',
      latitude: 10.8845,
      longitude: 106.5712,
    },
  ],

  // Doanh nghiệp 2 - Cần Thơ
  [
    {
      ten_nong_san: 'Xoài Cát Hòa Lộc',
      mo_ta: 'Cần mua xoài cát Hòa Lộc đạt tiêu chuẩn xuất khẩu. Yêu cầu da sáng đẹp, trọng lượng 400g - 600g/trái, ngọt thơm tự nhiên.',
      so_luong_can: 4000,
      don_vi: 'kg',
      gia_tham_khao: 62000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Nam Cần Thơ, Q. Cái Răng, TP. Cần Thơ',
      dia_chi_giao: 'Kho Lạnh Trung Chuyển Cần Thơ, KCN Nam Cần Thơ, Q. Cái Răng, TP. Cần Thơ',
      latitude: 10.0012,
      longitude: 105.7845,
    },
    {
      ten_nong_san: 'Bưởi Da Xanh',
      mo_ta: 'Tuyển nguồn bưởi da xanh ruột hồng chín tới. Trái nặng từ 1.2kg trở lên, tép bưởi hồng giòn mọng nước.',
      so_luong_can: 6000,
      don_vi: 'kg',
      gia_tham_khao: 42000,
      yeu_cau_chung_nhan: 'Hữu cơ',
      tinh_thanh_giao: 'Phường Bùi Hữu Nghĩa, Q. Bình Thủy, TP. Cần Thơ',
      dia_chi_giao: 'Kho Thu Mua Nông Sản Bình Thủy, Q. Bình Thủy, TP. Cần Thơ',
      latitude: 10.0612,
      longitude: 105.7412,
    },
  ],

  // Doanh nghiệp 3 - Tiền Giang
  [
    {
      ten_nong_san: 'Thơm Queen',
      mo_ta: 'Thu mua thơm Queen số lượng lớn cho nhà máy chế biến dứa ép. Yêu cầu thơm chín vừa, trái từ 0.9kg trở lên.',
      so_luong_can: 10000,
      don_vi: 'kg',
      gia_tham_khao: 14000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Mỹ Tho, Xã Trung An, TP. Mỹ Tho, Tỉnh Tiền Giang',
      dia_chi_giao: 'Kho Đóng Gói Xuất Khẩu Mỹ Tho, KCN Mỹ Tho, Tiền Giang',
      latitude: 10.3625,
      longitude: 106.3312,
    },
    {
      ten_nong_san: 'Vú Sữa Lò Rèn',
      mo_ta: 'Thu mua vú sữa Lò Rèn chín tới tại vườn Tiền Giang / Cần Thơ. Đóng hộp quà tặng cao cấp.',
      so_luong_can: 2500,
      don_vi: 'kg',
      gia_tham_khao: 48000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Xã Tân Hương, Huyện Châu Thành, Tỉnh Tiền Giang',
      dia_chi_giao: 'Kho Thu Gom Trái Cây Châu Thành, Huyện Châu Thành, Tiền Giang',
      latitude: 10.4212,
      longitude: 106.3745,
    },
  ],

  // Doanh nghiệp 4 - Lâm Đồng
  [
    {
      ten_nong_san: 'Dâu Tây Đà Lạt',
      mo_ta: 'Cần mua dâu tây giống Nhật / Mỹ sạch hái tại vườn Đà Lạt. Giao hàng ngay trong ngày về kho lạnh.',
      so_luong_can: 1500,
      don_vi: 'kg',
      gia_tham_khao: 125000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng',
      dia_chi_giao: 'Kho Lạnh Bảo Quản Rau Củ Đà Lạt, Phường 11, TP. Đà Lạt, Lâm Đồng',
      latitude: 11.9412,
      longitude: 108.4812,
    },
    {
      ten_nong_san: 'Cà Chua Beef',
      mo_ta: 'Thu mua cà chua Beef Lâm Đồng trái to mọng đỏ. Đạt chuẩn an toàn thực phẩm đóng khay siêu thị.',
      so_luong_can: 5000,
      don_vi: 'kg',
      gia_tham_khao: 25000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Phú Hội, Huyện Đức Trọng, Tỉnh Lâm Đồng',
      dia_chi_giao: 'Kho Trung Chuyển Đức Trọng, KCN Phú Hội, Huyện Đức Trọng, Lâm Đồng',
      latitude: 11.7212,
      longitude: 108.3612,
    },
  ],

  // Doanh nghiệp 5 - Bình Dương
  [
    {
      ten_nong_san: 'Thanh Long Ruột Đỏ',
      mo_ta: 'Cần mua thanh long ruột đỏ đóng thùng xốp xuất khẩu sang Đông Nam Á. Yêu cầu tai xanh da láng đẹp.',
      so_luong_can: 8000,
      don_vi: 'kg',
      gia_tham_khao: 24000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương',
      dia_chi_giao: 'Kho Logistics Nông Sản Dĩ An, KCN Sóng Thần 2, Dĩ An, Bình Dương',
      latitude: 10.9012,
      longitude: 106.7412,
    },
    {
      ten_nong_san: 'Chôm Chôm Thái',
      mo_ta: 'Thu mua chôm chôm Thái tươi ngon giòn ráo. Cung cấp chuỗi cửa hàng hoa quả sạch Bình Dương & TP.HCM.',
      so_luong_can: 4500,
      don_vi: 'kg',
      gia_tham_khao: 36000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Phường An Phú, TP. Thuận An, Tỉnh Bình Dương',
      dia_chi_giao: 'Kho Lạnh Thu Mua Thuận An, P. An Phú, Thuận An, Bình Dương',
      latitude: 10.9412,
      longitude: 106.7125,
    },
  ],

  // Doanh nghiệp 6 - Đồng Nai
  [
    {
      ten_nong_san: 'Sầu Riêng Monthong',
      mo_ta: 'Cần hợp tác dài hạn với các nhà vườn sầu riêng Monthong Đồng Nai / Đắk Lắk. Thu mua giá tốt hỗ trợ vận chuyển.',
      so_luong_can: 6000,
      don_vi: 'kg',
      gia_tham_khao: 88000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'KCN Amata, P. Long Bình, TP. Biên Hòa, Tỉnh Đồng Nai',
      dia_chi_giao: 'Kho Tổng Miền Đông Biên Hòa, KCN Amata, TP. Biên Hòa, Đồng Nai',
      latitude: 10.9458,
      longitude: 106.8845,
    },
    {
      ten_nong_san: 'Bơ Sáp 034',
      mo_ta: 'Thu mua bơ sáp 034 ruột dẻo vàng béo ngậy. Yêu cầu trái không dập nát, hái già cây.',
      so_luong_can: 3500,
      don_vi: 'kg',
      gia_tham_khao: 38000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'P. Suối Tre, TP. Long Khánh, Tỉnh Đồng Nai',
      dia_chi_giao: 'Kho Thu Mua Trái Cây Long Khánh, P. Suối Tre, TP. Long Khánh, Đồng Nai',
      latitude: 10.9512,
      longitude: 107.2125,
    },
  ],

  // Doanh nghiệp 7 - Long An
  [
    {
      ten_nong_san: 'Cam Sành',
      mo_ta: 'Cần mua cam sành mọng nước số lượng lớn vắt nước phân phối các cơ sở đồ uống và đại lý miền Tây.',
      so_luong_can: 7000,
      don_vi: 'kg',
      gia_tham_khao: 20000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Thuận Đạo, Thị trấn Bến Lức, Tỉnh Long An',
      dia_chi_giao: 'Kho Đóng Gói Bến Lức, KCN Thuận Đạo, Thị trấn Bến Lức, Long An',
      latitude: 10.6312,
      longitude: 106.4912,
    },
    {
      ten_nong_san: 'Bưởi Năm Roi',
      mo_ta: 'Thu mua bưởi Năm Roi trái đều ruột ráo không hạt. Nhận bao tiêu toàn bộ sản lượng vườn đạt chuẩn.',
      so_luong_can: 5000,
      don_vi: 'kg',
      gia_tham_khao: 33000,
      yeu_cau_chung_nhan: 'Hữu cơ',
      tinh_thanh_giao: 'Phường 5, TP. Tân An, Tỉnh Long An',
      dia_chi_giao: 'Kho Nông Sản Tân An, Phường 5, TP. Tân An, Long An',
      latitude: 10.5345,
      longitude: 106.4125,
    },
  ],

  // Doanh nghiệp 8 - Hà Nội
  [
    {
      ten_nong_san: 'Vải Thiều Lục Ngạn',
      mo_ta: 'Thu mua vải thiều Lục Ngạn chín đỏ ngọt lịm. Đóng công lạnh đưa về chợ đầu mối Đền Lừ và chuỗi đại lý Hà Nội.',
      so_luong_can: 10000,
      don_vi: 'kg',
      gia_tham_khao: 32000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'Chợ Đầu Mối Đền Lừ, Q. Hoàng Mai, Hà Nội',
      dia_chi_giao: 'Kho Phân Phối Miền Bắc Hoàng Mai, Chợ Đầu Mối Đền Lừ, Q. Hoàng Mai, Hà Nội',
      latitude: 20.9845,
      longitude: 105.8612,
    },
    {
      ten_nong_san: 'Cam Cao Phong',
      mo_ta: 'Tuyển nguồn cam Cao Phong Hòa Bình chuẩn lòng vàng ngọt mọng. Giao hàng thường xuyên về kho Gia Lâm.',
      so_luong_can: 5000,
      don_vi: 'kg',
      gia_tham_khao: 30000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Xã Cổ Bi, Huyện Gia Lâm, Hà Nội',
      dia_chi_giao: 'Kho Lạnh Gia Lâm, Xã Cổ Bi, Huyện Gia Lâm, Hà Nội',
      latitude: 21.0212,
      longitude: 105.9412,
    },
  ],

  // Doanh nghiệp 9 - Đà Nẵng
  [
    {
      ten_nong_san: 'Sầu Riêng RI6',
      mo_ta: 'Thu mua sầu riêng RI6 cắt cơm già giao về trung tâm phân phối Đà Nẵng phục vụ khách du lịch và thị trường miền Trung.',
      so_luong_can: 4000,
      don_vi: 'kg',
      gia_tham_khao: 82000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng',
      dia_chi_giao: 'Kho Trung Chuyển Miền Trung Đà Nẵng, KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng',
      latitude: 16.0712,
      longitude: 108.1512,
    },
    {
      ten_nong_san: 'Bưởi Da Xanh',
      mo_ta: 'Thu mua bưởi da xanh ruột hồng Bến Tre / Tây Nguyên vận chuyển về Đà Nẵng.',
      so_luong_can: 3000,
      don_vi: 'kg',
      gia_tham_khao: 44000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Phường Hòa Thọ Tây, Q. Cẩm Lệ, Đà Nẵng',
      dia_chi_giao: 'Kho Thu Mua Cẩm Lệ, Phường Hòa Thọ Tây, Q. Cẩm Lệ, Đà Nẵng',
      latitude: 16.0212,
      longitude: 108.1912,
    },
  ],

  // Doanh nghiệp 10 - Hải Phòng
  [
    {
      ten_nong_san: 'Vải Thiều',
      mo_ta: 'Thu mua vải thiều Bắc Giang số lượng lớn đưa về cảng Hải Phòng đóng container lạnh xuất khẩu.',
      so_luong_can: 12000,
      don_vi: 'kg',
      gia_tham_khao: 34000,
      yeu_cau_chung_nhan: 'GlobalGAP',
      tinh_thanh_giao: 'KCN Đình Vũ, Q. Hải An, TP. Hải Phòng',
      dia_chi_giao: 'Kho Lạnh Xuất Nhập Khẩu Hải Phòng, KCN Đình Vũ, Q. Hải An, TP. Hải Phòng',
      latitude: 20.8412,
      longitude: 106.7512,
    },
    {
      ten_nong_san: 'Bưởi Đỏ Tân Lạc',
      mo_ta: 'Thu mua bưởi đỏ Tân Lạc Hòa Bình tiêu thụ thị trường Hải Phòng & Quảng Ninh.',
      so_luong_can: 4000,
      don_vi: 'kg',
      gia_tham_khao: 38000,
      yeu_cau_chung_nhan: 'VietGAP',
      tinh_thanh_giao: 'Xã Nam Sơn, Huyện An Dương, TP. Hải Phòng',
      dia_chi_giao: 'Kho Thu Mua Nông Sản An Dương, Xã Nam Sơn, Huyện An Dương, Hải Phòng',
      latitude: 20.8845,
      longitude: 106.6312,
    },
  ],
];

async function main() {
  console.log('🏬 Đang bắt đầu tạo nhu cầu thu mua cho các tài khoản Doanh Nghiệp...');

  // Lấy danh sách doanh nghiệp
  const businesses = await prisma.doanhNghiep.findMany({
    orderBy: { user_id: 'asc' },
  });

  if (businesses.length === 0) {
    console.log('❌ Không tìm thấy Doanh Nghiệp nào trong CSDL!');
    return;
  }

  // Lấy danh mục để gán
  const categories = await prisma.danhMuc.findMany();
  const defaultCategory = categories[0] ? categories[0].danhmuc_id : 1;

  let totalDemands = 0;

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const demandsList = businessDemandsData[i % businessDemandsData.length];

    for (const demandItem of demandsList) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30); // Thời hạn thu mua 30 ngày

      await prisma.nhuCauThuMua.create({
        data: {
          doanh_nghiep_id: business.user_id,
          danhmuc_id: defaultCategory,
          ten_nong_san: demandItem.ten_nong_san,
          mo_ta: demandItem.mo_ta,
          so_luong_can: demandItem.so_luong_can,
          don_vi: demandItem.don_vi,
          gia_tham_khao: demandItem.gia_tham_khao,
          cho_thuong_luong: true,
          yeu_cau_chung_nhan: demandItem.yeu_cau_chung_nhan,
          tinh_thanh_giao: demandItem.tinh_thanh_giao,
          dia_chi_giao: demandItem.dia_chi_giao,
          latitude: demandItem.latitude,
          longitude: demandItem.longitude,
          ngay_bat_dau: new Date(),
          ngay_ket_thuc: nextMonth,
          trang_thai: 'dang_thu_mua',
        },
      });

      totalDemands++;
    }
  }

  console.log(`✅ Hoàn tất! Đã tạo thành công ${totalDemands} nhu cầu thu mua nông sản cho các Doanh Nghiệp.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi tạo nhu cầu thu mua:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
