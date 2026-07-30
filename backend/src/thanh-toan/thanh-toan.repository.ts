import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateThanhToanDto } from './dto/create-thanh-toan.dto';
import { UpdateThanhToanDto } from './dto/update-thanh-toan.dto';

@Injectable()
export class ThanhToanRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateThanhToanDto) {
    return this.prisma.thanhToan.create({ data });
  }

  async findAll() {
    return this.prisma.thanhToan.findMany({
      include: {
        donHang: {
          include: {
            nguoiMua: { include: { user: { select: { full_name: true } } } },
            nguoiBan: { include: { user: { select: { full_name: true } } } },
          },
        },
      },
    });
  }

  async findOne(thanhtoan_id: number) {
    const tt = await this.prisma.thanhToan.findUnique({
      where: { thanhtoan_id },
      include: {
        donHang: {
          include: {
            nguoiMua: { include: { user: { select: { full_name: true } } } },
            nguoiBan: { include: { user: { select: { full_name: true } } } },
          },
        },
      },
    });
    if (!tt) throw new NotFoundException('Giao dịch thanh toán không tồn tại');
    return tt;
  }

  async findByDonHang(donhang_id: number) {
    return this.prisma.thanhToan.findUnique({
      where: { donhang_id },
      include: {
        donHang: true,
      },
    });
  }

  async update(thanhtoan_id: number, data: UpdateThanhToanDto) {
    return this.prisma.thanhToan.update({
      where: { thanhtoan_id },
      data,
    });
  }

  async remove(thanhtoan_id: number) {
    return this.prisma.thanhToan.delete({
      where: { thanhtoan_id },
    });
  }
}
