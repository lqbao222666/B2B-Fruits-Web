import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Danh sách các sản phẩm nông sản đa dạng vùng miền phủ kín toàn bộ Danh mục Trái cây
const comprehensiveFruitPosts = [
  // 1. Sầu riêng (Đắk Lắk, Tiền Giang, Lâm Đồng)
  {
    category_slug: 'sau-rieng',
    tieu_de: 'Sầu Riêng RI6 Cai Lậy Tiền Giang Cơm Vàng Dẻo Thơm Ngọt Bùi',
    ten_nong_san: 'Sầu Riêng RI6 Tiền Giang',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Tiền Giang',
    dia_chi_lay_hang: 'Vườn Sầu Riêng Ngũ Hiệp, Huyện Cai Lậy, Tỉnh Tiền Giang',
    latitude: 10.3541,
    longitude: 106.1245,
    gia_per_kg: 82000,
    mo_ta: 'Sầu riêng RI6 cù lao Ngũ Hiệp Cai Lậy. Cơm vàng hạt lép, béo ngậy nồng nàn. Hàng cắt già cây chuẩn VietGAP.',
    so_luong_toi_thieu: 50,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (2.5kg - 4.5kg, 4-5 hộc lép)', gia: 95000, so_luong: 2500 },
      { ten_phan_loai: 'Loại 2 (1.8kg - 2.4kg)', gia: 70000, so_luong: 3500 },
    ],
  },
  {
    category_slug: 'sau-rieng',
    tieu_de: 'Sầu Riêng Monthong Đạ Huoai Lâm Đồng Cơm Vàng Hạt Lép VIP',
    ten_nong_san: 'Sầu Riêng Monthong Lâm Đồng',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Lâm Đồng',
    dia_chi_lay_hang: 'Vườn Sầu Riêng Thị trấn Ma Đa Guôi, Huyện Đạ Huoai, Tỉnh Lâm Đồng',
    latitude: 11.3845,
    longitude: 107.5412,
    gia_per_kg: 88000,
    mo_ta: 'Sầu riêng Monthong Thái Lan trồng tại thủ phủ sầu riêng Đạ Huoai Lâm Đồng. Múi to dẻo mịn bùi ngậy không xơ.',
    so_luong_toi_thieu: 50,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái >3.0kg tròn hộc)', gia: 102000, so_luong: 2000 },
      { ten_phan_loai: 'Loại 2 (Trái 2.0kg - 2.9kg)', gia: 75000, so_luong: 3000 },
    ],
  },

  // 2. Xoài (Tiền Giang, Đồng Tháp, An Giang, Khánh Hòa)
  {
    category_slug: 'xoai',
    tieu_de: 'Xoài Cát Chu Cao Lãnh Đồng Tháp Ngọt Thanh Thơm Nức',
    ten_nong_san: 'Xoài Cát Chu Đồng Tháp',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Đồng Tháp',
    dia_chi_lay_hang: 'Vườn Xoài Cát Chu Xã Tịnh Thới, TP. Cao Lãnh, Tỉnh Đồng Tháp',
    latitude: 10.4212,
    longitude: 105.6412,
    gia_per_kg: 42000,
    mo_ta: 'Xoài Cát Chu chính gốc Cao Lãnh Đồng Tháp. Thịt xoài mềm mại ngọt thanh, da óng ả không chút tỳ vết.',
    so_luong_toi_thieu: 40,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái 350g-480g bao trái)', gia: 48000, so_luong: 2000 },
      { ten_phan_loai: 'Loại 2 (Trái 250g-340g)', gia: 35000, so_luong: 3000 },
    ],
  },
  {
    category_slug: 'xoai',
    tieu_de: 'Xoài Keo An Giang Giòn Ngọt Chấm Muối Ớt Tuyệt Hảo',
    ten_nong_san: 'Xoài Keo An Giang',
    don_vi_tinh: 'kg',
    tinh_thanh: 'An Giang',
    dia_chi_lay_hang: 'Vườn Xoài Keo Xã Khánh An, Huyện An Phú, Tỉnh An Giang',
    latitude: 10.8845,
    longitude: 105.1124,
    gia_per_kg: 22000,
    mo_ta: 'Xoài Keo da xanh cơm vàng ươm giòn ráo. Thích hợp ăn sống, làm gỏi xoài hoặc bán quán ăn vặt siêu hót.',
    so_luong_toi_thieu: 50,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to 3-4 trái/kg)', gia: 26000, so_luong: 4000 },
      { ten_phan_loai: 'Loại 2 (Trái vừa 5-6 trái/kg)', gia: 18000, so_luong: 6000 },
    ],
  },
  {
    category_slug: 'xoai',
    tieu_de: 'Xoài Úc Cam Ranh Khánh Hòa Da Hồng Ngọt Thanh Trái To',
    ten_nong_san: 'Xoài Úc Cam Ranh',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Khánh Hòa',
    dia_chi_lay_hang: 'Vườn Xoài Úc Phường Cam Đức, Huyện Cam Lâm, Tỉnh Khánh Hòa',
    latitude: 11.9854,
    longitude: 109.1645,
    gia_per_kg: 38000,
    mo_ta: 'Xoài Úc giống R2E2 trồng tại Cam Lâm Khánh Hòa. Trái to tròn da ửng hồng tím đẹp mắt, hương vị chua ngọt quyến rũ.',
    so_luong_toi_thieu: 40,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái VIP 700g - 1.2kg)', gia: 45000, so_luong: 1500 },
      { ten_phan_loai: 'Loại 2 (Trái 500g - 690g)', gia: 30000, so_luong: 2500 },
    ],
  },

  // 3. Mít (Tiền Giang, Đồng Nai, Hậu Giang)
  {
    category_slug: 'mit',
    tieu_de: 'Mít Thái Ruột Đỏ Lá Bầu Hậu Giang Múi Dày Ngọt Ngào',
    ten_nong_san: 'Mít Thái Ruột Đỏ Hậu Giang',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Hậu Giang',
    dia_chi_lay_hang: 'Vườn Mít Thái Xã Tân Bình, Huyện Phụng Hiệp, Tỉnh Hậu Giang',
    latitude: 9.8125,
    longitude: 105.6845,
    gia_per_kg: 45000,
    mo_ta: 'Mít ruột đỏ xơ đỏ lá bầu đặc sản Hậu Giang. Múi mít màu cam đỏ rực rỡ, thịt giòn ráo vị ngọt đậm sâu.',
    so_luong_toi_thieu: 30,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái >9kg tròn đều múi dày)', gia: 52000, so_luong: 2000 },
      { ten_phan_loai: 'Loại 2 (Trái 6kg - 8.9kg)', gia: 38000, so_luong: 3000 },
    ],
  },
  {
    category_slug: 'mit',
    tieu_de: 'Mít Siêu Sớm Định Quán Đồng Nai Múi Vàng Giòn Ngọt',
    ten_nong_san: 'Mít Thái Siêu Sớm Đồng Nai',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Đồng Nai',
    dia_chi_lay_hang: 'Vườn Mít Định Quán, Huyện Định Quán, Tỉnh Đồng Nai',
    latitude: 11.2125,
    longitude: 107.3412,
    gia_per_kg: 28000,
    mo_ta: 'Mít Thái siêu sớm cắt già cây tại Định Quán Đồng Nai. Múi vàng ươm cơm dày xơ ít, ngọt mát tự nhiên.',
    so_luong_toi_thieu: 50,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái >8kg đẹp)', gia: 33000, so_luong: 3000 },
      { ten_phan_loai: 'Loại 2 (Trái 5kg - 7.9kg)', gia: 22000, so_luong: 4000 },
    ],
  },

  // 4. Nhãn (Hưng Yên, Sơn La, Bến Tre)
  {
    category_slug: 'nhan',
    tieu_de: 'Nhãn Lồng Hưng Yên Chính Gốc Cơm Dày Hạt Nhỏ Ngọt Sắc',
    ten_nong_san: 'Nhãn Lồng Hưng Yên',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Hưng Yên',
    dia_chi_lay_hang: 'Vườn Nhãn Lồng Phường Hồng Nam, TP. Hưng Yên, Tỉnh Hưng Yên',
    latitude: 20.6412,
    longitude: 106.0512,
    gia_per_kg: 40000,
    mo_ta: 'Nhãn lồng tiến vua Hưng Yên vỏ vàng rộm. Mùi thơm ngào ngạt, cùi nhãn ráo nước lồng hai lớp ngọt đậm đà.',
    so_luong_toi_thieu: 30,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to chùm dày cơm)', gia: 48000, so_luong: 2000 },
      { ten_phan_loai: 'Loại 2 (Trái vừa xô cành)', gia: 32000, so_luong: 3000 },
    ],
  },
  {
    category_slug: 'nhan',
    tieu_de: 'Nhãn Sông Mã Sơn La Cơm Dày Mọng Nước Chuẩn VietGAP',
    ten_nong_san: 'Nhãn Xuồng Sông Mã Sơn La',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Sơn La',
    dia_chi_lay_hang: 'Vườn Nhãn Huyện Sông Mã, Tỉnh Sơn La',
    latitude: 21.0845,
    longitude: 103.7412,
    gia_per_kg: 35000,
    mo_ta: 'Nhãn Sông Mã Sơn La thu hoạch sạch vùng cao Tây Bắc. Trái to cùi ráo giòn sần sật ngọt lịm.',
    so_luong_toi_thieu: 40,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to chọn lọc VIP)', gia: 42000, so_luong: 2500 },
      { ten_phan_loai: 'Loại 2 (Trái vừa)', gia: 28000, so_luong: 3500 },
    ],
  },

  // 5. Mận (Sơn La, Hà Giang)
  {
    category_slug: 'man',
    tieu_de: 'Mận Hậu Mộc Châu Sơn La Quả To Giòn Ngọt Phủ Phấn Trắng',
    ten_nong_san: 'Mận Hậu Mộc Châu',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Sơn La',
    dia_chi_lay_hang: 'Thung Lũng Mận Nà Ka, Huyện Mộc Châu, Tỉnh Sơn La',
    latitude: 20.8412,
    longitude: 104.5412,
    gia_per_kg: 55000,
    mo_ta: 'Mận Hậu Mộc Châu hái rạng sáng còn nguyên lớp phấn trắng mỏng. Quả đỏ mọng giòn rụm chua ngọt đậm vị.',
    so_luong_toi_thieu: 20,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Mận VIP 20-25 quả/kg phủ phấn)', gia: 68000, so_luong: 1200 },
      { ten_phan_loai: 'Loại 2 (Mận vừa 30-40 quả/kg)', gia: 42000, so_luong: 2000 },
    ],
  },

  // 6. Dừa (Bến Tre, Trà Vinh)
  {
    category_slug: 'dua',
    tieu_de: 'Dừa Xiêm Xanh Bến Tre Nước Ngọt Mát Lạnh Giải Nhiệt',
    ten_nong_san: 'Dừa Xiêm Xanh Bến Tre',
    don_vi_tinh: 'trái',
    tinh_thanh: 'Bến Tre',
    dia_chi_lay_hang: 'Vườn Dừa Xiêm Xã Giồng Trôm, Huyện Giồng Trôm, Tỉnh Bến Tre',
    latitude: 10.2645,
    longitude: 106.4812,
    gia_per_kg: 15000,
    mo_ta: 'Dừa Xiêm xanh chuẩn Bến Tre vỏ mỏng gáo to. Nước dừa ngọt thanh tự nhiên bồi bổ sức khỏe tuyệt vời.',
    so_luong_toi_thieu: 100,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to >1.3kg nước ngọt lịm)', gia: 18000, so_luong: 5000 },
      { ten_phan_loai: 'Loại 2 (Trái vừa 1.0kg - 1.2kg)', gia: 12000, so_luong: 7000 },
    ],
  },
  {
    category_slug: 'dua',
    tieu_de: 'Dừa Sáp Cầu Kè Trà Vinh Đặc Sản Béo Ngậy Quý Hiếm',
    ten_nong_san: 'Dừa Sáp Cầu Kè Trà Vinh',
    don_vi_tinh: 'trái',
    tinh_thanh: 'Trà Vinh',
    dia_chi_lay_hang: 'Vườn Dừa Sáp Huyện Cầu Kè, Tỉnh Trà Vinh',
    latitude: 9.8845,
    longitude: 106.1412,
    gia_per_kg: 160000,
    mo_ta: 'Dừa Sáp Cầu Kè đặc sản độc nhất vô nhị. Cơm dừa dẻo quánh như sáp, nước sánh đặc vị béo ngậy thơm ngon lừng danh.',
    so_luong_toi_thieu: 10,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái sáp đặc quánh 1.2kg - 1.6kg)', gia: 190000, so_luong: 300 },
      { ten_phan_loai: 'Loại 2 (Trái sáp vừa 0.9kg - 1.1kg)', gia: 130000, so_luong: 500 },
    ],
  },

  // 7. Chuối (Đồng Nai, Hưng Yên)
  {
    category_slug: 'chuoi',
    tieu_de: 'Chuối Cấy Mô Xuất Khẩu Trảng Bom Đồng Nai Quải Đều Đẹp',
    ten_nong_san: 'Chuối Già Nam Mỹ Đồng Nai',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Đồng Nai',
    dia_chi_lay_hang: 'Vườn Chuối Trảng Bom, Huyện Trảng Bom, Tỉnh Đồng Nai',
    latitude: 10.9645,
    longitude: 107.0125,
    gia_per_kg: 12000,
    mo_ta: 'Chuối già Nam Mỹ trồng công nghệ mô tại Đồng Nai. Nải chuối to đều da xanh láng, thịt dẻo ngọt thơm.',
    so_luong_toi_thieu: 100,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Nải to 2.2kg - 3.0kg da đẹp)', gia: 15000, so_luong: 8000 },
      { ten_phan_loai: 'Loại 2 (Nải 1.5kg - 2.1kg)', gia: 9000, so_luong: 10000 },
    ],
  },

  // 8. Cà Phê (Đắk Lắk, Lâm Đồng, Gia Lai)
  {
    category_slug: 'ca-phe',
    tieu_de: 'Cà Phê Nhân Xô Robusta Buôn Ma Thuột Đắk Lắk Hạt Chín Đều',
    ten_nong_san: 'Cà Phê Robusta Đắk Lắk',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Đắk Lắk',
    dia_chi_lay_hang: 'Nông Trường Cà Phê TP. Buôn Ma Thuột, Tỉnh Đắk Lắk',
    latitude: 12.6645,
    longitude: 108.0385,
    gia_per_kg: 95000,
    mo_ta: 'Cà phê nhân xô Robusta Buôn Ma Thuột hái chín tỉ lệ >95%. Hạt to tròn mẩy rang xay đậm đà hương thơm nồng nàn.',
    so_luong_toi_thieu: 100,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Sàng 18 hạt to chọn lọc)', gia: 110000, so_luong: 5000 },
      { ten_phan_loai: 'Loại 2 (Sàng 16 hạt tiêu chuẩn)', gia: 85000, so_luong: 8000 },
    ],
  },
  {
    category_slug: 'ca-phe',
    tieu_de: 'Cà Phê Arabica Cầu Đất Đà Lạt Lâm Đồng Thơm Chua Thanh VIP',
    ten_nong_san: 'Cà Phê Arabica Đà Lạt',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Lâm Đồng',
    dia_chi_lay_hang: 'Đồn Điền Cà Phê Cầu Đất, Xã Xuân Trường, Đà Lạt, Lâm Đồng',
    latitude: 11.8845,
    longitude: 108.5412,
    gia_per_kg: 140000,
    mo_ta: 'Arabica Cầu Đất Đà Lạt độ cao 1600m. Hương thơm quyến rũ hoa trái tự nhiên, vị chua thanh ngọt hậu đắm say.',
    so_luong_toi_thieu: 30,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Hạt Arabica Sàng 18 Hái Chín 100%)', gia: 165000, so_luong: 2000 },
      { ten_phan_loai: 'Loại 2 (Hạt Arabica Sàng 16)', gia: 120000, so_luong: 3000 },
    ],
  },

  // 9. Dưa hấu (Long An, Quảng Ngãi)
  {
    category_slug: 'dua-hau',
    tieu_de: 'Dưa Hấu Hắc Long Vỏ Đen Ruột Đỏ Ngọt Lịm Long An',
    ten_nong_san: 'Dưa Hấu Hắc Long Long An',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Long An',
    dia_chi_lay_hang: 'Vườn Dưa Hấu Xã Bình Hiệp, Thị Xã Kiến Tường, Tỉnh Long An',
    latitude: 10.7845,
    longitude: 105.9412,
    gia_per_kg: 16000,
    mo_ta: 'Dưa hấu Hắc Long vỏ đen mỏng ruột đỏ rực. Cơm dưa cát mịn mọng nước ngọt sắc, thích hợp ăn tươi giải nhiệt.',
    so_luong_toi_thieu: 100,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái 3.5kg - 5.5kg ruột cát đỏ)', gia: 19000, so_luong: 6000 },
      { ten_phan_loai: 'Loại 2 (Trái 2.5kg - 3.4kg)', gia: 13000, so_luong: 8000 },
    ],
  },

  // 10. Ổi (Tiền Giang, Hà Nội)
  {
    category_slug: 'oi',
    tieu_de: 'Ổi Nữ Hoàng Giòn Ngọt Ruột Hồng Tiền Giang',
    ten_nong_san: 'Ổi Nữ Hoàng Tiền Giang',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Tiền Giang',
    dia_chi_lay_hang: 'Vườn Ổi Xã Chợ Gạo, Huyện Chợ Gạo, Tỉnh Tiền Giang',
    latitude: 10.3645,
    longitude: 106.4412,
    gia_per_kg: 18000,
    mo_ta: 'Ổi Nữ Hoàng trái to da bóng mịn. Thịt giòn rụm ruột hồng ngọt ngào ít hạt thơm mát.',
    so_luong_toi_thieu: 40,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to 3-4 trái/kg da láng)', gia: 22000, so_luong: 2500 },
      { ten_phan_loai: 'Loại 2 (Trái vừa 5-6 trái/kg)', gia: 14000, so_luong: 3500 },
    ],
  },

  // 11. Mãng cầu (Tây Ninh, Tiền Giang)
  {
    category_slug: 'mang-cau',
    tieu_de: 'Mãng Cầu Ta Núi Bà Tây Ninh Mắt To Thịt Dày Ngọt Thơm',
    ten_nong_san: 'Mãng Cầu Ta Tây Ninh',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Tây Ninh',
    dia_chi_lay_hang: 'Vườn Mãng Cầu Chân Núi Bà Đen, Tỉnh Tây Ninh',
    latitude: 11.3645,
    longitude: 106.1645,
    gia_per_kg: 50000,
    mo_ta: 'Mãng cầu ta (Na) Tây Ninh vỏ mỏng mắt nở to. Thịt nại dai dẻo vị ngọt thơm quyến rũ đặc trưng.',
    so_luong_toi_thieu: 30,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái VIP 400g - 600g mắt nở)', gia: 58000, so_luong: 1500 },
      { ten_phan_loai: 'Loại 2 (Trái 280g - 390g)', gia: 42000, so_luong: 2500 },
    ],
  },

  // 12. Quýt (Đồng Tháp, Bắc Kạn)
  {
    category_slug: 'quyt',
    tieu_de: 'Quýt Hồng Lai Vung Đồng Tháp Vỏ Vàng Mọng Nước Ngọt Chua',
    ten_nong_san: 'Quýt Hồng Lai Vung',
    don_vi_tinh: 'kg',
    tinh_thanh: 'Đồng Tháp',
    dia_chi_lay_hang: 'Vườn Quýt Hồng Xã Long Hậu, Huyện Lai Vung, Tỉnh Đồng Tháp',
    latitude: 10.2845,
    longitude: 105.6845,
    gia_per_kg: 48000,
    mo_ta: 'Quýt Hồng dã danh Lai Vung Đồng Tháp. Vỏ mỏng màu cam hồng rực rỡ, múi mọng nước vị ngọt thanh chua dịu tuyệt vời.',
    so_luong_toi_thieu: 30,
    phan_loai: [
      { ten_phan_loai: 'Loại 1 (Trái to da bóng 4-6 trái/kg)', gia: 56000, so_luong: 1800 },
      { ten_phan_loai: 'Loại 2 (Trái vừa 7-9 trái/kg)', gia: 40000, so_luong: 2800 },
    ],
  },
];

async function main() {
  console.log('🍇 Đang thêm bài đăng và tạo vườn mới phủ kín tất cả trái cây các tỉnh thành...');

  // Lấy toàn bộ danh mục & nông dân
  const categories = await prisma.danhMuc.findMany();
  const farmers = await prisma.nongDan.findMany({ orderBy: { user_id: 'asc' } });

  if (farmers.length === 0) {
    console.log('❌ Không tìm thấy Nông Dân nào!');
    return;
  }

  let postsAdded = 0;
  let phanLoaiAdded = 0;
  let locationsAdded = 0;

  for (let i = 0; i < comprehensiveFruitPosts.length; i++) {
    const postData = comprehensiveFruitPosts[i];
    // Phân bổ luân phiên cho các Nông Dân 1 -> 17
    const farmer = farmers[i % farmers.length];

    // Tìm danh mục khớp theo slug hoặc tên
    const matchedCategory = categories.find(
      (c) => c.slug === postData.category_slug || c.ten_danh_muc.toLowerCase().includes(postData.category_slug)
    ) || categories[0];

    // 1. Tạo vườn mới (DiaChiLuu) cho Nông Dân nếu chưa có
    const existingLoc = await prisma.diaChiLuu.findFirst({
      where: { user_id: farmer.user_id, dia_chi: postData.dia_chi_lay_hang },
    });

    if (!existingLoc) {
      await prisma.diaChiLuu.create({
        data: {
          user_id: farmer.user_id,
          ten_goi: `Vườn ${postData.ten_nong_san}`,
          dia_chi: postData.dia_chi_lay_hang,
          latitude: postData.latitude,
          longitude: postData.longitude,
        },
      });
      locationsAdded++;
    }

    // 2. Tạo bài đăng BaiDang
    const totalSoLuong = postData.phan_loai.reduce((sum, pl) => sum + pl.so_luong, 0);

    const createdPost = await prisma.baiDang.create({
      data: {
        nguoi_dang_id: farmer.user_id,
        danhmuc_id: matchedCategory.danhmuc_id,
        tieu_de: postData.tieu_de,
        mo_ta: postData.mo_ta,
        ten_nong_san: postData.ten_nong_san,
        don_vi_tinh: postData.don_vi_tinh,
        so_luong_co: totalSoLuong,
        so_luong_con_lai: totalSoLuong,
        so_luong_toi_thieu: postData.so_luong_toi_thieu,
        gia_per_kg: postData.gia_per_kg,
        tinh_thanh: postData.tinh_thanh,
        dia_chi_lay_hang: postData.dia_chi_lay_hang,
        latitude: postData.latitude,
        longitude: postData.longitude,
        images: [],
        trang_thai: 'dang_ban',
        loai_cung_cap: 'lay_hang_ngay',
        ngay_thu_hoach: new Date(),
        han_su_dung: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        checked_at: new Date(),
      },
    });

    postsAdded++;

    // 3. Tạo 2 phân loại sản phẩm (Loại 1 & Loại 2)
    for (const pl of postData.phan_loai) {
      await prisma.phanLoaiSanPham.create({
        data: {
          baidang_id: createdPost.baidang_id,
          ten_phan_loai: pl.ten_phan_loai,
          gia: pl.gia,
          so_luong_co: pl.so_luong,
          so_luong_con_lai: pl.so_luong,
        },
      });
      phanLoaiAdded++;
    }
  }

  console.log(`✅ Đã tạo thành công ${postsAdded} bài đăng mới với ${phanLoaiAdded} phân loại sản phẩm.`);
  console.log(`✅ Đã tạo thêm ${locationsAdded} vườn/kho mới chuẩn theo khu vực địa lý.`);
  console.log('🎉 Hoàn tất phủ kín toàn bộ các loại trái cây & đa dạng các tỉnh thành!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
