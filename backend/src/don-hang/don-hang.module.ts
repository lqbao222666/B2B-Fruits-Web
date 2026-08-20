import { Module } from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHangRepository } from './don-hang.repository';
import { DonHangCronService } from './don-hang.cron';

@Module({
  controllers: [DonHangController],
  providers: [DonHangService, DonHangRepository, DonHangCronService],
  exports: [DonHangService],
})
export class DonHangModule {}
