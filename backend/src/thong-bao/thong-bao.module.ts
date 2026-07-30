import { Module } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { ThongBaoController } from './thong-bao.controller';
import { ThongBaoRepository } from './thong-bao.repository';

@Module({
  controllers: [ThongBaoController],
  providers: [ThongBaoService, ThongBaoRepository],
  exports: [ThongBaoService],
})
export class ThongBaoModule {}
