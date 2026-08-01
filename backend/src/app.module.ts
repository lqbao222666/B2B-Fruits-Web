import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from '../prisma/prisma.module';
import { DanhMucModule } from './danh-muc/danh-muc.module';
import { DoanhNghiepModule } from './doanh-nghiep/doanh-nghiep.module';
import { NongDanModule } from './nong-dan/nong-dan.module';
import { DonHangModule } from './don-hang/don-hang.module';
import { BaiDangModule } from './bai-dang/bai-dang.module';
import { ThongBaoModule } from './thong-bao/thong-bao.module';
import { ThanhToanModule } from './thanh-toan/thanh-toan.module';
import { DanhGiaModule } from './danh-gia/danh-gia.module';
import { TinNhanModule } from './tin-nhan/tin-nhan.module';
import { BaoCaoModule } from './bao-cao/bao-cao.module';
import { NhuCauModule } from './nhu-cau/nhu-cau.module';
import { AiModule } from './ai/ai.module';
import { DiaChiLuuModule } from './dia-chi-luu/dia-chi-luu.module';
import { GioHangModule } from './gio-hang/gio-hang.module';
import { TieuChuanModule } from './tieu-chuan/tieu-chuan.module';
import { ChungLoaiModule } from './chung-loai/chung-loai.module';
import { EmailModule } from './email/email.module';
import { TheoDoiModule } from './theo-doi/theo-doi.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // cho phép dùng ConfigService ở mọi nơi
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'), // Serve files from /public
      serveRoot: '/', // Base path will be /uploads if file is in /public/uploads
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DanhMucModule,
    DoanhNghiepModule,
    NongDanModule,
    BaiDangModule,
    ThongBaoModule,
    DonHangModule,
    ThanhToanModule,
    DanhGiaModule,
    TinNhanModule,
    BaoCaoModule,
    NhuCauModule,
    AiModule,
    DiaChiLuuModule,
    GioHangModule,
    TieuChuanModule,
    ChungLoaiModule,
    EmailModule,
    TheoDoiModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
