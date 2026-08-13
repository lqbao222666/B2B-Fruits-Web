import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNhuCauDto } from './dto/create-nhu-cau.dto';
import { UpdateNhuCauDto } from './dto/update-nhu-cau.dto';

@Injectable()
export class NhuCauRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNhuCauDto) {
    const payload: any = { ...data };
    if (payload.ngay_bat_dau) {
      payload.ngay_bat_dau = new Date(payload.ngay_bat_dau);
    } else {
      delete payload.ngay_bat_dau;
    }
    if (payload.ngay_ket_thuc) {
      payload.ngay_ket_thuc = new Date(payload.ngay_ket_thuc);
    } else {
      delete payload.ngay_ket_thuc;
    }

    return this.prisma.nhuCauThuMua.create({
      data: payload,
      include: {
        doanhNghiep: {
          include: { user: { select: { email: true, full_name: true } } },
        },
        danhMuc: true,
      },
    });
  }

  async findAll(filters?: {
    ten_nong_san?: string;
    tinh_thanh_giao?: string;
    danhmuc_id?: number;
    trang_thai?: string;
  }) {
    const where: any = {};
    if (filters?.trang_thai && filters.trang_thai !== 'all') {
      where.trang_thai = filters.trang_thai;
    } else if (!filters?.trang_thai) {
      where.trang_thai = 'dang_thu_mua';
    }

    if (filters?.ten_nong_san) {
      where.ten_nong_san = {
        contains: filters.ten_nong_san,
        mode: 'insensitive',
      };
    }
    if (filters?.tinh_thanh_giao) {
      where.tinh_thanh_giao = filters.tinh_thanh_giao;
    }
    if (filters?.danhmuc_id) {
      where.danhmuc_id = filters.danhmuc_id;
    }

    return this.prisma.nhuCauThuMua.findMany({
      where,
      include: {
        doanhNghiep: {
          include: {
            user: { select: { email: true, full_name: true, phone: true } },
          },
        },
        danhMuc: true,
        _count: { select: { baoGiaList: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.prisma.nhuCauThuMua.findMany({
      where: { doanh_nghiep_id },
      include: {
        danhMuc: true,
        _count: { select: { baoGiaList: true } },
      },
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
        baoGiaList: {
          include: {
            nongDan: {
              include: {
                user: {
                  select: { full_name: true, phone: true, avatar_url: true },
                },
              },
            },
          },
          orderBy: { updated_at: 'desc' },
        },
      },
    });
    if (!item) throw new NotFoundException('Nhu cầu thu mua không tồn tại');
    return item;
  }

  async update(nhucau_id: number, data: UpdateNhuCauDto) {
    const payload: any = { ...data };
    if (payload.ngay_bat_dau) {
      payload.ngay_bat_dau = new Date(payload.ngay_bat_dau);
    }
    if (payload.ngay_ket_thuc) {
      payload.ngay_ket_thuc = new Date(payload.ngay_ket_thuc);
    }

    return this.prisma.nhuCauThuMua.update({
      where: { nhucau_id },
      data: payload,
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
            user: {
              select: {
                user_id: true,
                email: true,
                full_name: true,
                phone: true,
              },
            },
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
