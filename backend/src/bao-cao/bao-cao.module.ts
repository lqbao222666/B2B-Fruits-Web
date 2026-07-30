import { Module } from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoController } from './bao-cao.controller';
import { BaoCaoRepository } from './bao-cao.repository';

@Module({
  controllers: [BaoCaoController],
  providers: [BaoCaoService, BaoCaoRepository],
  exports: [BaoCaoService],
})
export class BaoCaoModule {}
