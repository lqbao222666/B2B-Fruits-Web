import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNhuCauDto } from './dto/create-nhu-cau.dto';
import { UpdateNhuCauDto } from './dto/update-nhu-cau.dto';
import { getProvincesByRegion } from '../common/regions';

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
    mien?: string;
    so_luong_min?: number;
    gia_min?: number;
    gia_max?: number;
    yeu_cau_chung_nhan?: string;
    cho_thuong_luong?: boolean;
    sort?: string;
  }) {
    const where: any = {};
    if (filters?.trang_thai && filters.trang_thai !== 'all') {
      where.trang_thai = filters.trang_thai;
    } else if (!filters?.trang_thai) {
      where.trang_thai = 'dang_thu_mua';
    }

    if (filters?.ten_nong_san) {
      where.OR = [
        {
          ten_nong_san: {
            contains: filters.ten_nong_san,
            mode: 'insensitive',
          },
        },
        {
          mo_ta: {
            contains: filters.ten_nong_san,
            mode: 'insensitive',
          },
        },
        {
          doanhNghiep: {
            ten_cong_ty: {
              contains: filters.ten_nong_san,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    if (filters?.tinh_thanh_giao) {
      where.tinh_thanh_giao = filters.tinh_thanh_giao;
    }
    if (filters?.mien) {
      const regionProvinces = getProvincesByRegion(filters.mien);
      if (regionProvinces.length > 0) {
        where.tinh_thanh_giao = { in: regionProvinces };
      }
    }
    if (filters?.danhmuc_id) {
      where.danhmuc_id = filters.danhmuc_id;
    }
    if (filters?.so_luong_min !== undefined) {
      where.so_luong_can = { gte: filters.so_luong_min };
    }
    if (filters?.gia_min !== undefined || filters?.gia_max !== undefined) {
      where.gia_tham_khao = {
        ...(filters.gia_min !== undefined && { gte: filters.gia_min }),
        ...(filters.gia_max !== undefined && { lte: filters.gia_max }),
      };
    }
    if (filters?.yeu_cau_chung_nhan) {
      where.yeu_cau_chung_nhan = {
        contains: filters.yeu_cau_chung_nhan,
        mode: 'insensitive',
      };
    }
    if (filters?.cho_thuong_luong !== undefined) {
      where.cho_thuong_luong = filters.cho_thuong_luong;
    }

    let orderBy: any = { created_at: 'desc' };
    if (filters?.sort === 'qty_desc') {
      orderBy = { so_luong_can: 'desc' };
    } else if (filters?.sort === 'qty_asc') {
      orderBy = { so_luong_can: 'asc' };
    } else if (filters?.sort === 'price_desc') {
      orderBy = { gia_tham_khao: 'desc' };
    } else if (filters?.sort === 'price_asc') {
      orderBy = { gia_tham_khao: 'asc' };
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
      orderBy,
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
