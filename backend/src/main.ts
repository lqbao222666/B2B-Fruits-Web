import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Kích hoạt CORS để frontend có thể gọi API
  app.enableCors();
  
  // Đặt tiền tố cho tất cả API là /api/v1
  // app.setGlobalPrefix('api/v1');
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

// Model chưa test / cần test tiếp:

// NongDan (profile nông dân)
// DoanhNghiep (profile doanh nghiệp)
// DanhMuc (đã test)
// BaiDang (đã test)
// NhuCauThuMua (đã test)
// DonHang
// ThanhToan
// DanhGia
// TinNhan
// ThongBao
// BaoCao
// AiEvents & AiGoiY (nếu dùng AI)
