import { Module } from '@nestjs/common';
import { GioHangController } from './gio-hang.controller';
import { GioHangService } from './gio-hang.service';
import { PrismaModule } from '.././prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GioHangController],
  providers: [GioHangService],
  exports: [GioHangService],
})
export class GioHangModule {}
