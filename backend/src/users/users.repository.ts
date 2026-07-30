import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListUserDto } from './dto/list-user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersRepository {
  constructor(private prismaService: PrismaService) {}

  async create(
    registerDto: RegisterDto & { password_hash: string },
  ): Promise<UserResponseDto> {
    const user = await this.prismaService.users.create({
      data: {
        email: registerDto.email,
        password_hash: registerDto.password_hash,
        full_name: registerDto.full_name,
        vaiTro: { connect: { ten_vai_tro: registerDto.role } },
        is_active: true,
      },
      include: { vaiTro: true },
    });
    const { vaiTro, ...result } = user;
    (result as any).role = vaiTro.ten_vai_tro;
    return plainToInstance(UserResponseDto, result);
  }

  async updateActive(
    user_id: number,
    dto: UpdateActiveDto,
  ): Promise<UserResponseDto> {
    const user = await this.prismaService.users.update({
      where: { user_id },
      data: { is_active: dto.is_active },
    });
    return plainToInstance(UserResponseDto, user);
  }

  async updateRole(
    user_id: number,
    dto: UpdateRoleDto,
  ): Promise<UserResponseDto> {
    const user = await this.prismaService.users.update({
      where: { user_id },
      data: { vaiTro: { connect: { ten_vai_tro: dto.role } } },
      include: { vaiTro: true },
    });
    const { vaiTro, ...result } = user;
    (result as any).role = vaiTro.ten_vai_tro;
    return plainToInstance(UserResponseDto, result);
  }

  async getById(user_id: number) {
    const user = await this.prismaService.users.findUnique({
      where: { user_id },
      include: { vaiTro: true },
    });
    if (!user) return null;
    const { vaiTro, ...result } = user;
    (result as any).role = vaiTro.ten_vai_tro;
    return plainToInstance(UserResponseDto, result);
  }

  async getAll() {
    const users = await this.prismaService.users.findMany({
      where: { vaiTro: { ten_vai_tro: { not: 'admin' } } },
      include: { vaiTro: true },
    });
    return users.map((u) => {
      const { vaiTro, ...result } = u;
      (result as any).role = vaiTro.ten_vai_tro;
      return plainToInstance(UserResponseDto, result);
    });
  }

  async getAllUsers() {
    const users = await this.prismaService.users.findMany({
      include: { vaiTro: true },
    });
    return users.map((u) => {
      const { vaiTro, ...result } = u;
      (result as any).role = vaiTro.ten_vai_tro;
      return plainToInstance(UserResponseDto, result);
    });
  }

  async delete(user_id: number) {
    return this.prismaService.users.delete({ where: { user_id } });
  }

  async deleteMany(ids: number[]) {
    return this.prismaService.users.deleteMany({
      where: { user_id: { in: ids }, vaiTro: { ten_vai_tro: { not: 'admin' } } },
    });
  }
}
