import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNhuCauDto } from './dto/create-nhu-cau.dto';
import { UpdateNhuCauDto } from './dto/update-nhu-cau.dto';

@Injectable()
export class NhuCauRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNhuCauDto) {
    return this.prisma.nhuCauThuMua.create({
      data,
      include: {
        doanhNghiep: {
          include: { user: { select: { email: true, full_name: true } } },
        },
        danhMuc: true,
      },
    });
  }

  async findAll(filters?: { ten_nong_san?: string; tinh_thanh_giao?: string }) {
    return this.prisma.nhuCauThuMua.findMany({
      where: {
        trang_thai: 'dang_thu_mua',
        ...(filters?.ten_nong_san && {
          ten_nong_san: { contains: filters.ten_nong_san, mode: 'insensitive' },
        }),
        ...(filters?.tinh_thanh_giao && {
          tinh_thanh_giao: filters.tinh_thanh_giao,
        }),
      },
      include: {
        doanhNghiep: {
          include: {
            user: { select: { email: true, full_name: true, phone: true } },
          },
        },
        danhMuc: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.prisma.nhuCauThuMua.findMany({
      where: { doanh_nghiep_id },
      include: { danhMuc: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(nhucau_id: number) {
    const item = await this.prisma.nhuCauThuMua.findUnique({
      where: { nhucau_id },
      include: {
        doanhNghiep: {
          include: {
            user: { select: { email: true, full_name: true, phone: true } },
          },
        },
        danhMuc: true,
      },
    });
    if (!item) throw new NotFoundException('Nhu cầu thu mua không tồn tại');
    return item;
  }

  async update(nhucau_id: number, data: UpdateNhuCauDto) {
    return this.prisma.nhuCauThuMua.update({
      where: { nhucau_id },
      data,
    });
  }

  async incrementLuotXem(nhucau_id: number) {
    return this.prisma.nhuCauThuMua.update({
      where: { nhucau_id },
      data: { luot_xem: { increment: 1 } },
    });
  }

  /// Lấy danh sách nhu cầu chưa được admin thông báo hàng mới
  async findChuaThongBao() {
    return this.prisma.nhuCauThuMua.findMany({
      where: {
        trang_thai: 'dang_thu_mua',
        da_thong_bao: false,
      },
      include: {
        doanhNghiep: {
          include: {
            user: { select: { user_id: true, email: true, full_name: true, phone: true } },
          },
        },
        danhMuc: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /// Đánh dấu nhu cầu đã được admin thông báo
  async markDaThongBao(nhucau_id: number) {
    return this.prisma.nhuCauThuMua.update({
      where: { nhucau_id },
      data: { da_thong_bao: true },
    });
  }

  /// Reset cờ thông báo (khi có hàng mới vào, admin muốn thông báo lại)
  async resetThongBao(nhucau_id: number) {
    return this.prisma.nhuCauThuMua.update({
      where: { nhucau_id },
      data: { da_thong_bao: false },
    });
  }

  async remove(nhucau_id: number) {
    return this.prisma.nhuCauThuMua.delete({ where: { nhucau_id } });
  }
}
