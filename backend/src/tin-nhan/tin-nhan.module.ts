import { Module } from '@nestjs/common';
import { TinNhanService } from './tin-nhan.service';
import { TinNhanController } from './tin-nhan.controller';
import { TinNhanRepository } from './tin-nhan.repository';

@Module({
  controllers: [TinNhanController],
  providers: [TinNhanService, TinNhanRepository],
  exports: [TinNhanService],
})
export class TinNhanModule {}
