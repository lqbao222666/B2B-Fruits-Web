import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersHelper } from './users.helper';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersHelper, PrismaService],
  exports: [UsersService, UsersRepository, UsersHelper],
})
export class UsersModule {}
