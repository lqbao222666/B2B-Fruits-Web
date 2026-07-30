import { Module } from '@nestjs/common';
import { ThanhToanService } from './thanh-toan.service';
import { ThanhToanController } from './thanh-toan.controller';
import { ThanhToanRepository } from './thanh-toan.repository';

@Module({
  controllers: [ThanhToanController],
  providers: [ThanhToanService, ThanhToanRepository],
  exports: [ThanhToanService],
})
export class ThanhToanModule {}
