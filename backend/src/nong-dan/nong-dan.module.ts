import { Module } from '@nestjs/common';
import { NongDanService } from './nong-dan.service';
import { NongDanController } from './nong-dan.controller';
import { NongDanRepository } from './nong-dan.repository';

@Module({
  controllers: [NongDanController],
  providers: [NongDanService, NongDanRepository],
  exports: [NongDanService],
})
export class NongDanModule {}
