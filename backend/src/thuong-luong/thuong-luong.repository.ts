import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThuongLuongDto } from './dto/create-thuong-luong.dto';
import { PhanHoiThuongLuongDto } from './dto/phan-hoi-thuong-luong.dto';

@Injectable()
export class ThuongLuongRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateThuongLuongDto) {
    const initialHistory = [
      {
        sender: 'doanh_nghiep',
        items: dto.items,
        ghi_chu: dto.ghi_chu || '',
        created_at: new Date().toISOString(),
      },
    ];

    return this.prisma.thuongLuongBaiDang.create({
      data: {
        baidang_id: dto.baidang_id,
        doanh_nghiep_id: dto.doanh_nghiep_id,
        don_vi: dto.don_vi,
        ghi_chu: dto.ghi_chu || null,
        hinh_thuc_giao_hang: dto.hinh_thuc_giao_hang || 'giao_tan_noi',
        dia_chi_giao: dto.dia_chi_giao || null,
        tinh_thanh_giao: dto.tinh_thanh_giao || null,
        lich_su_thuong_luong: initialHistory as any,
        trang_thai: 'cho_nong_dan',
        chiTiets: {
          create: dto.items.map(item => ({
            phanloai_id: item.phanloai_id,
            so_luong_mua: item.so_luong_mua,
            gia_de_xuat: item.gia_de_xuat
          }))
        }
      },
      include: {
        chiTiets: true,
        baiDang: {
          include: {
            nguoiDang: {
              include: {
                user: {
                  select: { user_id: true, email: true, full_name: true, phone: true },
                },
              },
            },
          },
        },
        doanhNghiep: {
          include: {
            user: {
              select: { user_id: true, email: true, full_name: true, phone: true, avatar_url: true },
            },
          },
        },
      },
    });
  }

  async findByBaiDang(baidang_id: number) {
    return this.prisma.thuongLuongBaiDang.findMany({
      where: { baidang_id },
      include: {
        chiTiets: {
          include: { phanLoai: true }
        },
        doanhNghiep: {
          include: {
            user: {
              select: { user_id: true, full_name: true, phone: true, avatar_url: true },
            },
          },
        },
        baiDang: {
          select: { tieu_de: true, ten_nong_san: true, gia_per_kg: true },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.prisma.thuongLuongBaiDang.findMany({
      where: { doanh_nghiep_id },
      include: {
        chiTiets: {
          include: { phanLoai: true }
        },
        baiDang: {
          include: {
            nguoiDang: {
              include: {
                user: {
                  select: { user_id: true, full_name: true, phone: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findByNongDan(nong_dan_id: number) {
    return this.prisma.thuongLuongBaiDang.findMany({
      where: { baiDang: { nguoi_dang_id: nong_dan_id } },
      include: {
        chiTiets: {
          include: { phanLoai: true }
        },
        baiDang: true,
        doanhNghiep: {
          include: {
            user: {
              select: { user_id: true, full_name: true, phone: true, avatar_url: true },
            },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findOne(thuongluong_id: number) {
    const item = await this.prisma.thuongLuongBaiDang.findUnique({
      where: { thuongluong_id },
      include: {
        chiTiets: {
          include: { phanLoai: true }
        },
        baiDang: {
          include: {
            nguoiDang: {
              include: {
                user: {
                  select: { user_id: true, email: true, full_name: true, phone: true },
                },
              },
            },
          },
        },
        doanhNghiep: {
          include: {
            user: {
              select: { user_id: true, email: true, full_name: true, phone: true, avatar_url: true },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Yêu cầu thương lượng không tồn tại');
    return item;
  }

  async phanHoi(thuongluong_id: number, dto: PhanHoiThuongLuongDto) {
    const item = await this.findOne(thuongluong_id);
    const history = Array.isArray(item.lich_su_thuong_luong)
      ? [...(item.lich_su_thuong_luong as any[])]
      : [];

    const newStep = {
      sender: dto.sender_role || 'he_thong',
      items: dto.items, // optional if they only agree/reject, but usually provided if counter-offer
      ghi_chu: dto.ghi_chu || '',
      trang_thai: dto.trang_thai || item.trang_thai,
      created_at: new Date().toISOString(),
    };

    history.push(newStep);

    const dataToUpdate: any = {
      lich_su_thuong_luong: history,
      ...(dto.trang_thai && { trang_thai: dto.trang_thai }),
      ...(dto.ghi_chu !== undefined && { ghi_chu: dto.ghi_chu }),
    };

    if (dto.items && dto.items.length > 0) {
      dataToUpdate.chiTiets = {
        deleteMany: {},
        create: dto.items.map(i => ({
          phanloai_id: i.phanloai_id,
          so_luong_mua: i.so_luong_mua,
          gia_de_xuat: i.gia_de_xuat
        }))
      };
    }

    return this.prisma.thuongLuongBaiDang.update({
      where: { thuongluong_id },
      data: dataToUpdate,
      include: {
        chiTiets: {
          include: { phanLoai: true }
        },
        baiDang: {
          include: {
            nguoiDang: {
              include: {
                user: { select: { user_id: true, email: true, full_name: true, phone: true } },
              },
            },
          },
        },
        doanhNghiep: {
          include: {
            user: { select: { user_id: true, email: true, full_name: true, phone: true } },
          },
        },
      },
    });
  }

  async remove(thuongluong_id: number) {
    return this.prisma.thuongLuongBaiDang.delete({ where: { thuongluong_id } });
  }
}
