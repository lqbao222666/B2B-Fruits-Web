import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBaoGiaDto } from './dto/create-bao-gia.dto';
import { PhanHoiBaoGiaDto } from './dto/phan-hoi-bao-gia.dto';

@Injectable()
export class BaoGiaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBaoGiaDto) {
    const initialHistory = [
      {
        sender: 'nong_dan',
        so_luong: dto.so_luong_cung_cap,
        gia: dto.gia_de_xuat,
        chenh_lech: dto.chenh_lech_gia || 0,
        ghi_chu: dto.ghi_chu || '',
        created_at: new Date().toISOString(),
      },
    ];

    return this.prisma.baoGiaNhuCau.create({
      data: {
        nhucau_id: dto.nhucau_id,
        nong_dan_id: dto.nong_dan_id,
        so_luong_cung_cap: dto.so_luong_cung_cap,
        don_vi: dto.don_vi,
        gia_de_xuat: dto.gia_de_xuat,
        chenh_lech_gia: dto.chenh_lech_gia || 0,
        khoang_cach_km: dto.khoang_cach_km || null,
        phi_van_chuyen: dto.phi_van_chuyen || null,
        ghi_chu: dto.ghi_chu || null,
        lich_su_thuong_luong: initialHistory,
        trang_thai: 'cho_doanh_nghiep',
      },
      include: {
        nhuCau: {
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
          },
        },
        nongDan: {
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
                full_name: true,
                phone: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });
  }

  async findByNhuCau(nhucau_id: number) {
    return this.prisma.baoGiaNhuCau.findMany({
      where: { nhucau_id },
      include: {
        nongDan: {
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
                full_name: true,
                phone: true,
                avatar_url: true,
              },
            },
          },
        },
        nhuCau: {
          include: {
            doanhNghiep: {
              include: { user: { select: { full_name: true, phone: true } } },
            },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findByNongDan(nong_dan_id: number) {
    return this.prisma.baoGiaNhuCau.findMany({
      where: { nong_dan_id },
      include: {
        nhuCau: {
          include: {
            doanhNghiep: {
              include: {
                user: {
                  select: { user_id: true, full_name: true, phone: true },
                },
              },
            },
            danhMuc: true,
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.prisma.baoGiaNhuCau.findMany({
      where: { nhuCau: { doanh_nghiep_id } },
      include: {
        nhuCau: true,
        nongDan: {
          include: {
            user: {
              select: {
                user_id: true,
                full_name: true,
                phone: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async findOne(baogia_id: number) {
    const item = await this.prisma.baoGiaNhuCau.findUnique({
      where: { baogia_id },
      include: {
        nhuCau: {
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
        },
        nongDan: {
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
                full_name: true,
                phone: true,
                avatar_url: true,
              },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Báo giá không tồn tại');
    return item;
  }

  async phanHoi(baogia_id: number, dto: PhanHoiBaoGiaDto) {
    const item = await this.findOne(baogia_id);
    const history = Array.isArray(item.lich_su_thuong_luong)
      ? [...(item.lich_su_thuong_luong as any[])]
      : [];

    const newStep = {
      sender: dto.sender_role || 'he_thong',
      so_luong: dto.so_luong_cung_cap ?? item.so_luong_cung_cap,
      gia: dto.gia_de_xuat ?? item.gia_de_xuat,
      chenh_lech: dto.chenh_lech_gia ?? item.chenh_lech_gia,
      ghi_chu: dto.ghi_chu || '',
      trang_thai: dto.trang_thai || item.trang_thai,
      created_at: new Date().toISOString(),
    };

    history.push(newStep);

    const dataToUpdate: any = {
      lich_su_thuong_luong: history,
      ...(dto.trang_thai && { trang_thai: dto.trang_thai }),
      ...(dto.so_luong_cung_cap !== undefined && {
        so_luong_cung_cap: dto.so_luong_cung_cap,
      }),
      ...(dto.gia_de_xuat !== undefined && { gia_de_xuat: dto.gia_de_xuat }),
      ...(dto.chenh_lech_gia !== undefined && {
        chenh_lech_gia: dto.chenh_lech_gia,
      }),
      ...(dto.ghi_chu !== undefined && { ghi_chu: dto.ghi_chu }),
    };

    return this.prisma.baoGiaNhuCau.update({
      where: { baogia_id },
      data: dataToUpdate,
      include: {
        nhuCau: {
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
          },
        },
        nongDan: {
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
      },
    });
  }

  async remove(baogia_id: number) {
    return this.prisma.baoGiaNhuCau.delete({ where: { baogia_id } });
  }
}
