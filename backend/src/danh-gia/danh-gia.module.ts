import { Module } from '@nestjs/common';
import { DanhGiaController } from './danh-gia.controller';
import { DanhGiaService } from './danh-gia.service';
import { DanhGiaRepository } from './danh-gia.repository';

@Module({
  controllers: [DanhGiaController],
  providers: [DanhGiaService, DanhGiaRepository],
  exports: [DanhGiaService],
})
export class DanhGiaModule {}
