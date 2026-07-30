import { Module } from '@nestjs/common';
import { DiaChiLuuService } from './dia-chi-luu.service';
import { DiaChiLuuController } from './dia-chi-luu.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiaChiLuuController],
  providers: [DiaChiLuuService],
})
export class DiaChiLuuModule {}
