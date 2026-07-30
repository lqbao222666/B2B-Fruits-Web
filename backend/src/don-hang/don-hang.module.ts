import { Module } from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHangRepository } from './don-hang.repository';

@Module({
  controllers: [DonHangController],
  providers: [DonHangService, DonHangRepository],
  exports: [DonHangService],
})
export class DonHangModule {}
