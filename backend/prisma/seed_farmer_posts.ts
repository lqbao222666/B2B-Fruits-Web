import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mẫu bài đăng nông sản chuẩn thực tế thị trường hôm nay cho từng Nông Dân
const farmerPostsData = [
  // Nông dân 1 - Tiền Giang
  [
    {
      tieu_de: 'Thơm / Dứa Queen Tân Phước Tiền Giang Giòn Ngọt Mọng Nước',
      ten_nong_san: 'Thơm Queen Tân Phước',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Thạnh Tân, Huyện Tân Phước, Tỉnh Tiền Giang',
      dia_chi_lay_hang: 'Vườn Thơm Tân Phước, Xã Thạnh Tân, Huyện Tân Phước, Tiền Giang',
      latitude: 10.5183,
      longitude: 106.3125,
      gia_per_kg: 15000,
      mo_ta: 'Thơm Queen chính gốc Tân Phước Tiền Giang. Trái mắt to, vỏ mỏng, mắt nông, thịt vàng giòn và ngọt lịm. Đạt tiêu chuẩn VietGAP, không sử dụng thuốc bảo quản. Phù hợp bán lẻ siêu thị và ép nước.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái > 1.2kg, ngọt lịm)', gia: 18000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái 0.8 - 1.1kg)', gia: 12000, so_luong: 3000 },
      ],
    },
    {
      tieu_de: 'Xoài Cát Hòa Lộc Cái Bè Tiền Giang Chuẩn VietGAP Xuất Khẩu',
      ten_nong_san: 'Xoài Cát Hòa Lộc',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Hòa Hưng, Huyện Cái Bè, Tỉnh Tiền Giang',
      dia_chi_lay_hang: 'Vườn Xoài Cát Hòa Lộc, Xã Hòa Hưng, Huyện Cái Bè, Tiền Giang',
      latitude: 10.4022,
      longitude: 105.9785,
      gia_per_kg: 65000,
      mo_ta: 'Xoài Cát Hòa Lộc Cái Bè thượng hạng. Thịt xoài mịn, ít xơ, hương thơm nồng nàn quyến rũ. Thu hoạch đúng độ chín cây, trái đều đẹp da vàng óng.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 450g - 600g, da láng đẹp)', gia: 75000, so_luong: 1500 },
        { ten_phan_loai: 'Loại 2 (Trái 350g - 440g)', gia: 55000, so_luong: 2500 },
      ],
    },
  ],

  // Nông dân 2 - Bến Tre
  [
    {
      tieu_de: 'Bưởi Da Xanh Chợ Lách Bến Tre Ruột Hồng Mọng Nước',
      ten_nong_san: 'Bưởi Da Xanh',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
      dia_chi_lay_hang: 'Vườn Bưởi Da Xanh Chợ Lách, Xã Sơn Định, Bến Tre',
      latitude: 10.2458,
      longitude: 106.1324,
      gia_per_kg: 45000,
      mo_ta: 'Bưởi Da Xanh ruột hồng Chợ Lách nổi tiếng. Vỏ mỏng màu xanh tươi, tép bưởi dính chặt bó tép đỏ hồng, nước nhiều ngọt đậm không chua cay.',
      so_luong_toi_thieu: 40,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 1.4kg - 2.0kg, da xanh đẹp)', gia: 52000, so_luong: 1200 },
        { ten_phan_loai: 'Loại 2 (Trái 1.0kg - 1.3kg)', gia: 38000, so_luong: 1800 },
      ],
    },
    {
      tieu_de: 'Chôm Chôm Nhãn Tân Phú Bến Tre Giòn Ngọt Tráo Hạt',
      ten_nong_san: 'Chôm Chôm Nhãn',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Tân Phú, Huyện Châu Thành, Tỉnh Bến Tre',
      dia_chi_lay_hang: 'Vườn Chôm Chôm Tân Phú, Xã Tân Phú, Châu Thành, Bến Tre',
      latitude: 10.3125,
      longitude: 106.2845,
      gia_per_kg: 35000,
      mo_ta: 'Chôm chôm nhãn chín cây tại vườn Tân Phú Bến Tre. Trái nhỏ nhắn vỏ vàng đỏ, cơm dày khô ráo tráo hạt, vị ngọt nhãn đặc trưng.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to tráo hạt cơm dày)', gia: 42000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái vừa xô vườn)', gia: 28000, so_luong: 2500 },
      ],
    },
  ],

  // Nông dân 3 - Đắk Lắk
  [
    {
      tieu_de: 'Sầu Riêng RI6 Krông Pắc Đắk Lắk Cơm Vàng Hạt Lép Ngọt Bùi',
      ten_nong_san: 'Sầu Riêng RI6',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Ea Yông, Huyện Krông Pắc, Tỉnh Đắk Lắk',
      dia_chi_lay_hang: 'Vườn Sầu Riêng Krông Pắc, Xã Ea Yông, Krông Pắc, Đắk Lắk',
      latitude: 12.6845,
      longitude: 108.2458,
      gia_per_kg: 85000,
      mo_ta: 'Sầu riêng RI6 Đắk Lắk chính gốc Krông Pắc. Vỏ mỏng hộc đầy, cơm vàng đậm khô ráo, vị ngọt bùi béo ngậy nồng nàn. Hàng cắt già cây chuẩn.',
      so_luong_toi_thieu: 100,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 2.5kg - 4.5kg, 4-5 hộc lép)', gia: 98000, so_luong: 3000 },
        { ten_phan_loai: 'Loại 2 (Trái 1.8kg - 2.4kg)', gia: 72000, so_luong: 4000 },
      ],
    },
    {
      tieu_de: 'Bơ Sáp 034 Cư M\'gar Đắk Lắk Dẻo Béo Không Xơ',
      ten_nong_san: 'Bơ Sáp 034',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Quảng Tiến, Huyện Cư M\'gar, Tỉnh Đắk Lắk',
      dia_chi_lay_hang: 'Vườn Bơ Cư M\'gar, Xã Quảng Tiến, Cư M\'gar, Đắk Lắk',
      latitude: 12.8254,
      longitude: 108.1124,
      gia_per_kg: 40000,
      mo_ta: 'Bơ sáp 034 dáng dài đặc sản Cư M\'gar Đắk Lắk. Thịt dẻo quánh vàng ươm, hạt nhỏ vỏ mỏng, béo thơm đậm đà tự nhiên.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái dài 30-40cm, 3-4 trái/kg)', gia: 48000, so_luong: 1500 },
        { ten_phan_loai: 'Loại 2 (Trái 5-6 trái/kg)', gia: 32000, so_luong: 2000 },
      ],
    },
  ],

  // Nông dân 4 - Lâm Đồng
  [
    {
      tieu_de: 'Dâu Tây Giống Nhật Đà Lạt Tươi Sạch Hái Tại Vườn',
      ten_nong_san: 'Dâu Tây Đà Lạt',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Phường 7, TP. Đà Lạt, Tỉnh Lâm Đồng',
      dia_chi_lay_hang: 'Vườn Dâu Tây Đà Lạt, Phường 7, TP. Đà Lạt, Lâm Đồng',
      latitude: 11.9752,
      longitude: 108.4385,
      gia_per_kg: 130000,
      mo_ta: 'Dâu tây giống Nhật trồng công nghệ cao tại Đà Lạt. Trái đỏ mọng đều, ngọt đậm thơm ngát mùi dâu tự nhiên, hái giao ngay trong ngày.',
      so_luong_toi_thieu: 10,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to VIP 25-35 trái/kg)', gia: 155000, so_luong: 500 },
        { ten_phan_loai: 'Loại 2 (Trái vừa 40-50 trái/kg)', gia: 105000, so_luong: 800 },
      ],
    },
    {
      tieu_de: 'Cà Chua Beef Đà Lạt Trái To Mọng Nước Dày Thịt',
      ten_nong_san: 'Cà Chua Beef',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Hiệp An, Huyện Đức Trọng, Tỉnh Lâm Đồng',
      dia_chi_lay_hang: 'Vườn Cà Chua Hiệp An, Đức Trọng, Lâm Đồng',
      latitude: 11.7584,
      longitude: 108.3845,
      gia_per_kg: 28000,
      mo_ta: 'Cà chua Beef Đà Lạt trái to nặng tay, thịt nhiều đặc ruột, vị chua ngọt cân bằng. Thu hoạch khép kín chuẩn nông nghiệp sạch.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to >250g/trái)', gia: 34000, so_luong: 1500 },
        { ten_phan_loai: 'Loại 2 (Trái 150g-240g)', gia: 22000, so_luong: 2500 },
      ],
    },
  ],

  // Nông dân 5 - Cần Thơ
  [
    {
      tieu_de: 'Măng Cụt Phong Điền Cần Thơ Vỏ Mỏng Ngọt Thanh',
      ten_nong_san: 'Măng Cụt Phong Điền',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Nhơn Ai, Huyện Phong Điền, TP. Cần Thơ',
      dia_chi_lay_hang: 'Vườn Măng Cụt Nhơn Ai, Phong Điền, Cần Thơ',
      latitude: 10.0025,
      longitude: 105.6845,
      gia_per_kg: 60000,
      mo_ta: 'Măng cụt miệt vườn Phong Điền Cần Thơ. Trái chín cay tím sẫm, vỏ mỏng, múi trắng tinh không sượng, vị ngọt chua thanh mát.',
      so_luong_toi_thieu: 20,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to 8-10 trái/kg, da láng)', gia: 70000, so_luong: 1000 },
        { ten_phan_loai: 'Loại 2 (Trái vừa 11-14 trái/kg)', gia: 50000, so_luong: 1500 },
      ],
    },
    {
      tieu_de: 'Vú Sữa Lò Rèn Mỹ Khánh Cần Thơ Ngọt Béo Thơm Nức',
      ten_nong_san: 'Vú Sữa Lò Rèn',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Mỹ Khánh, Huyện Phong Điền, TP. Cần Thơ',
      dia_chi_lay_hang: 'Vườn Vú Sữa Mỹ Khánh, Phong Điền, Cần Thơ',
      latitude: 10.0185,
      longitude: 105.7125,
      gia_per_kg: 50000,
      mo_ta: 'Vú sữa Lò Rèn chín mọng vỏ bóng ánh hồng. Dòng sữa trắng đục thơm phức, vị ngọt dịu béo ngậy chuẩn chất lượng số 1 Cần Thơ.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 350g-500g, da căng bóng)', gia: 58000, so_luong: 1200 },
        { ten_phan_loai: 'Loại 2 (Trái 250g-340g)', gia: 42000, so_luong: 1800 },
      ],
    },
  ],

  // Nông dân 6 - Bình Thuận
  [
    {
      tieu_de: 'Thanh Long Ruột Đỏ Hàm Thuận Nam Xuất Khẩu Đỏ Tươi Ngọt',
      ten_nong_san: 'Thanh Long Ruột Đỏ',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Hàm Minh, Huyện Hàm Thuận Nam, Tỉnh Bình Thuận',
      dia_chi_lay_hang: 'Vườn Thanh Long Hàm Minh, Hàm Thuận Nam, Bình Thuận',
      latitude: 10.9125,
      longitude: 107.9854,
      gia_per_kg: 25000,
      mo_ta: 'Thanh long ruột đỏ tươi Hàm Thuận Nam. Trái tai xanh da đỏ bóng, ruột đỏ đậm mọng nước đậm vị ngọt. Đạt tiêu chuẩn xuất khẩu sang thị trường khó tính.',
      so_luong_toi_thieu: 100,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái >500g, tai xanh thẳng)', gia: 30000, so_luong: 5000 },
        { ten_phan_loai: 'Loại 2 (Trái 350g-490g)', gia: 20000, so_luong: 8000 },
      ],
    },
    {
      tieu_de: 'Thanh Long Ruột Trắng Hàm Mỹ Trái To Da Sáng',
      ten_nong_san: 'Thanh Long Ruột Trắng',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Hàm Mỹ, Huyện Hàm Thuận Nam, Tỉnh Bình Thuận',
      dia_chi_lay_hang: 'Vườn Thanh Long Hàm Mỹ, Hàm Thuận Nam, Bình Thuận',
      latitude: 10.9345,
      longitude: 108.0412,
      gia_per_kg: 18000,
      mo_ta: 'Thanh long ruột trắng truyền thống Bình Thuận. Trái to cứng cáp, vị ngọt thanh giải nhiệt cực tốt, thích hợp vận chuyển xa.',
      so_luong_toi_thieu: 100,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái >450g tai cứng đẹp)', gia: 22000, so_luong: 4000 },
        { ten_phan_loai: 'Loại 2 (Trái 300g-440g)', gia: 14000, so_luong: 6000 },
      ],
    },
  ],

  // Nông dân 7 - Đồng Nai
  [
    {
      tieu_de: 'Chôm Chôm Thái Long Khánh Đồng Nai Giòn Ráo Ngọt Lịm',
      ten_nong_san: 'Chôm Chôm Thái',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Phường Bàu Sen, TP. Long Khánh, Tỉnh Đồng Nai',
      dia_chi_lay_hang: 'Vườn Chôm Chôm Bàu Sen, Long Khánh, Đồng Nai',
      latitude: 10.9385,
      longitude: 107.2412,
      gia_per_kg: 38000,
      mo_ta: 'Chôm chôm Thái Long Khánh thủ phủ trái cây Đồng Nai. Trái to râu xanh da đỏ vàng, thịt giòn sần sật tráo hạt, ngọt lịm đậm đà.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to 20-25 trái/kg)', gia: 45000, so_luong: 2500 },
        { ten_phan_loai: 'Loại 2 (Trái vừa 26-32 trái/kg)', gia: 31000, so_luong: 3500 },
      ],
    },
    {
      tieu_de: 'Sầu Riêng Thái Monthong Cẩm Mỹ Đồng Nai Cơm Vàng Hạt Lép',
      ten_nong_san: 'Sầu Riêng Monthong',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Xuân Đường, Huyện Cẩm Mỹ, Tỉnh Đồng Nai',
      dia_chi_lay_hang: 'Vườn Sầu Riêng Xuân Đường, Cẩm Mỹ, Đồng Nai',
      latitude: 10.8412,
      longitude: 107.2845,
      gia_per_kg: 90000,
      mo_ta: 'Sầu riêng Monthong Thái Lan trồng tại Cẩm Mỹ Đồng Nai. Trái gai nhọn đều, cơm màu vàng nhạt dẻo mịn béo bùi ngọt lịm, hộc nào cũng đầy múi.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 3.0kg - 5.5kg hộc tròn)', gia: 105000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái 2.0kg - 2.9kg)', gia: 75000, so_luong: 3000 },
      ],
    },
  ],

  // Nông dân 8 - Vĩnh Long
  [
    {
      tieu_de: 'Cam Sành Trà Ôn Vĩnh Long Trái To Mọng Nước Ngọt Chua',
      ten_nong_san: 'Cam Sành Vĩnh Long',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Thới Hòa, Huyện Trà Ôn, Tỉnh Vĩnh Long',
      dia_chi_lay_hang: 'Vườn Cam Thới Hòa, Trà Ôn, Vĩnh Long',
      latitude: 10.0125,
      longitude: 105.9125,
      gia_per_kg: 22000,
      mo_ta: 'Cam sành Trà Ôn Vĩnh Long vỏ sần sùi ruột vàng cam mọng nước. Hàm lượng vitamin C cao, vắt nước vô cùng thơm ngọt mát bổ.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to 3-4 trái/kg)', gia: 26000, so_luong: 3000 },
        { ten_phan_loai: 'Loại 2 (Trái vừa 5-6 trái/kg)', gia: 18000, so_luong: 5000 },
      ],
    },
    {
      tieu_de: 'Bưởi Năm Roi Bình Minh Vĩnh Long Tép Dày Không Hạt',
      ten_nong_san: 'Bưởi Năm Roi',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Mỹ Hòa, Thị xã Bình Minh, Tỉnh Vĩnh Long',
      dia_chi_lay_hang: 'Vườn Bưởi Mỹ Hòa, Bình Minh, Vĩnh Long',
      latitude: 10.0385,
      longitude: 105.8125,
      gia_per_kg: 35000,
      mo_ta: 'Bưởi Năm Roi dã danh Bình Minh Vĩnh Long. Trái hình núm vú da vàng xanh, tép bưởi ráo nước không hạt, chua thanh ngọt hậu kéo dài.',
      so_luong_toi_thieu: 40,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 1.2kg - 1.8kg da đẹp)', gia: 42000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái 0.9kg - 1.1kg)', gia: 28000, so_luong: 3000 },
      ],
    },
  ],

  // Nông dân 9 - Hòa Bình
  [
    {
      tieu_de: 'Cam Cao Phong Hòa Bình Thơm Mọng Nước Chuẩn Tự Nhiên',
      ten_nong_san: 'Cam Cao Phong',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Thị trấn Cao Phong, Huyện Cao Phong, Tỉnh Hòa Bình',
      dia_chi_lay_hang: 'Vườn Cam Thị trấn Cao Phong, Hòa Bình',
      latitude: 20.7125,
      longitude: 105.3412,
      gia_per_kg: 32000,
      mo_ta: 'Cam lòng vàng Cao Phong Hòa Bình chính hiệu. Vỏ mỏng vàng rực, lòng cam ngọt lịm mọng nước thơm mát chuẩn hương vị núi rừng Tây Bắc.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to chọn lọc 4-5 trái/kg)', gia: 38000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái vừa 6-7 trái/kg)', gia: 26000, so_luong: 3000 },
      ],
    },
    {
      tieu_de: 'Bưởi Đỏ Tân Lạc Hòa Bình Tép Đỏ Hồng Ngọt Đậm',
      ten_nong_san: 'Bưởi Đỏ Tân Lạc',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Thanh Hối, Huyện Tân Lạc, Tỉnh Hòa Bình',
      dia_chi_lay_hang: 'Vườn Bưởi Thanh Hối, Tân Lạc, Hòa Bình',
      latitude: 20.6245,
      longitude: 105.2845,
      gia_per_kg: 40000,
      mo_ta: 'Bưởi đỏ Tân Lạc quả tròn đều vỏ mỏng da mịn. Ruột bưởi màu đào hồng mọng nước ngọt đậm đà không đắng thèm ăn hoài.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái >1.1kg đẹp dâng lễ)', gia: 48000, so_luong: 1500 },
        { ten_phan_loai: 'Loại 2 (Trái 0.8kg - 1.0kg)', gia: 32000, so_luong: 2500 },
      ],
    },
  ],

  // Nông dân 10 - Bắc Giang
  [
    {
      tieu_de: 'Vải Thiều Lục Ngạn Bắc Giang Ngọt Đậm Hạt Nhỏ Cơm Dày',
      ten_nong_san: 'Vải Thiều Lục Ngạn',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Hồng Giang, Huyện Lục Ngạn, Tỉnh Bắc Giang',
      dia_chi_lay_hang: 'Vườn Vải Hồng Giang, Lục Ngạn, Bắc Giang',
      latitude: 21.3412,
      longitude: 106.5845,
      gia_per_kg: 35000,
      mo_ta: 'Vải thiều chính vụ Lục Ngạn Bắc Giang nổi tiếng thế giới. Trái đỏ tươi gai nhẵn, vỏ mỏng hạt xíu xiu, cơm vải mọng nước ngọt sắc đậm đà.',
      so_luong_toi_thieu: 50,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái to chín đỏ chùm đẹp)', gia: 42000, so_luong: 3500 },
        { ten_phan_loai: 'Loại 2 (Trái vừa xô cành)', gia: 28000, so_luong: 4500 },
      ],
    },
    {
      tieu_de: 'Bưởi Diễn Lục Nam Bắc Giang Thơm Ngọt Mùi Hương Cổ Truyền',
      ten_nong_san: 'Bưởi Diễn Lục Nam',
      don_vi_tinh: 'kg',
      tinh_thanh: 'Xã Nghĩa Phương, Huyện Lục Nam, Tỉnh Bắc Giang',
      dia_chi_lay_hang: 'Vườn Bưởi Nghĩa Phương, Lục Nam, Bắc Giang',
      latitude: 21.2845,
      longitude: 106.4125,
      gia_per_kg: 30000,
      mo_ta: 'Bưởi Diễn trồng tại Lục Nam Bắc Giang cây cổ thụ >15 năm. Vỏ mỏng dính xuống ráo, tép bưởi tôm vàng ngọt sắc mùi thơm nức đặc trưng.',
      so_luong_toi_thieu: 30,
      phan_loai: [
        { ten_phan_loai: 'Loại 1 (Trái 0.9kg-1.2kg ngọt sắc)', gia: 36000, so_luong: 2000 },
        { ten_phan_loai: 'Loại 2 (Trái 0.6kg-0.8kg)', gia: 24000, so_luong: 3000 },
      ],
    },
  ],
];

async function main() {
  console.log('🌱 Đang tạo bài đăng sản phẩm cho các tài khoản Nông Dân...');

  // Lấy danh sách nông dân
  const farmers = await prisma.nongDan.findMany({
    orderBy: { user_id: 'asc' },
  });

  if (farmers.length === 0) {
    console.log('❌ Không tìm thấy Nông Dân nào trong CSDL!');
    return;
  }

  // Lấy danh mục để gán
  const categories = await prisma.danhMuc.findMany();
  const defaultCategory = categories[0] ? categories[0].danhmuc_id : 1;

  let totalPosts = 0;
  let totalPhanLoai = 0;

  for (let i = 0; i < farmers.length; i++) {
    const farmer = farmers[i];
    const postsList = farmerPostsData[i % farmerPostsData.length];

    for (const postItem of postsList) {
      // Tính tổng số lượng từ 2 loại
      const totalSoLuong = postItem.phan_loai.reduce((sum, pl) => sum + pl.so_luong, 0);

      // Tạo bài đăng BaiDang
      const createdPost = await prisma.baiDang.create({
        data: {
          nguoi_dang_id: farmer.user_id,
          danhmuc_id: defaultCategory,
          tieu_de: postItem.tieu_de,
          mo_ta: postItem.mo_ta,
          ten_nong_san: postItem.ten_nong_san,
          don_vi_tinh: postItem.don_vi_tinh,
          so_luong_co: totalSoLuong,
          so_luong_con_lai: totalSoLuong,
          so_luong_toi_thieu: postItem.so_luong_toi_thieu,
          gia_per_kg: postItem.gia_per_kg,
          tinh_thanh: postItem.tinh_thanh,
          dia_chi_lay_hang: postItem.dia_chi_lay_hang,
          latitude: postItem.latitude,
          longitude: postItem.longitude,
          images: [], // Ảnh để trống theo yêu cầu người dùng
          trang_thai: 'dang_ban', // Có thể bán ngay
          loai_cung_cap: 'lay_hang_ngay',
          ngay_thu_hoach: new Date(),
          han_su_dung: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Hạn sử dụng 14 ngày
          checked_at: new Date(),
        },
      });

      totalPosts++;

      // Tạo 2 phân loại sản phẩm: Loại 1 và Loại 2
      for (const pl of postItem.phan_loai) {
        await prisma.phanLoaiSanPham.create({
          data: {
            baidang_id: createdPost.baidang_id,
            ten_phan_loai: pl.ten_phan_loai,
            gia: pl.gia,
            so_luong_co: pl.so_luong,
            so_luong_con_lai: pl.so_luong,
          },
        });
        totalPhanLoai++;
      }
    }
  }

  console.log(`✅ Hoàn tất! Đã tạo thành công ${totalPosts} bài đăng sản phẩm với ${totalPhanLoai} phân loại sản phẩm (Loại 1 & Loại 2).`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi tạo bài đăng:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
