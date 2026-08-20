import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dữ liệu vị trí/kho đã lưu mẫu theo tỉnh/quận/huyện cho Nông dân (Vườn)
const farmerLocationsData = [
  // Nông dân 1 - Tiền Giang
  [
    {
      ten_goi: 'Vườn Thơm Tân Phước',
      dia_chi: 'Xã Thạnh Tân, Huyện Tân Phước, Tỉnh Tiền Giang',
      latitude: 10.5183,
      longitude: 106.3125,
    },
    {
      ten_goi: 'Vườn Xoài Cát Hòa Lộc',
      dia_chi: 'Xã Hòa Hưng, Huyện Cái Bè, Tỉnh Tiền Giang',
      latitude: 10.4022,
      longitude: 105.9785,
    },
  ],
  // Nông dân 2 - Bến Tre
  [
    {
      ten_goi: 'Vườn Bưởi Da Xanh Chợ Lách',
      dia_chi: 'Xã Sơn Định, Huyện Chợ Lách, Tỉnh Bến Tre',
      latitude: 10.2458,
      longitude: 106.1324,
    },
    {
      ten_goi: 'Vườn Chôm Chôm Tân Phú',
      dia_chi: 'Xã Tân Phú, Huyện Châu Thành, Tỉnh Bến Tre',
      latitude: 10.3125,
      longitude: 106.2845,
    },
  ],
  // Nông dân 3 - Đắk Lắk
  [
    {
      ten_goi: 'Vườn Sầu Riêng Krông Pắc',
      dia_chi: 'Xã Ea Yông, Huyện Krông Pắc, Tỉnh Đắk Lắk',
      latitude: 12.6845,
      longitude: 108.2458,
    },
    {
      ten_goi: 'Vườn Cà Phê & Bơ Cư M\'gar',
      dia_chi: 'Xã Quảng Tiến, Huyện Cư M\'gar, Tỉnh Đắk Lắk',
      latitude: 12.8254,
      longitude: 108.1124,
    },
  ],
  // Nông dân 4 - Lâm Đồng
  [
    {
      ten_goi: 'Vườn Dâu Tây Đà Lạt',
      dia_chi: 'Phường 7, TP. Đà Lạt, Tỉnh Lâm Đồng',
      latitude: 11.9752,
      longitude: 108.4385,
    },
    {
      ten_goi: 'Vườn Cà Chua & Dưa Leo Đức Trọng',
      dia_chi: 'Xã Hiệp An, Huyện Đức Trọng, Tỉnh Lâm Đồng',
      latitude: 11.7584,
      longitude: 108.3845,
    },
  ],
  // Nông dân 5 - Cần Thơ
  [
    {
      ten_goi: 'Vườn Măng Cụt Phong Điền',
      dia_chi: 'Xã Nhơn Ai, Huyện Phong Điền, TP. Cần Thơ',
      latitude: 10.0025,
      longitude: 105.6845,
    },
    {
      ten_goi: 'Vườn Vú Sữa Lò Rèn Mỹ Khánh',
      dia_chi: 'Xã Mỹ Khánh, Huyện Phong Điền, TP. Cần Thơ',
      latitude: 10.0185,
      longitude: 105.7125,
    },
  ],
  // Nông dân 6 - Bình Thuận
  [
    {
      ten_goi: 'Vườn Thanh Long Hàm Thuận Nam',
      dia_chi: 'Xã Hàm Minh, Huyện Hàm Thuận Nam, Tỉnh Bình Thuận',
      latitude: 10.9125,
      longitude: 107.9854,
    },
    {
      ten_goi: 'Vườn Thanh Long Ruột Đỏ Hàm Mỹ',
      dia_chi: 'Xã Hàm Mỹ, Huyện Hàm Thuận Nam, Tỉnh Bình Thuận',
      latitude: 10.9345,
      longitude: 108.0412,
    },
  ],
  // Nông dân 7 - Đồng Nai
  [
    {
      ten_goi: 'Vườn Chôm Chôm & Măng Cụt Long Khánh',
      dia_chi: 'Phường Bàu Sen, TP. Long Khánh, Tỉnh Đồng Nai',
      latitude: 10.9385,
      longitude: 107.2412,
    },
    {
      ten_goi: 'Vườn Sầu Riêng Cẩm Mỹ',
      dia_chi: 'Xã Xuân Đường, Huyện Cẩm Mỹ, Tỉnh Đồng Nai',
      latitude: 10.8412,
      longitude: 107.2845,
    },
  ],
  // Nông dân 8 - Vĩnh Long
  [
    {
      ten_goi: 'Vườn Cam Sành Trà Ôn',
      dia_chi: 'Xã Thới Hòa, Huyện Trà Ôn, Tỉnh Vĩnh Long',
      latitude: 10.0125,
      longitude: 105.9125,
    },
    {
      ten_goi: 'Vườn Bưởi Năm Roi Bình Minh',
      dia_chi: 'Xã Mỹ Hòa, Thị xã Bình Minh, Tỉnh Vĩnh Long',
      latitude: 10.0385,
      longitude: 105.8125,
    },
  ],
  // Nông dân 9 - Hòa Bình
  [
    {
      ten_goi: 'Vườn Cam Cao Phong',
      dia_chi: 'Thị trấn Cao Phong, Huyện Cao Phong, Tỉnh Hòa Bình',
      latitude: 20.7125,
      longitude: 105.3412,
    },
    {
      ten_goi: 'Vườn Bưởi Đỏ Tân Lạc',
      dia_chi: 'Xã Thanh Hối, Huyện Tân Lạc, Tỉnh Hòa Bình',
      latitude: 20.6245,
      longitude: 105.2845,
    },
  ],
  // Nông dân 10 - Bắc Giang
  [
    {
      ten_goi: 'Vườn Vải Thiều Lục Ngạn',
      dia_chi: 'Xã Hồng Giang, Huyện Lục Ngạn, Tỉnh Bắc Giang',
      latitude: 21.3412,
      longitude: 106.5845,
    },
    {
      ten_goi: 'Vườn Cam & Bưởi Lục Nam',
      dia_chi: 'Xã Nghĩa Phương, Huyện Lục Nam, Tỉnh Bắc Giang',
      latitude: 21.2845,
      longitude: 106.4125,
    },
  ],
];

// Dữ liệu kho đã lưu mẫu theo tỉnh/quận/huyện cho Doanh nghiệp (Kho)
const businessLocationsData = [
  // Doanh nghiệp 1 - TP. Hồ Chí Minh
  [
    {
      ten_goi: 'Kho Tổng Nông Sản Bình Tân',
      dia_chi: 'Đường Mã Lò, P. Bình Trị Đông A, Q. Bình Tân, TP.HCM',
      latitude: 10.7712,
      longitude: 106.6025,
    },
    {
      ten_goi: 'Kho Lạnh Thu Mua Hóc Môn',
      dia_chi: 'Xã Xuân Thới Sơn, Huyện Hóc Môn, TP.HCM',
      latitude: 10.8845,
      longitude: 106.5712,
    },
  ],
  // Doanh nghiệp 2 - Cần Thơ
  [
    {
      ten_goi: 'Kho Lạnh Trung Chuyển Cần Thơ',
      dia_chi: 'KCN Nam Cần Thơ, Q. Cái Răng, TP. Cần Thơ',
      latitude: 10.0012,
      longitude: 105.7845,
    },
    {
      ten_goi: 'Kho Thu Mua Nông Sản Bình Thủy',
      dia_chi: 'Phường Bùi Hữu Nghĩa, Q. Bình Thủy, TP. Cần Thơ',
      latitude: 10.0612,
      longitude: 105.7412,
    },
  ],
  // Doanh nghiệp 3 - Tiền Giang
  [
    {
      ten_goi: 'Kho Đóng Gói Xuất Khẩu Mỹ Tho',
      dia_chi: 'KCN Mỹ Tho, Xã Trung An, TP. Mỹ Tho, Tỉnh Tiền Giang',
      latitude: 10.3625,
      longitude: 106.3312,
    },
    {
      ten_goi: 'Kho Thu Gom Trái Cây Châu Thành',
      dia_chi: 'Xã Tân Hương, Huyện Châu Thành, Tỉnh Tiền Giang',
      latitude: 10.4212,
      longitude: 106.3745,
    },
  ],
  // Doanh nghiệp 4 - Lâm Đồng
  [
    {
      ten_goi: 'Kho Lạnh Bảo Quản Rau Củ Đà Lạt',
      dia_chi: 'Phường 11, TP. Đà Lạt, Tỉnh Lâm Đồng',
      latitude: 11.9412,
      longitude: 108.4812,
    },
    {
      ten_goi: 'Kho Trung Chuyển Đức Trọng',
      dia_chi: 'KCN Phú Hội, Huyện Đức Trọng, Tỉnh Lâm Đồng',
      latitude: 11.7212,
      longitude: 108.3612,
    },
  ],
  // Doanh nghiệp 5 - Bình Dương
  [
    {
      ten_goi: 'Kho Logistics Nông Sản Dĩ An',
      dia_chi: 'KCN Sóng Thần 2, TP. Dĩ An, Tỉnh Bình Dương',
      latitude: 10.9012,
      longitude: 106.7412,
    },
    {
      ten_goi: 'Kho Lạnh Thu Mua Thuận An',
      dia_chi: 'Phường An Phú, TP. Thuận An, Tỉnh Bình Dương',
      latitude: 10.9412,
      longitude: 106.7125,
    },
  ],
  // Doanh nghiệp 6 - Đồng Nai
  [
    {
      ten_goi: 'Kho Tổng Miền Đông Biên Hòa',
      dia_chi: 'KCN Amata, P. Long Bình, TP. Biên Hòa, Tỉnh Đồng Nai',
      latitude: 10.9458,
      longitude: 106.8845,
    },
    {
      ten_goi: 'Kho Thu Mua Trái Cây Long Khánh',
      dia_chi: 'P. Suối Tre, TP. Long Khánh, Tỉnh Đồng Nai',
      latitude: 10.9512,
      longitude: 107.2125,
    },
  ],
  // Doanh nghiệp 7 - Long An
  [
    {
      ten_goi: 'Kho Đóng Gói Bến Lức',
      dia_chi: 'KCN Thuận Đạo, Thị trấn Bến Lức, Tỉnh Long An',
      latitude: 10.6312,
      longitude: 106.4912,
    },
    {
      ten_goi: 'Kho Nông Sản Tân An',
      dia_chi: 'Phường 5, TP. Tân An, Tỉnh Long An',
      latitude: 10.5345,
      longitude: 106.4125,
    },
  ],
  // Doanh nghiệp 8 - Hà Nội
  [
    {
      ten_goi: 'Kho Phân Phối Miền Bắc Hoàng Mai',
      dia_chi: 'Chợ Đầu Mối Đền Lừ, Q. Hoàng Mai, Hà Nội',
      latitude: 20.9845,
      longitude: 105.8612,
    },
    {
      ten_goi: 'Kho Lạnh Gia Lâm',
      dia_chi: 'Xã Cổ Bi, Huyện Gia Lâm, Hà Nội',
      latitude: 21.0212,
      longitude: 105.9412,
    },
  ],
  // Doanh nghiệp 9 - Đà Nẵng
  [
    {
      ten_goi: 'Kho Trung Chuyển Miền Trung Đà Nẵng',
      dia_chi: 'KCN Hòa Khánh, Q. Liên Chiểu, Đà Nẵng',
      latitude: 16.0712,
      longitude: 108.1512,
    },
    {
      ten_goi: 'Kho Thu Mua Cẩm Lệ',
      dia_chi: 'Phường Hòa Thọ Tây, Q. Cẩm Lệ, Đà Nẵng',
      latitude: 16.0212,
      longitude: 108.1912,
    },
  ],
  // Doanh nghiệp 10 - Hải Phòng
  [
    {
      ten_goi: 'Kho Lạnh Xuất Nhập Khẩu Hải Phòng',
      dia_chi: 'KCN Đình Vũ, Q. Hải An, TP. Hải Phòng',
      latitude: 20.8412,
      longitude: 106.7512,
    },
    {
      ten_goi: 'Kho Thu Mua Nông Sản An Dương',
      dia_chi: 'Xã Nam Sơn, Huyện An Dương, TP. Hải Phòng',
      latitude: 20.8845,
      longitude: 106.6312,
    },
  ],
];

async function main() {
  console.log('🌱 Đang bắt đầu tạo dữ liệu kho/vị trí đã lưu...');

  // Lấy danh sách Nông Dân
  const farmers = await prisma.nongDan.findMany({
    orderBy: { user_id: 'asc' },
  });

  // Lấy danh sách Doanh Nghiệp
  const businesses = await prisma.doanhNghiep.findMany({
    orderBy: { user_id: 'asc' },
  });

  console.log(`Tìm thấy ${farmers.length} tài khoản Nông Dân và ${businesses.length} tài khoản Doanh Nghiệp.`);

  let farmerCount = 0;
  for (let i = 0; i < farmers.length; i++) {
    const f = farmers[i];
    const locs = farmerLocationsData[i % farmerLocationsData.length];

    for (const loc of locs) {
      // Kiểm tra trùng lặp theo ten_goi & user_id
      const existing = await prisma.diaChiLuu.findFirst({
        where: {
          user_id: f.user_id,
          ten_goi: loc.ten_goi,
        },
      });

      if (!existing) {
        await prisma.diaChiLuu.create({
          data: {
            user_id: f.user_id,
            ten_goi: loc.ten_goi,
            dia_chi: loc.dia_chi,
            latitude: loc.latitude,
            longitude: loc.longitude,
          },
        });
        farmerCount++;
      }
    }
  }
  console.log(`✅ Đã tạo thành công ${farmerCount} kho/vị trí cho Nông Dân.`);

  let businessCount = 0;
  for (let i = 0; i < businesses.length; i++) {
    const b = businesses[i];
    const locs = businessLocationsData[i % businessLocationsData.length];

    for (const loc of locs) {
      const existing = await prisma.diaChiLuu.findFirst({
        where: {
          user_id: b.user_id,
          ten_goi: loc.ten_goi,
        },
      });

      if (!existing) {
        await prisma.diaChiLuu.create({
          data: {
            user_id: b.user_id,
            ten_goi: loc.ten_goi,
            dia_chi: loc.dia_chi,
            latitude: loc.latitude,
            longitude: loc.longitude,
          },
        });
        businessCount++;
      }
    }
  }
  console.log(`✅ Đã tạo thành công ${businessCount} kho/vị trí cho Doanh Nghiệp.`);

  console.log('🎉 Hoàn tất quá trình thêm dữ liệu kho & vị trí đã lưu!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed kho:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
