import { Module } from '@nestjs/common';
import { ThuongLuongService } from './thuong-luong.service';
import { ThuongLuongController } from './thuong-luong.controller';
import { ThuongLuongRepository } from './thuong-luong.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { ThongBaoModule } from '../thong-bao/thong-bao.module';

@Module({
  imports: [PrismaModule, ThongBaoModule],
  controllers: [ThuongLuongController],
  providers: [ThuongLuongService, ThuongLuongRepository],
  exports: [ThuongLuongService],
})
export class ThuongLuongModule {}
