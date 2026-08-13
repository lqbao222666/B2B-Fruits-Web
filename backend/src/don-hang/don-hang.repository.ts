import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      const dn = await tx.doanhNghiep.findUnique({
        where: { user_id: buyerId },
      });
      if (!dn) {
        const u = await tx.users.findUnique({ where: { user_id: buyerId } });
        if (u) {
          await tx.doanhNghiep.create({
            data: {
              user_id: buyerId,
              ten_cong_ty: u.full_name || 'Doanh Nghiệp',
              tinh_thanh: 'Cần Thơ',
              trang_thai: 'active',
              tong_giao_dich: 0,
            },
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
              tong_giao_dich: 0,
            },
          });
        }
      }
    }
  }

  async findCartItems(ids: number[], user_id: number) {
    const numericIds = (ids || []).map((id) => Number(id));
    return this.prisma.gioHang.findMany({
      where: {
        id: { in: numericIds },
        user_id: Number(user_id),
      },
      include: {
        phanLoai: true,
        baiDang: true,
      },
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
          where: { phanloai_id },
        });

        if (!phanLoai) {
          throw new BadRequestException(
            `Phân loại ${phanloai_id} không tồn tại`,
          );
        }

        if (Number(phanLoai.so_luong_con_lai) < so_luong) {
          throw new BadRequestException(
            `Sản phẩm ${phanLoai.ten_phan_loai} không đủ số lượng tồn kho`,
          );
        }

        const thanhTien = so_luong * Number(phanLoai.gia);
        tongTienHang += thanhTien;
        totalOrderedQty += so_luong;

        chiTiets.push({
          phanloai_id: phanloai_id,
          so_luong: so_luong,
          don_gia: phanLoai.gia,
          thanh_tien: thanhTien,
        });

        // Trừ tồn kho phân loại
        await tx.phanLoaiSanPham.update({
          where: { phanloai_id: phanloai_id },
          data: {
            so_luong_con_lai: Number(phanLoai.so_luong_con_lai) - so_luong,
          },
        });
      }

      // Trừ tổng tồn kho bài đăng tương ứng
      const baiDang = await tx.baiDang.findUnique({
        where: { baidang_id: numericBaiDangId },
        select: {
          so_luong_con_lai: true,
          so_luong_co: true,
          don_vi_tinh: true,
          ten_nong_san: true,
        },
      });
      let isLowStockAlert = false;
      let conLai = 0;
      if (baiDang) {
        conLai = Math.max(
          0,
          Number(baiDang.so_luong_con_lai) - totalOrderedQty,
        );
        await tx.baiDang.update({
          where: { baidang_id: numericBaiDangId },
          data: {
            so_luong_con_lai: conLai,
            trang_thai: conLai === 0 ? 'da_ban' : undefined,
          },
        });

        if (conLai < Number(baiDang.so_luong_co) / 2) {
          isLowStockAlert = true;
        }
      }

      const tongTien = tongTienHang + shippingFee;
      const tienCoc = tongTien * 0.15; // Cọc 15% tổng đơn

      const uniqueOrderCode =
        'DH' + Date.now() + Math.floor(1000 + Math.random() * 9000);

      // Tạo đơn hàng với trạng thái cọc đã thanh toán (Enterprise cọc 15%, Farmer miễn phí vận chuyển cho đơn bài đăng thường)
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
          trang_thai_don: 'dang_giao',
          trang_thai_tt: 'da_thanh_toan',
          nong_dan_da_tt_vanchuyen: true,
          doanh_nghiep_da_tt_coc: true,
          chiTiets: {
            create: chiTiets,
          },
        },
        include: {
          chiTiets: true,
          baiDang: true,
        },
      });

      // Gửi thông báo khẩn tới Admin để ĐIỀU XE B2B cho đơn hàng bài đăng này!
      const adminRole = await tx.vaiTro.findFirst({
        where: { ten_vai_tro: 'admin' },
      });
      if (adminRole) {
        const adminUsers = await tx.users.findMany({
          where: { role_id: adminRole.role_id },
        });
        for (const admin of adminUsers) {
          await tx.thongBao.create({
            data: {
              user_id: admin.user_id,
              loai: 'don_hang',
              tieu_de: '🚨 Đơn B2B bài đăng mới - CẦN ĐIỀU XE VẬN CHUYỂN!',
              noi_dung: `Đơn hàng #${uniqueOrderCode} từ bài đăng nông sản đã cọc 15%. Admin vui lòng vào Quản lý Đơn hàng để ĐIỀU XE B2B đi giao hàng!`,
              ref_id: donHang.donhang_id,
              ref_type: 'don_hang',
            },
          });
        }
      }

      // Tạo thông báo
      const buyerInfo = await tx.users.findUnique({
        where: { user_id: numericUserId },
      });
      const buyerName = buyerInfo
        ? buyerInfo.full_name || 'Doanh Nghiệp'
        : 'Doanh Nghiệp';

      await tx.thongBao.create({
        data: {
          user_id: numericUserId,
          loai: 'don_hang',
          tieu_de: 'Xác nhận đặt cọc 15%',
          noi_dung: `Xác nhận đặt cọc 15% (${tienCoc.toLocaleString()} ₫) cho đơn hàng ${uniqueOrderCode} - Sản phẩm: ${baiDang?.ten_nong_san}.`,
          ref_id: donHang.donhang_id,
          ref_type: 'don_hang',
        },
      });

      await tx.thongBao.create({
        data: {
          user_id: numericSellerId,
          loai: 'don_hang',
          tieu_de: 'Có đơn hàng đặt cọc mới!',
          noi_dung: `Doanh nghiệp ${buyerName} đã đặt cọc 15% (${tienCoc.toLocaleString()} ₫) cho đơn hàng ${uniqueOrderCode} - Sản phẩm: ${baiDang?.ten_nong_san}.`,
          ref_id: donHang.donhang_id,
          ref_type: 'don_hang',
        },
      });

      if (isLowStockAlert && baiDang) {
        const existingAlert = await tx.thongBao.findFirst({
          where: {
            user_id: numericSellerId,
            ref_id: numericBaiDangId,
            ref_type: 'bai_dang_low_stock',
          },
        });
        if (!existingAlert) {
          await tx.thongBao.create({
            data: {
              user_id: numericSellerId,
              loai: 'bai_dang',
              tieu_de: `⚠️ Cảnh báo tồn kho: ${baiDang.ten_nong_san}`,
              noi_dung: `Sản phẩm "${baiDang.ten_nong_san}" của bạn hiện còn ${conLai} ${baiDang.don_vi_tinh} (đã giảm xuống dưới 50% so với ban đầu). Hãy cập nhật thêm số lượng nếu còn hàng.`,
              ref_id: numericBaiDangId,
              ref_type: 'bai_dang_low_stock',
            },
          });
        }
      }

      return donHang;
    });
  }

  async create(data: CreateDonHangDto) {
    return this.prisma.$transaction(async (tx) => {
      await this.ensureProfiles(tx, data.nguoi_mua_id, data.nguoi_ban_id);
      const baiDang = await tx.baiDang.findUnique({
        where: { baidang_id: data.baidang_id },
        select: { so_luong_con_lai: true },
      });

      if (!baiDang) {
        throw new NotFoundException('Bài đăng không tồn tại');
      }

      if (Number(baiDang.so_luong_con_lai) < data.so_luong) {
        throw new BadRequestException(
          'Số lượng đặt mua vượt quá số lượng còn lại trong kho',
        );
      }

      const conLai = Number(baiDang.so_luong_con_lai) - data.so_luong;

      await tx.baiDang.update({
        where: { baidang_id: data.baidang_id },
        data: {
          so_luong_con_lai: conLai,
          trang_thai: conLai <= 0 ? 'da_ban' : undefined,
        },
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
      orderBy: { ngay_tao: 'desc' },
    });
  }

  async findByUser(user_id: number) {
    return this.prisma.donHang.findMany({
      where: {
        OR: [{ nguoi_mua_id: user_id }, { nguoi_ban_id: user_id }],
      },
      include: {
        nguoiMua: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        nguoiBan: {
          include: { user: { select: { full_name: true, phone: true } } },
        },
        baiDang: {
          select: {
            tieu_de: true,
            ten_nong_san: true,
            images: true,
            don_vi_tinh: true,
          },
        },
        chiTiets: {
          include: { phanLoai: true },
        },
        danhGia: true,
      },
      orderBy: { ngay_tao: 'desc' },
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
        danhGia: true,
      },
    });
    if (!donHang) throw new NotFoundException('Đơn hàng không tồn tại');
    return donHang;
  }

  async update(donhang_id: number, data: UpdateDonHangDto) {
    if (data.trang_thai_don === 'hoan_thanh') {
      return this.prisma.$transaction(async (tx) => {
        const donHang = await tx.donHang.update({
          where: { donhang_id },
          data,
          include: { baiDang: true },
        });

        await tx.thongBao.create({
          data: {
            user_id: donHang.nguoi_mua_id,
            loai: 'don_hang',
            tieu_de: 'Đơn hàng hoàn tất',
            noi_dung: `Đơn hàng ${donHang.ma_don_hang} đã hoàn tất thành công. Tổng thanh toán: ${Number(donHang.tong_tien).toLocaleString()} ₫.`,
            ref_id: donhang_id,
            ref_type: 'don_hang',
          },
        });

        const thucNhan =
          Number(donHang.tong_tien) - (Number(donHang.phi_van_chuyen) || 0);
        await tx.thongBao.create({
          data: {
            user_id: donHang.nguoi_ban_id,
            loai: 'don_hang',
            tieu_de: 'Giao dịch hoàn tất!',
            noi_dung: `Giao dịch đơn hàng ${donHang.ma_don_hang} đã hoàn tất! Bạn nhận được +${thucNhan.toLocaleString()} ₫ (đã trừ ${Number(donHang.phi_van_chuyen || 0).toLocaleString()} ₫ phí vận chuyển).`,
            ref_id: donhang_id,
            ref_type: 'don_hang',
          },
        });

        return donHang;
      });
    }

    if (data.trang_thai_don === 'da_huy') {
      return this.prisma.$transaction(async (tx) => {
        const existingOrder = await tx.donHang.findUnique({
          where: { donhang_id },
          include: { chiTiets: true },
        });
        if (!existingOrder)
          throw new NotFoundException('Đơn hàng không tồn tại');

        // Nếu chuyển từ trạng thái chưa hủy sang hủy, hoàn lại số lượng cho kho
        if (existingOrder.trang_thai_don !== 'da_huy') {
          const baiDang = await tx.baiDang.findUnique({
            where: { baidang_id: existingOrder.baidang_id },
            select: {
              so_luong_con_lai: true,
              so_luong_co: true,
              trang_thai: true,
            },
          });

          if (baiDang) {
            const tongSoLuong = existingOrder.chiTiets.reduce(
              (sum: number, item: any) => sum + Number(item.so_luong),
              0,
            );
            const conLai = Math.min(
              Number(baiDang.so_luong_con_lai) + tongSoLuong,
              Number(baiDang.so_luong_co),
            );
            await tx.baiDang.update({
              where: { baidang_id: existingOrder.baidang_id },
              data: {
                so_luong_con_lai: conLai,
                trang_thai:
                  baiDang.trang_thai === 'da_ban' ? 'dang_ban' : undefined,
              },
            });
          }
        }

        return tx.donHang.update({
          where: { donhang_id },
          data,
        });
      });
    }

    const existing = await this.prisma.donHang.findUnique({
      where: { donhang_id },
      include: { chiTiets: true },
    });

    if (existing) {
      const farmerPaid =
        data.nong_dan_da_tt_vanchuyen !== undefined
          ? data.nong_dan_da_tt_vanchuyen
          : existing.nong_dan_da_tt_vanchuyen;
      const enterprisePaid =
        data.doanh_nghiep_da_tt_coc !== undefined
          ? data.doanh_nghiep_da_tt_coc
          : existing.doanh_nghiep_da_tt_coc;

      // Trừ số lượng Nhu Cầu Thu Mua khi Doanh nghiệp vừa thanh toán Cọc 15%
      if (
        data.doanh_nghiep_da_tt_coc === true &&
        !existing.doanh_nghiep_da_tt_coc
      ) {
        if (existing.ghi_chu && existing.ghi_chu.includes('[NHUCAU_ID:')) {
          const match = existing.ghi_chu.match(/\[NHUCAU_ID:\s*(\d+)\]/);
          if (match && match[1]) {
            const nhucau_id = Number(match[1]);
            const tongSoLuong = existing.chiTiets.reduce(
              (sum: number, item: any) => sum + Number(item.so_luong),
              0,
            );

            const nhuCau = await this.prisma.nhuCauThuMua.findUnique({
              where: { nhucau_id },
            });
            if (nhuCau) {
              const newNeed = Math.max(
                0,
                Number(nhuCau.so_luong_can) - tongSoLuong,
              );
              await this.prisma.nhuCauThuMua.update({
                where: { nhucau_id },
                data: {
                  so_luong_can: newNeed,
                  trang_thai: newNeed <= 0 ? 'du_so_luong' : nhuCau.trang_thai,
                },
              });
            }
          }
        }
      }

      // Nếu Doanh nghiệp đã trả cọc 15%, đơn hàng tiến hành giao
      if (
        enterprisePaid &&
        (existing.trang_thai_don === 'cho_xac_nhan' ||
          existing.trang_thai_don === 'da_xac_nhan')
      ) {
        data.trang_thai_don = 'dang_giao';
        data.trang_thai_tt = 'da_thanh_toan';

        await this.prisma.thongBao.create({
          data: {
            user_id: existing.nguoi_mua_id,
            loai: 'don_hang',
            tieu_de: '🚚 Xe vận chuyển B2B đã được kích hoạt!',
            noi_dung: `Doanh nghiệp đã hoàn tất thanh toán cọc 15%! Đội xe B2B đang tới địa chỉ Nông dân lấy hàng vận chuyển đến Doanh nghiệp.`,
            ref_id: donhang_id,
            ref_type: 'don_hang',
          },
        });
        await this.prisma.thongBao.create({
          data: {
            user_id: existing.nguoi_ban_id,
            loai: 'don_hang',
            tieu_de: '🚚 Xe vận chuyển B2B đang tới lấy hàng!',
            noi_dung: `Đơn hàng #${existing.ma_don_hang} đã hoàn tất đặt cọc! Xe B2B đang trên đường tới kho của bạn để nhận hàng.`,
            ref_id: donhang_id,
            ref_type: 'don_hang',
          },
        });

        // Gửi thông báo khẩn tới Admin để ĐIỀU XE B2B!
        const adminRole = await this.prisma.vaiTro.findFirst({
          where: { ten_vai_tro: 'admin' },
        });
        if (adminRole) {
          const adminUsers = await this.prisma.users.findMany({
            where: { role_id: adminRole.role_id },
          });
          for (const admin of adminUsers) {
            await this.prisma.thongBao.create({
              data: {
                user_id: admin.user_id,
                loai: 'don_hang',
                tieu_de: '🚨 Đơn B2B đủ điều kiện - CẦN ĐIỀU XE VẬN CHUYỂN!',
                noi_dung: `Đơn hàng #${existing.ma_don_hang} đã cọc 15%. Admin vui lòng vào Quản lý Đơn hàng để ĐIỀU XE B2B đến kho Nông dân lấy hàng!`,
                ref_id: donhang_id,
                ref_type: 'don_hang',
              },
            });
          }
        }
      }

      // Nếu Admin bấm xác nhận Xe B2B đã giao tới nơi
      if (
        data.trang_thai_don === 'da_giao_hang' &&
        existing.trang_thai_don !== 'da_giao_hang'
      ) {
        await this.prisma.thongBao.create({
          data: {
            user_id: existing.nguoi_mua_id,
            loai: 'don_hang',
            tieu_de: '📍 Xe vận chuyển B2B đã giao hàng đến nơi!',
            noi_dung: `Hàng nông sản đơn #${existing.ma_don_hang} đã tới địa chỉ nhận. Doanh nghiệp vui lòng thanh toán 85% số tiền còn lại và bấm 'Xác nhận hoàn tất giao dịch' để nhận hàng!`,
            ref_id: donhang_id,
            ref_type: 'don_hang',
          },
        });
      }
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
        include: { chiTiets: true },
      });

      // Nếu đơn hàng tồn tại và chưa bị hủy, ta cần hoàn lại số lượng trước khi xóa vĩnh viễn
      if (existingOrder && existingOrder.trang_thai_don !== 'da_huy') {
        const baiDang = await tx.baiDang.findUnique({
          where: { baidang_id: existingOrder.baidang_id },
          select: {
            so_luong_con_lai: true,
            so_luong_co: true,
            trang_thai: true,
          },
        });

        if (baiDang) {
          const tongSoLuong = existingOrder.chiTiets.reduce(
            (sum: number, item: any) => sum + Number(item.so_luong),
            0,
          );
          const conLai = Math.min(
            Number(baiDang.so_luong_con_lai) + tongSoLuong,
            Number(baiDang.so_luong_co),
          );
          await tx.baiDang.update({
            where: { baidang_id: existingOrder.baidang_id },
            data: {
              so_luong_con_lai: conLai,
              trang_thai:
                baiDang.trang_thai === 'da_ban' ? 'dang_ban' : undefined,
            },
          });
        }
      }

      return tx.donHang.delete({
        where: { donhang_id },
      });
    });
  }
}
