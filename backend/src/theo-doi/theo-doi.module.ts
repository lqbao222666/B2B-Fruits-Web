import { Module } from '@nestjs/common';
import { TheoDoiService } from './theo-doi.service';
import { TheoDoiController } from './theo-doi.controller';
import { PrismaModule } from '.././prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TheoDoiController],
  providers: [TheoDoiService],
  exports: [TheoDoiService],
})
export class TheoDoiModule {}
