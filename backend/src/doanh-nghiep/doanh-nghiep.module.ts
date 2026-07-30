import { Module } from '@nestjs/common';
import { DoanhNghiepService } from './doanh-nghiep.service';
import { DoanhNghiepController } from './doanh-nghiep.controller';
import { DoanhNghiepRepository } from './doanh-nghiep.repository';

@Module({
  controllers: [DoanhNghiepController],
  providers: [DoanhNghiepService, DoanhNghiepRepository],
  exports: [DoanhNghiepService],
})
export class DoanhNghiepModule {}
