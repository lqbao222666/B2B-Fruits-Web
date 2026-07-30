import { Module } from '@nestjs/common';
import { TieuChuanService } from './tieu-chuan.service';
import { TieuChuanController } from './tieu-chuan.controller';
import { TieuChuanRepository } from './tieu-chuan.repository';

@Module({
  controllers: [TieuChuanController],
  providers: [TieuChuanService, TieuChuanRepository],
  exports: [TieuChuanService, TieuChuanRepository],
})
export class TieuChuanModule {}
