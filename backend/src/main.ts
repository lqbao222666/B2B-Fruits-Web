import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors();
  
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
