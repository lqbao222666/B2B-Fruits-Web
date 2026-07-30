import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersHelper } from './users.helper';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListUserDto } from './dto/list-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private usersHelper: UsersHelper,
  ) {}

  async create(registerDto: RegisterDto): Promise<UserResponseDto> {
    const existing =
      (await this.usersRepository['prismaService']?.users.findUnique?.({
        where: { email: registerDto.email },
      })) ||
      (await this.usersRepository['prismaService'].users.findUnique({
        // fallback
        where: { email: registerDto.email },
      }));

    if (existing) throw new BadRequestException('Email đã tồn tại');

    const hashPassword = await bcrypt.hash(registerDto.password, 10);
    return this.usersRepository.create({
      ...registerDto,
      password_hash: hashPassword,
    });
  }
  
  // === THÊM HÀM NÀY ĐỂ FIX LỖI ===
  async createGoogleUser(googleUser: any) {
    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
    
    let roleName = googleUser.requested_role || 'nong_dan';
    if (!['nong_dan', 'doanh_nghiep'].includes(roleName)) {
      roleName = 'nong_dan';
    }

    const user = await this.usersRepository['prismaService'].users.create({
      data: {
        email: googleUser.email,
        password_hash: hashedPassword,
        full_name: googleUser.full_name || 'Google User',
        vaiTro: { connect: { ten_vai_tro: roleName } },
        is_verified: true,
        is_active: true,
      },
      include: { vaiTro: true },
    });

    if (roleName === 'doanh_nghiep') {
      await this.usersRepository['prismaService'].doanhNghiep.create({
        data: {
          user_id: user.user_id,
          ten_cong_ty: user.full_name || 'Công ty (Chưa cập nhật)',
          tinh_thanh: 'Chưa cập nhật',
          so_dien_thoai: '',
        }
      });
    } else if (roleName === 'nong_dan') {
      await this.usersRepository['prismaService'].nongDan.create({
        data: {
          user_id: user.user_id,
          ho_ten: user.full_name || 'Google User',
          tinh_thanh: 'Chưa cập nhật',
        }
      });
    }

    return user;
  }

  async resetPassword(
    user_id: number,
    dto: ResetPasswordDto,
    currentUser: any,
  ) {
    await this.usersHelper.checkSelfOrAdmin(
      currentUser.id,
      user_id,
      currentUser.role,
    );

    const user = await this.usersHelper.checkUserExists(user_id);
    const isMatch = await bcrypt.compare(dto.old_password, user.password_hash);
    if (!isMatch) throw new BadRequestException('Mật khẩu cũ không đúng');

    if (dto.new_password !== dto.confirm_password)
      throw new BadRequestException('Mật khẩu mới không khớp');

    const newHash = await bcrypt.hash(dto.new_password, 10);
    await this.usersRepository['prismaService'].users.update({
      where: { user_id },
      data: { password_hash: newHash },
    });

    return { message: 'Đổi mật khẩu thành công' };
  }

  async updateActive(
    user_id: number,
    dto: UpdateActiveDto,
  ): Promise<UserResponseDto> {
    await this.usersHelper.checkUserExists(user_id);
    return this.usersRepository.updateActive(user_id, dto);
  }

  async updateRole(
    user_id: number,
    dto: UpdateRoleDto,
  ): Promise<UserResponseDto> {
    await this.usersHelper.checkUserExists(user_id);
    return this.usersRepository.updateRole(user_id, dto);
  }

  async getById(user_id: number, currentUser: any): Promise<UserResponseDto> {
    await this.usersHelper.checkSelfOrAdmin(
      currentUser.id,
      user_id,
      currentUser.role,
    );
    const user = await this.usersRepository.getById(user_id);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');
    return user;
  }

  async getAll(currentUser: any) {
    await this.usersHelper.checkUserExists(currentUser.id); // chỉ admin mới gọi
    return this.usersRepository.getAll();
  }

  // Method mới cho Admin xem tất cả
  async getAllUsers(currentUser: any) {
    await this.usersHelper.checkUserExists(currentUser.id);
    const users = await this.usersRepository.getAllUsers(); // gọi repo mới
    return users;
  }

  async delete(user_id: number, currentUser: any) {
    await this.usersHelper.checkSelfOrAdmin(
      currentUser.id,
      user_id,
      currentUser.role,
    );
    return this.usersRepository.delete(user_id);
  }

  async deleteMany(dto: ListUserDto) {
    return this.usersRepository.deleteMany(dto.ids);
  }

  async updateAvatar(id: number, dto: UpdateAvatarDto, currentUser: any) {
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new UnauthorizedException('Không có quyền thay đổi ảnh đại diện');
    }

    return this.usersRepository['prismaService'].users.update({
      where: { user_id: id },
      data: { avatar_url: dto.avatar_url },
      select: { user_id: true, email: true, avatar_url: true, full_name: true }
    });
  }

  async updateProfile(id: number, dto: any, currentUser: any) {
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new UnauthorizedException('Không có quyền thay đổi thông tin');
    }
    
    // update basic info
    return this.usersRepository['prismaService'].users.update({
      where: { user_id: id },
      data: {
        full_name: dto.full_name !== undefined ? dto.full_name : undefined,
        phone: dto.phone !== undefined ? dto.phone : undefined,
        ngay_sinh: dto.ngay_sinh ? new Date(dto.ngay_sinh) : null,
        gioi_tinh: dto.gioi_tinh !== undefined ? dto.gioi_tinh : undefined,
      },
      select: { user_id: true, full_name: true, phone: true, ngay_sinh: true, gioi_tinh: true }
    });
  }

  async getFeaturedSuppliers() {
    const suppliers = await this.usersRepository['prismaService'].users.findMany({
      where: {
        vaiTro: {
          ten_vai_tro: { in: ['nong_dan', 'doanh_nghiep'] }
        },
        nongDan: {
          baiDangs: {
            some: { trang_thai: 'dang_ban' }
          }
        }
      },
      take: 6,
      select: {
        user_id: true,
        full_name: true,
        avatar_url: true,
        nongDan: {
          select: {
            baiDangs: {
              where: { trang_thai: 'dang_ban' },
              take: 3,
              orderBy: { created_at: 'desc' },
              select: {
                ten_nong_san: true,
                images: true,
                tieuChuans: {
                  select: { ten_tieu_chuan: true, icon_url: true }
                }
              }
            }
          }
        }
      }
    });

    return suppliers.map(user => {
      const baiDangs = user.nongDan?.baiDangs || [];
      const certificatesMap = new Map();
      baiDangs.forEach(post => {
        post.tieuChuans.forEach(tc => {
          certificatesMap.set(tc.ten_tieu_chuan, tc);
        });
      });
      return {
        id: user.user_id,
        name: user.full_name,
        avatar: user.avatar_url,
        recentProducts: baiDangs.map(p => ({
          name: p.ten_nong_san,
          image: p.images && Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null
        })),
        certificates: Array.from(certificatesMap.values())
      };
    });
  }
}
