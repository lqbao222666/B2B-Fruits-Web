import { Module } from '@nestjs/common';
import { NhuCauService } from './nhu-cau.service';
import { NhuCauController } from './nhu-cau.controller';
import { NhuCauRepository } from './nhu-cau.repository';

@Module({
  controllers: [NhuCauController],
  providers: [NhuCauService, NhuCauRepository],
  exports: [NhuCauService],
})
export class NhuCauModule {}
