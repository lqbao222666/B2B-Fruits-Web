import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDonHangDto } from './dto/create-don-hang.dto';
import { UpdateDonHangDto } from './dto/update-don-hang.dto';
import { DatHangDto } from './dto/dat-hang.dto';
import { HinhThucGiaoHang } from '@prisma/client';

@Injectable()
export class DonHangRepository {
  constructor(private prisma: PrismaService) {}

  private async ensureProfiles(tx: any, buyerId: number, sellerId: number) {
    if (buyerId && !isNaN(buyerId) && buyerId > 0) {
      const dn = await tx.doanhNghiep.findUnique({ where: { user_id: buyerId } });
      if (!dn) {
        const u = await tx.users.findUnique({ where: { user_id: buyerId } });
        if (u) {
          await tx.doanhNghiep.create({
            data: {
              user_id: buyerId,
              ten_cong_ty: u.full_name || 'Doanh Nghiệp',
              tinh_thanh: 'Cần Thơ',
              trang_thai: 'active',
              tong_giao_dich: 0
            }
          });
        }
      }
    }
    if (sellerId && !isNaN(sellerId) && sellerId > 0) {
      const nd = await tx.nongDan.findUnique({ where: { user_id: sellerId } });
      if (!nd) {
        const u = await tx.users.findUnique({ where: { user_id: sellerId } });
        if (u) {
          await tx.nongDan.create({
            data: {
              user_id: sellerId,
              ho_ten: u.full_name || 'Nông Dân',
              tinh_thanh: 'Cần Thơ',
              trang_thai: 'active',
              tong_giao_dich: 0
            }
          });
        }
      }
    }
  }

  async findCartItems(ids: number[], user_id: number) {
    const numericIds = (ids || []).map(id => Number(id));
    return this.prisma.gioHang.findMany({
      where: {
        id: { in: numericIds },
        user_id: Number(user_id)
      },
      include: {
        phanLoai: true,
        baiDang: true
      }
    });
  }

  async datHang(user_id: number, data: DatHangDto, shippingFee: number = 0) {
    return this.prisma.$transaction(async (tx) => {
      const numericUserId = Number(user_id);
      const numericSellerId = Number(data.nguoi_ban_id);
      const numericBaiDangId = Number(data.baidang_id);

      await this.ensureProfiles(tx, numericUserId, numericSellerId);

      if (!data.items || data.items.length === 0) {
        throw new BadRequestException('Không có sản phẩm nào để đặt hàng');
      }

      let tongTienHang = 0;
      let totalOrderedQty = 0;
      const chiTiets: any[] = [];

      for (const item of data.items) {
        const phanloai_id = Number(item.phanloai_id);
        const so_luong = Number(item.so_luong);

        const phanLoai = await tx.phanLoaiSanPham.findUnique({
          where: { phanloai_id }
        });

        if (!phanLoai) {
          throw new BadRequestException(`Phân loại ${phanloai_id} không tồn tại`);
        }

        if (Number(phanLoai.so_luong_con_lai) < so_luong) {
          throw new BadRequestException(`Sản phẩm ${phanLoai.ten_phan_loai} không đủ số lượng tồn kho`);
        }

        const thanhTien = so_luong * Number(phanLoai.gia);
        tongTienHang += thanhTien;
        totalOrderedQty += so_luong;

        chiTiets.push({
          phanloai_id: phanloai_id,
          so_luong: so_luong,
          don_gia: phanLoai.gia,
          thanh_tien: thanhTien
        });

        // Trừ tồn kho phân loại
        await tx.phanLoaiSanPham.update({
          where: { phanloai_id: phanloai_id },
          data: {
            so_luong_con_lai: Number(phanLoai.so_luong_con_lai) - so_luong
          }
        });
      }

      // Trừ tổng tồn kho bài đăng tương ứng
      const baiDang = await tx.baiDang.findUnique({
        where: { baidang_id: numericBaiDangId },
        select: { so_luong_con_lai: true }
      });
      if (baiDang) {
        const conLai = Math.max(0, Number(baiDang.so_luong_con_lai) - totalOrderedQty);
        await tx.baiDang.update({
          where: { baidang_id: numericBaiDangId },
          data: {
            so_luong_con_lai: conLai,
            trang_thai: conLai === 0 ? 'da_ban' : undefined
          }
        });
      }

      const tongTien = tongTienHang + shippingFee;
      const tienCoc = tongTien * 0.15; // Cọc 15% tổng đơn

      const uniqueOrderCode = 'DH' + Date.now() + Math.floor(1000 + Math.random() * 9000);

      // Tạo đơn hàng với trạng thái cho_xac_nhan và cọc da_thanh_toan
      const donHang = await tx.donHang.create({
        data: {
          nguoi_mua_id: numericUserId,
          nguoi_ban_id: numericSellerId,
          baidang_id: numericBaiDangId,
          ma_don_hang: uniqueOrderCode,
          tong_tien: tongTien,
          dia_chi_giao: data.dia_chi_giao || 'Địa chỉ giao hàng',
          tinh_thanh_giao: data.tinh_thanh_giao || 'Cần Thơ',
          hinh_thuc_giao_hang: data.hinh_thuc_giao_hang || 'giao_tan_noi',
          khoang_cach: data.khoang_cach || 0,
          phi_van_chuyen: shippingFee,
          tien_coc: tienCoc,
          ghi_chu: data.ghi_chu,
          trang_thai_don: 'da_xac_nhan',
          trang_thai_tt: 'da_thanh_toan', // Đã thanh toán cọc 15%
          chiTiets: {
            create: chiTiets
          }
        },
        include: {
          chiTiets: true,
          baiDang: true
        }
      });

      return donHang;
    });
  }

  async create(data: CreateDonHangDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureProfiles(tx, data.nguoi_mua_id, data.nguoi_ban_id);
      const baiDang = await tx.baiDang.findUnique({
        where: { baidang_id: data.baidang_id },
        select: { so_luong_con_lai: true }
      });

      if (!baiDang) {
        throw new NotFoundException('Bài đăng không tồn tại');
      }

      if (Number(baiDang.so_luong_con_lai) < data.so_luong) {
        throw new BadRequestException('Số lượng đặt mua vượt quá số lượng còn lại trong kho');
      }

      const conLai = Number(baiDang.so_luong_con_lai) - data.so_luong;

      await tx.baiDang.update({
        where: { baidang_id: data.baidang_id },
        data: {
          so_luong_con_lai: conLai,
          trang_thai: conLai <= 0 ? 'da_ban' : undefined
        }
      });

      return tx.donHang.create({ data });
    });
  }

  async findAll() {
    return this.prisma.donHang.findMany({
      include: {
        nguoiMua: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        nguoiBan: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        baiDang: { select: { tieu_de: true, ten_nong_san: true } },
        chiTiets: { include: { phanLoai: true } },
      },
      orderBy: { ngay_tao: 'desc' }
    });
  }

  async findByUser(user_id: number) {
    return this.prisma.donHang.findMany({
      where: {
        OR: [
          { nguoi_mua_id: user_id },
          { nguoi_ban_id: user_id }
        ]
      },
      include: {
        nguoiMua: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        nguoiBan: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        baiDang: { select: { tieu_de: true, ten_nong_san: true, images: true, don_vi_tinh: true } },
        chiTiets: {
          include: { phanLoai: true }
        }
      },
      orderBy: { ngay_tao: 'desc' }
    });
  }

  async findOne(donhang_id: number) {
    const donHang = await this.prisma.donHang.findUnique({
      where: { donhang_id },
      include: {
        nguoiMua: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        nguoiBan: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        baiDang: { select: { tieu_de: true, ten_nong_san: true } },
        chiTiets: { include: { phanLoai: true } },
      },
    });
    if (!donHang) throw new NotFoundException('Đơn hàng không tồn tại');
    return donHang;
  }

  async update(donhang_id: number, data: UpdateDonHangDto) {
    if (data.trang_thai_don === 'da_huy') {
      return this.prisma.$transaction(async (tx) => {
        const existingOrder = await tx.donHang.findUnique({ 
          where: { donhang_id },
          include: { chiTiets: true }
        });
        if (!existingOrder) throw new NotFoundException('Đơn hàng không tồn tại');
        
        // Nếu chuyển từ trạng thái chưa hủy sang hủy, hoàn lại số lượng cho kho
        if (existingOrder.trang_thai_don !== 'da_huy') {
            const baiDang = await tx.baiDang.findUnique({
              where: { baidang_id: existingOrder.baidang_id },
              select: { so_luong_con_lai: true, so_luong_co: true, trang_thai: true }
            });
            
            if (baiDang) {
              const tongSoLuong = existingOrder.chiTiets.reduce((sum: number, item: any) => sum + Number(item.so_luong), 0);
              const conLai = Math.min(Number(baiDang.so_luong_con_lai) + tongSoLuong, Number(baiDang.so_luong_co));
            await tx.baiDang.update({
              where: { baidang_id: existingOrder.baidang_id },
              data: {
                so_luong_con_lai: conLai,
                trang_thai: baiDang.trang_thai === 'da_ban' ? 'dang_ban' : undefined
              }
            });
          }
        }
        
        return tx.donHang.update({
          where: { donhang_id },
          data,
        });
      });
    }

    return this.prisma.donHang.update({
      where: { donhang_id },
      data,
    });
  }

  async remove(donhang_id: number) {
    return this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.donHang.findUnique({ 
        where: { donhang_id },
        include: { chiTiets: true }
      });
      
      // Nếu đơn hàng tồn tại và chưa bị hủy, ta cần hoàn lại số lượng trước khi xóa vĩnh viễn
      if (existingOrder && existingOrder.trang_thai_don !== 'da_huy') {
        const baiDang = await tx.baiDang.findUnique({
          where: { baidang_id: existingOrder.baidang_id },
          select: { so_luong_con_lai: true, so_luong_co: true, trang_thai: true }
        });
        
        if (baiDang) {
          const tongSoLuong = existingOrder.chiTiets.reduce((sum: number, item: any) => sum + Number(item.so_luong), 0);
          const conLai = Math.min(Number(baiDang.so_luong_con_lai) + tongSoLuong, Number(baiDang.so_luong_co));
          await tx.baiDang.update({
            where: { baidang_id: existingOrder.baidang_id },
            data: {
              so_luong_con_lai: conLai,
              trang_thai: baiDang.trang_thai === 'da_ban' ? 'dang_ban' : undefined
            }
          });
        }
      }
      
      return tx.donHang.delete({
        where: { donhang_id },
      });
    });
  }
}
