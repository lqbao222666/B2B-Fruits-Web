import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class GioHangService {
  constructor(private prisma: PrismaService) {}

  async getCart(user_id: number) {
    return this.prisma.gioHang.findMany({
      where: { user_id },
      include: {
        baiDang: {
          select: {
            tieu_de: true,
            don_vi_tinh: true,
            images: true,
            tinh_thanh: true,
          },
        },
        phanLoai: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async addToCart(user_id: number, dto: AddToCartDto) {
    // Kiểm tra xem phân loại có tồn tại không
    const phanLoai = await this.prisma.phanLoaiSanPham.findUnique({
      where: { phanloai_id: dto.phanloai_id },
    });

    if (!phanLoai) {
      throw new NotFoundException('Phân loại sản phẩm không tồn tại');
    }

    if (phanLoai.baidang_id !== dto.baidang_id) {
      throw new BadRequestException('Phân loại không thuộc về bài đăng này');
    }

    // Kiểm tra xem user có phải người đăng không, không được mua hàng của chính mình
    const baiDang = await this.prisma.baiDang.findUnique({
      where: { baidang_id: dto.baidang_id },
    });
    if (baiDang?.nguoi_dang_id === user_id) {
      throw new BadRequestException('Bạn không thể mua hàng của chính mình');
    }

    // Kiểm tra xem đã có trong giỏ chưa
    const existingItem = await this.prisma.gioHang.findFirst({
      where: {
        user_id,
        phanloai_id: dto.phanloai_id,
      },
    });

    if (existingItem) {
      const newSoLuong = Number(existingItem.so_luong) + dto.so_luong;
      if (newSoLuong > Number(phanLoai.so_luong_con_lai)) {
        throw new BadRequestException(
          `Số lượng vượt quá tồn kho (Còn lại: ${phanLoai.so_luong_con_lai})`,
        );
      }
      return this.prisma.gioHang.update({
        where: { id: existingItem.id },
        data: { so_luong: newSoLuong },
      });
    }

    if (dto.so_luong > Number(phanLoai.so_luong_con_lai)) {
      throw new BadRequestException(
        `Số lượng vượt quá tồn kho (Còn lại: ${phanLoai.so_luong_con_lai})`,
      );
    }

    return this.prisma.gioHang.create({
      data: {
        user_id,
        baidang_id: dto.baidang_id,
        phanloai_id: dto.phanloai_id,
        so_luong: dto.so_luong,
      },
    });
  }

  async updateQuantity(id: number, user_id: number, so_luong: number) {
    const item = await this.prisma.gioHang.findUnique({
      where: { id },
      include: { phanLoai: true },
    });

    if (!item || item.user_id !== user_id) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    if (so_luong > Number(item.phanLoai.so_luong_con_lai)) {
      throw new BadRequestException(
        `Số lượng vượt quá tồn kho (Còn lại: ${item.phanLoai.so_luong_con_lai})`,
      );
    }

    if (so_luong <= 0) {
      return this.prisma.gioHang.delete({ where: { id } });
    }

    return this.prisma.gioHang.update({
      where: { id },
      data: { so_luong },
    });
  }

  async removeItem(id: number, user_id: number) {
    const item = await this.prisma.gioHang.findUnique({ where: { id } });
    if (!item || item.user_id !== user_id) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }
    return this.prisma.gioHang.delete({ where: { id } });
  }

  async clearCart(user_id: number) {
    return this.prisma.gioHang.deleteMany({ where: { user_id } });
  }
}
