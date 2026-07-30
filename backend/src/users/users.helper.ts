import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class UsersHelper {
  constructor(private prismaService: PrismaService) {}

  async checkUserExists(user_id: number) {
    const user = await this.prismaService.users.findUnique({
      where: { user_id },
    });
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async checkActive(user_id: number) {
    const user = await this.checkUserExists(user_id);
    if (!user.is_active) throw new BadRequestException('Tài khoản đã bị khóa');
    return user;
  }

  async checkSelfOrAdmin(
    currentUserId: number,
    targetId: number,
    currentRole: string,
  ) {
    if (currentRole === 'admin' || currentUserId === targetId) return;
    throw new ForbiddenException(
      'Bạn không có quyền thao tác trên tài khoản này',
    );
  }
}
