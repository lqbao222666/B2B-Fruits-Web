import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đánh dấu module này là global, có thể được sử dụng ở bất kỳ đâu mà không cần import lại
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Cho phép các module khác có thể inject PrismaService
})
export class PrismaModule {}
