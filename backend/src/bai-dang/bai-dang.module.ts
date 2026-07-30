import { Module } from '@nestjs/common';
import { BaiDangService } from './bai-dang.service';
import { BaiDangController } from './bai-dang.controller';
import { BaiDangRepository } from './bai-dang.repository';

@Module({
  controllers: [BaiDangController],
  providers: [BaiDangService, BaiDangRepository],
  exports: [BaiDangService],
})
export class BaiDangModule {}
