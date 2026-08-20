import { Module } from '@nestjs/common';
import { ChungLoaiService } from './chung-loai.service';
import { ChungLoaiController } from './chung-loai.controller';
import { ChungLoaiRepository } from './chung-loai.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChungLoaiController],
  providers: [ChungLoaiService, ChungLoaiRepository, PrismaService],
  exports: [ChungLoaiService],
})
export class ChungLoaiModule {}
