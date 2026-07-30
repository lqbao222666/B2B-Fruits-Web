import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBaiDangDto } from './dto/create-bai-dang.dto';
import { UpdateBaiDangDto } from './dto/update-bai-dang.dto';
import { Decimal } from '@prisma/client/runtime/library';

/// Thông tin include dùng chung cho chi tiết đầy đủ
const INCLUDE_FULL = {
  nguoiDang: {
    include: {
      user: { select: { email: true, phone: true, full_name: true } },
    },
  },
  danhMuc: true,
  phanLoais: true,
  tieuChuans: true,
};

/// Ngưỡng kiểm tra giá bất thường (có thể chuyển vào config sau)
const GIA_MIN_PER_KG = 100;       // 100 đ/kg
const GIA_MAX_PER_KG = 500_000;   // 500.000 đ/kg

@Injectable()
export class BaiDangRepository {
  constructor(private prisma: PrismaService) {}

  /// Nông Dân tạo bài đăng với gia_per_kg tự định.
  /// so_luong_con_lai = so_luong_co (mới đăng, chưa bán gì).
  /// Thuật toán kiểm tra giá cơ bản: nếu hợp lệ → dang_ban, nếu bất thường → cho_duyet.
  async create(data: CreateBaiDangDto) {
    const normalizedGia = data.don_vi_tinh === 'tấn' ? data.gia_per_kg / 1000 : data.gia_per_kg;
    const giaHopLe =
      normalizedGia >= GIA_MIN_PER_KG && normalizedGia <= GIA_MAX_PER_KG;

    return this.prisma.baiDang.create({
      data: {
        nguoi_dang_id: data.nguoi_dang_id,
        danhmuc_id: data.danhmuc_id,
        tieu_de: data.tieu_de,
        mo_ta: data.mo_ta,
        ten_nong_san: data.ten_nong_san,
        don_vi_tinh: data.don_vi_tinh,
        so_luong_co: data.so_luong_co,
        so_luong_con_lai: data.so_luong_co, // ban đầu bằng nhau
        so_luong_toi_thieu: data.so_luong_toi_thieu ?? 1,
        gia_per_kg: data.gia_per_kg,
        tinh_thanh: data.tinh_thanh,
        dia_chi_lay_hang: data.dia_chi_lay_hang,
        latitude: data.latitude,
        longitude: data.longitude,
        ngay_thu_hoach: data.ngay_thu_hoach
          ? new Date(data.ngay_thu_hoach)
          : undefined,
        han_su_dung: data.han_su_dung ? new Date(data.han_su_dung) : undefined,
        images: data.images ?? [],
        video_url: data.video_url,
        is_seasonal: data.is_seasonal ?? false,
        trang_thai: giaHopLe ? 'dang_ban' : 'cho_duyet',
        checked_at: new Date(),
        tieuChuans: data.tieu_chuan_ids && data.tieu_chuan_ids.length > 0
          ? {
              connect: data.tieu_chuan_ids.map((id) => ({ tieuchuan_id: id })),
            }
          : undefined,
        phanLoais: {
          create: data.phan_loais && data.phan_loais.length > 0
            ? data.phan_loais.map(pl => ({
                ten_phan_loai: pl.ten_phan_loai,
                gia: pl.gia,
                so_luong_co: pl.so_luong_co,
                so_luong_con_lai: pl.so_luong_co,
              }))
            : [{
                ten_phan_loai: 'Loại 1',
                gia: data.gia_per_kg,
                so_luong_co: data.so_luong_co,
                so_luong_con_lai: data.so_luong_co,
              }]
        }
      },
    });
  }

  /// Danh sách bài đang bán — dành cho Doanh Nghiệp và công khai
  async findAll(filters?: {
    tinh_thanh?: string;
    danhmuc_id?: number;
    ten_nong_san?: string;
    gia_min?: number;
    gia_max?: number;
  }) {
    return this.prisma.baiDang.findMany({
      where: {
        trang_thai: 'dang_ban',
        so_luong_con_lai: { gt: 0 },
        ...(filters?.tinh_thanh && { tinh_thanh: filters.tinh_thanh }),
        ...(filters?.danhmuc_id && { danhmuc_id: filters.danhmuc_id }),
        ...(filters?.ten_nong_san && {
          ten_nong_san: {
            contains: filters.ten_nong_san,
            mode: 'insensitive' as const,
          },
        }),
        ...(filters?.gia_min !== undefined && {
          gia_per_kg: { gte: filters.gia_min },
        }),
        ...(filters?.gia_max !== undefined && {
          gia_per_kg: { lte: filters.gia_max },
        }),
      },
      include: {
        nguoiDang: {
          include: {
            user: { select: { email: true, phone: true, full_name: true } },
          },
        },
        danhMuc: true,
        phanLoais: true,
        tieuChuans: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /// Tất cả bài đăng — dành cho Admin (kể cả cho_duyet, da_ban, an...)
  async findAllForAdmin(filters?: { trang_thai?: string }) {
    return this.prisma.baiDang.findMany({
      where: {
        ...(filters?.trang_thai && {
          trang_thai: filters.trang_thai as any,
        }),
      },
      include: INCLUDE_FULL,
      orderBy: { created_at: 'desc' },
    });
  }

  /// Bài đăng của một nông dân cụ thể
  async findByNongDan(nguoi_dang_id: number) {
    return this.prisma.baiDang.findMany({
      where: { nguoi_dang_id },
      include: { danhMuc: true, phanLoais: true, tieuChuans: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(baidang_id: number) {
    const item = await this.prisma.baiDang.findUnique({
      where: { baidang_id },
      include: INCLUDE_FULL,
    });
    if (!item) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }
    return item;
  }

  async update(baidang_id: number, data: UpdateBaiDangDto) {
    const existing = await this.prisma.baiDang.findUnique({ where: { baidang_id } });
    if (!existing) throw new NotFoundException('Bài đăng không tồn tại');

    let newTrangThai = data.trang_thai || existing.trang_thai;
    
    // Nếu có sự thay đổi về giá hoặc đơn vị tính, kiểm tra lại giá
    if (data.gia_per_kg !== undefined || data.don_vi_tinh !== undefined) {
      const gia = data.gia_per_kg !== undefined ? data.gia_per_kg : Number(existing.gia_per_kg);
      const donVi = data.don_vi_tinh !== undefined ? data.don_vi_tinh : existing.don_vi_tinh;
      
      const normalizedGia = donVi === 'tấn' ? gia / 1000 : gia;
      const giaHopLe = normalizedGia >= GIA_MIN_PER_KG && normalizedGia <= GIA_MAX_PER_KG;
      
      if (!giaHopLe) {
        newTrangThai = 'cho_duyet'; // Giá bất thường -> bắt buộc chờ duyệt
      } else if (existing.trang_thai === 'cho_duyet') {
        // Đã sửa lại giá hợp lệ nhưng vẫn phải chờ admin duyệt lại (không tự động)
        newTrangThai = 'cho_duyet';
      }
    }

    if (data.so_luong_con_lai !== undefined) {
      if (Number(data.so_luong_con_lai) > 0 && existing.trang_thai === 'da_ban') {
        newTrangThai = 'dang_ban';
      } else if (Number(data.so_luong_con_lai) <= 0) {
        newTrangThai = 'da_ban';
      }
    }

    const { tieu_chuan_ids, phan_loais, ...restData } = data;

    return this.prisma.baiDang.update({
      where: { baidang_id },
      data: {
        ...restData,
        trang_thai: newTrangThai,
        ...(tieu_chuan_ids !== undefined && {
          tieuChuans: {
            set: tieu_chuan_ids.map((id) => ({ tieuchuan_id: id })),
          },
        }),
      },
    });
  }

  /// Admin ẩn bài đăng vi phạm nội dung
  async anBaiDang(baidang_id: number, ly_do_tu_choi: string) {
    await this.findOne(baidang_id);
    return this.prisma.baiDang.update({
      where: { baidang_id },
      data: {
        trang_thai: 'an',
        ly_do_tu_choi,
      },
    });
  }

  /// Nông dân / Admin mở lại bài đăng đang ẩn
  async moLaiBaiDang(baidang_id: number) {
    const baiDang = await this.findOne(baidang_id);
    if (baiDang.trang_thai !== 'an') {
      throw new BadRequestException('Bài đăng không đang ở trạng thái ẩn');
    }
    return this.prisma.baiDang.update({
      where: { baidang_id },
      data: {
        trang_thai: 'dang_ban',
        ly_do_tu_choi: null,
      },
    });
  }

  /// Hệ thống trừ số lượng sau khi đơn hàng hoàn thành.
  /// Nếu so_luong_con_lai về 0 → tự động chuyển sang da_ban.
  async truSoLuong(baidang_id: number, so_luong_ban: number) {
    const baiDang = await this.prisma.baiDang.findUnique({
      where: { baidang_id },
      select: { so_luong_con_lai: true },
    });

    if (!baiDang) throw new NotFoundException('Bài đăng không tồn tại');

    const conLai = Number(baiDang.so_luong_con_lai) - so_luong_ban;

    if (conLai < 0) {
      throw new BadRequestException('Số lượng đặt vượt quá số lượng còn lại');
    }

    return this.prisma.baiDang.update({
      where: { baidang_id },
      data: {
        so_luong_con_lai: conLai,
        trang_thai: conLai === 0 ? 'da_ban' : undefined,
      },
    });
  }

  async remove(baidang_id: number) {
    const orderCount = await this.prisma.donHang.count({
      where: { baidang_id }
    });

    if (orderCount > 0) {
      // Soft delete: change status to 'an' because there are existing orders relying on this product
      return this.prisma.baiDang.update({
        where: { baidang_id },
        data: { trang_thai: 'an' }
      });
    }

    // Hard delete if no orders exist
    return this.prisma.baiDang.delete({
      where: { baidang_id },
    });
  }
}
