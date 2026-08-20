import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBaiDangDto } from './dto/create-bai-dang.dto';
import { UpdateBaiDangDto } from './dto/update-bai-dang.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { getProvincesByRegion } from '../common/regions';

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
const GIA_MIN_PER_KG = 100; // 100 đ/kg
const GIA_MAX_PER_KG = 500_000; // 500.000 đ/kg

@Injectable()
export class BaiDangRepository {
  constructor(private prisma: PrismaService) {}

  /// Nông Dân tạo bài đăng với gia_per_kg tự định.
  /// so_luong_con_lai = so_luong_co (mới đăng, chưa bán gì).
  /// Thuật toán kiểm tra giá cơ bản: nếu hợp lệ → dang_ban, nếu bất thường → cho_duyet.
  async create(data: CreateBaiDangDto) {
    const normalizedGia =
      data.don_vi_tinh === 'tấn' ? data.gia_per_kg / 1000 : data.gia_per_kg;
    const giaHopLe =
      normalizedGia >= GIA_MIN_PER_KG && normalizedGia <= GIA_MAX_PER_KG;

    const baiDang = await this.prisma.baiDang.create({
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
        is_seasonal: data.is_seasonal ?? false,
        loai_cung_cap: data.loai_cung_cap ?? 'lay_hang_ngay',
        ngay_bat_dau_cung_cap: data.loai_cung_cap === 'du_kien' && data.ngay_bat_dau_cung_cap
          ? new Date(data.ngay_bat_dau_cung_cap)
          : new Date(),
        trang_thai: 'dang_ban',
        checked_at: new Date(),
        tieuChuans:
          data.tieu_chuan_ids && data.tieu_chuan_ids.length > 0
            ? {
                connect: data.tieu_chuan_ids.map((id) => ({
                  tieuchuan_id: id,
                })),
              }
            : undefined,
        phanLoais: {
          create:
            data.phan_loais && data.phan_loais.length > 0
              ? data.phan_loais.map((pl) => ({
                  ten_phan_loai: pl.ten_phan_loai,
                  gia: pl.gia,
                  so_luong_co: pl.so_luong_co,
                  so_luong_con_lai: pl.so_luong_co,
                }))
              : [
                  {
                    ten_phan_loai: 'Loại 1',
                    gia: data.gia_per_kg,
                    so_luong_co: data.so_luong_co,
                    so_luong_con_lai: data.so_luong_co,
                  },
                ],
        },
      },
    });

    const sellerInfo = await this.prisma.users.findUnique({
      where: { user_id: data.nguoi_dang_id },
    });
    const sellerName = sellerInfo?.full_name || 'Nông Dân';

    const subscribers = await this.prisma.theoDoiNguoiBan.findMany({
      where: { seller_id: data.nguoi_dang_id, is_active: true },
    });

    if (subscribers.length > 0) {
      await this.prisma.thongBao.createMany({
        data: subscribers.map((sub) => ({
          user_id: sub.buyer_id,
          loai: 'hang_moi',
          tieu_de: `🌾 Nông sản mới từ ${sellerName}`,
          noi_dung: `Nhà cung cấp ${sellerName} vừa đăng bán nông sản mới: "${baiDang.ten_nong_san}" (${baiDang.so_luong_co} ${baiDang.don_vi_tinh}).`,
          ref_id: baiDang.baidang_id,
          ref_type: 'bai_dang',
        })),
      });
    }

    return baiDang;
  }

  /// Danh sách bài đang bán — dành cho Doanh Nghiệp và công khai
  async findAll(filters?: {
    tinh_thanh?: string;
    danhmuc_id?: number;
    ten_nong_san?: string;
    gia_min?: number;
    gia_max?: number;
    mien?: string;
    so_luong_min?: number;
    tieu_chuan?: string;
    rating_min?: number;
    sort?: string;
  }) {
    const regionProvinces = filters?.mien
      ? getProvincesByRegion(filters.mien)
      : [];

    let orderBy: any = { created_at: 'desc' };
    if (filters?.sort === 'price-asc') {
      orderBy = { gia_per_kg: 'asc' };
    } else if (filters?.sort === 'price-desc') {
      orderBy = { gia_per_kg: 'desc' };
    } else if (filters?.sort === 'qty-desc') {
      orderBy = { so_luong_con_lai: 'desc' };
    }

    return this.prisma.baiDang.findMany({
      where: {
        trang_thai: 'dang_ban',
        so_luong_con_lai: { gt: 0 },
        ...(filters?.tinh_thanh && { tinh_thanh: filters.tinh_thanh }),
        ...(filters?.mien && regionProvinces.length > 0 && {
          tinh_thanh: { in: regionProvinces },
        }),
        ...(filters?.danhmuc_id && { danhmuc_id: filters.danhmuc_id }),
        ...(filters?.ten_nong_san && {
          OR: [
            {
              ten_nong_san: {
                contains: filters.ten_nong_san,
                mode: 'insensitive' as const,
              },
            },
            {
              tieu_de: {
                contains: filters.ten_nong_san,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
        ...(filters?.gia_min !== undefined && {
          gia_per_kg: { gte: filters.gia_min },
        }),
        ...(filters?.gia_max !== undefined && {
          gia_per_kg: { lte: filters.gia_max },
        }),
        ...(filters?.so_luong_min !== undefined && {
          so_luong_con_lai: { gte: filters.so_luong_min },
        }),
        ...(filters?.tieu_chuan && {
          tieuChuans: {
            some: {
              ten_tieu_chuan: {
                equals: filters.tieu_chuan,
                mode: 'insensitive' as const,
              },
            },
          },
        }),
        ...(filters?.rating_min !== undefined && {
          nguoiDang: {
            diem_trung_binh: { gte: filters.rating_min },
          },
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
      orderBy,
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
      where: {
        nguoi_dang_id,
        trang_thai: { not: 'da_xoa' },
      },
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
    const existing = await this.prisma.baiDang.findUnique({
      where: { baidang_id },
    });
    if (!existing) throw new NotFoundException('Bài đăng không tồn tại');

    // Khi nông dân cập nhật bài đăng, đặt trạng thái dang_ban trực tiếp ngoại trừ khi hết hàng (so_luong_con_lai <= 0)
    let newTrangThai = data.trang_thai || existing.trang_thai;
    if (
      data.so_luong_con_lai !== undefined &&
      Number(data.so_luong_con_lai) <= 0
    ) {
      newTrangThai = 'da_ban';
    } else if (
      data.so_luong_con_lai !== undefined &&
      Number(data.so_luong_con_lai) > 0 &&
      (newTrangThai === 'da_ban' || newTrangThai === 'an')
    ) {
      newTrangThai = 'dang_ban';
    } else if (newTrangThai === 'cho_duyet' || !newTrangThai) {
      newTrangThai = 'dang_ban';
    }

    const { tieu_chuan_ids, phan_loais, ...rawRest } = data;
    const restData = { ...rawRest };
    delete (restData as any).phan_loais;
    delete (restData as any).tieu_chuan_ids;

    if (restData.ngay_bat_dau_cung_cap) {
      restData.ngay_bat_dau_cung_cap = new Date(restData.ngay_bat_dau_cung_cap) as any;
    }
    if (restData.ngay_thu_hoach) {
      restData.ngay_thu_hoach = new Date(restData.ngay_thu_hoach) as any;
    }
    if (restData.han_su_dung) {
      restData.han_su_dung = new Date(restData.han_su_dung) as any;
    }

    if (phan_loais && phan_loais.length > 0) {
      const existingPhanLoais = await this.prisma.phanLoaiSanPham.findMany({
        where: { baidang_id },
      });

      for (const pl of phan_loais) {
        const existingPl = existingPhanLoais.find(
          (e) => e.ten_phan_loai === pl.ten_phan_loai,
        );
        if (existingPl) {
          await this.prisma.phanLoaiSanPham.update({
            where: { phanloai_id: existingPl.phanloai_id },
            data: {
              gia: pl.gia,
              so_luong_co: pl.so_luong_co,
              so_luong_con_lai: pl.so_luong_con_lai ?? pl.so_luong_co,
            },
          });
        } else {
          await this.prisma.phanLoaiSanPham.create({
            data: {
              baidang_id,
              ten_phan_loai: pl.ten_phan_loai,
              gia: pl.gia,
              so_luong_co: pl.so_luong_co,
              so_luong_con_lai: pl.so_luong_con_lai ?? pl.so_luong_co,
            },
          });
        }
      }

      const currentNames = phan_loais.map((p) => p.ten_phan_loai);
      await this.prisma.phanLoaiSanPham.updateMany({
        where: { baidang_id, ten_phan_loai: { notIn: currentNames } },
        data: { so_luong_con_lai: 0 },
      });
    } else if (
      data.so_luong_con_lai !== undefined &&
      Number(data.so_luong_con_lai) > 0
    ) {
      const existingPhanLoais = await this.prisma.phanLoaiSanPham.findMany({
        where: { baidang_id },
      });
      for (const pl of existingPhanLoais) {
        if (Number(pl.so_luong_con_lai) <= 0) {
          await this.prisma.phanLoaiSanPham.update({
            where: { phanloai_id: pl.phanloai_id },
            data: { so_luong_con_lai: pl.so_luong_co },
          });
        }
      }
    }

    const updated = await this.prisma.baiDang.update({
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
      include: INCLUDE_FULL,
    });

    if (data.so_luong_con_lai !== undefined || data.so_luong_co !== undefined) {
      const sellerInfo = await this.prisma.users.findUnique({
        where: { user_id: existing.nguoi_dang_id },
      });
      const sellerName = sellerInfo?.full_name || 'Nông Dân';

      const subscribers = await this.prisma.theoDoiNguoiBan.findMany({
        where: { seller_id: existing.nguoi_dang_id, is_active: true },
      });

      if (subscribers.length > 0) {
        await this.prisma.thongBao.createMany({
          data: subscribers.map((sub) => ({
            user_id: sub.buyer_id,
            loai: 'bai_dang',
            tieu_de: `📢 Cập nhật số lượng nông sản từ ${sellerName}`,
            noi_dung: `Nhà cung cấp ${sellerName} vừa cập nhật số lượng sản phẩm "${updated.ten_nong_san}" thành ${updated.so_luong_con_lai} ${updated.don_vi_tinh}.`,
            ref_id: updated.baidang_id,
            ref_type: 'bai_dang',
          })),
        });
      }
    }

    return updated;
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
  async remove(baidang_id: number, nguoi_dang_id: number) {
    // Để tương thích ngược nếu có chỗ nào gọi remove, chuyển qua xoaBaiDang
    return this.xoaBaiDang(baidang_id, nguoi_dang_id);
  }

  async ngungCungCap(baidang_id: number, nguoi_dang_id: number) {
    const existing = await this.prisma.baiDang.findUnique({
      where: { baidang_id },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy bài đăng');
    if (existing.nguoi_dang_id !== nguoi_dang_id) {
      throw new BadRequestException(
        'Bạn không có quyền thực hiện thao tác này',
      );
    }

    await this.prisma.baiDang.update({
      where: { baidang_id },
      data: {
        trang_thai: 'an',
        so_luong_con_lai: 0,
        phanLoais: {
          updateMany: {
            where: { baidang_id },
            data: { so_luong_con_lai: 0 },
          },
        },
      },
    });

    return { message: 'Đã ngừng cung cấp' };
  }

  async xoaBaiDang(baidang_id: number, nguoi_dang_id: number) {
    const existing = await this.prisma.baiDang.findUnique({
      where: { baidang_id },
    });
    if (!existing) throw new NotFoundException('Không tìm thấy bài đăng');
    if (existing.nguoi_dang_id !== nguoi_dang_id) {
      throw new BadRequestException(
        'Bạn không có quyền thực hiện thao tác này',
      );
    }

    await this.prisma.baiDang.update({
      where: { baidang_id },
      data: { trang_thai: 'da_xoa' },
    });

    return { message: 'Đã xóa bài đăng' };
  }
}
