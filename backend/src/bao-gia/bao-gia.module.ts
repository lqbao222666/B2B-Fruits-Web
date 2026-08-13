import { Module } from '@nestjs/common';
import { BaoGiaService } from './bao-gia.service';
import { BaoGiaController } from './bao-gia.controller';
import { BaoGiaRepository } from './bao-gia.repository';

@Module({
  controllers: [BaoGiaController],
  providers: [BaoGiaService, BaoGiaRepository],
  exports: [BaoGiaService],
})
export class BaoGiaModule {}
