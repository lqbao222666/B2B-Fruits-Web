import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validate({ email, password }: { email: string; password: string }) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
      include: { vaiTro: true },
    });
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new BadRequestException('Mật khẩu không chính xác');

    const { password_hash, vaiTro, ...result } = user;
    (result as any).role = vaiTro.ten_vai_tro;
    return result;
  }

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(user: any) {
    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.vaiTro ? user.vaiTro.ten_vai_tro : user.role, // Fallback if already mapped
    };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.vaiTro ? user.vaiTro.ten_vai_tro : user.role,
      },
    };
  }

  async validateGoogleUser(googleUser: any) {
    let user = await this.prismaService.users.findUnique({
      where: { email: googleUser.email },
      include: { vaiTro: true },
    });

    if (!user) {
      user = await this.usersService.createGoogleUser(googleUser);
    }

    if (!user) throw new BadRequestException('User could not be created');

    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.vaiTro ? user.vaiTro.ten_vai_tro : (user as any).role,
    };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.vaiTro ? user.vaiTro.ten_vai_tro : (user as any).role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    // Tạo mã OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // Hết hạn sau 15 phút

    await this.prismaService.users.update({
      where: { email },
      data: {
        reset_password_otp: otp,
        reset_password_expires: expires,
      },
    });

    await this.emailService.sendOtpEmail(email, otp);

    return {
      message: 'Mã xác nhận OTP đã được gửi đến email của bạn',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.reset_password_otp ||
      user.reset_password_otp !== otp ||
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throw new BadRequestException('Mã OTP không chính xác hoặc đã hết hạn');
    }

    return {
      success: true,
      message: 'Mã OTP hợp lệ',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { email, otp, newPassword } = dto;

    await this.verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.prismaService.users.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        reset_password_otp: null,
        reset_password_expires: null,
      },
      include: {
        vaiTro: true,
      },
    });

    return {
      message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!',
      role: updatedUser.vaiTro?.ten_vai_tro || 'admin',
    };
  }
}
