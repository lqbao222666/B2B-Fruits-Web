import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBaoCaoDto } from './dto/create-bao-cao.dto';
import { UpdateBaoCaoDto } from './dto/update-bao-cao.dto';

@Injectable()
export class BaoCaoRepository implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'LoaiBaoCao' AND e.enumlabel = 'thieu_so_luong') THEN
            ALTER TYPE "LoaiBaoCao" ADD VALUE 'thieu_so_luong';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'LoaiBaoCao' AND e.enumlabel = 'chat_luong_khong_dat') THEN
            ALTER TYPE "LoaiBaoCao" ADD VALUE 'chat_luong_khong_dat';
          END IF;
        END $$;
      `);
    } catch (e) {
      // ignore if already present
    }
  }

  async create(data: CreateBaoCaoDto) {
    const baoCao = await this.prisma.baoCao.create({
      data: {
        ...data,
        ngay_giao_de_xuat: data.ngay_giao_de_xuat ? new Date(data.ngay_giao_de_xuat) : null,
      },
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
        donHang: true,
      },
    });

    // Nếu báo cáo đính kèm đơn hàng, tự động thông báo cho Doanh nghiệp
    if (baoCao.donHang) {
      await this.prisma.thongBao.create({
        data: {
          user_id: baoCao.donHang.nguoi_mua_id,
          tieu_de: `Cảnh báo sự cố từ Nông dân cho Đơn hàng #${baoCao.donHang.ma_don_hang}`,
          noi_dung: `Nông dân đã gửi báo cáo sự cố trước giao hàng (Lý do: ${baoCao.loai === 'thieu_so_luong' ? 'Thiếu số lượng sản lượng' : 'Chất lượng không đạt'}). Admin đang xem xét giải quyết.`,
          loai: 'he_thong',
        },
      });
    }

    return baoCao;
  }

  async findAll() {
    return this.prisma.baoCao.findMany({
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
        donHang: {
          include: {
            baiDang: { select: { tieu_de: true, ten_nong_san: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUser(user_id: number) {
    return this.prisma.baoCao.findMany({
      where: { nguoi_baocao_id: user_id },
      include: {
        nguoiBiBaoCao: { select: { full_name: true } },
        donHang: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.baoCao.findUnique({
      where: { baocao_id: id },
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
        donHang: {
          include: {
            chiTiets: true,
            baiDang: true,
          },
        },
      },
    });
  }

  async update(id: number, data: UpdateBaoCaoDto) {
    const currentReport = await this.findOne(id);

    const updated = await this.prisma.baoCao.update({
      where: { baocao_id: id },
      data,
    });

    // Nếu Admin chuyển trạng thái thành da_xu_ly và báo cáo có liên quan đến Đơn hàng
    if (data.trang_thai === 'da_xu_ly' && currentReport && currentReport.donHang) {
      const donHang = currentReport.donHang;

      if (currentReport.de_xuat === 'gia_han' && currentReport.ngay_giao_de_xuat) {
        // 1. Duyệt Gia hạn: Cập nhật ngay_giao_du_kien của Đơn hàng
        await this.prisma.donHang.update({
          where: { donhang_id: donHang.donhang_id },
          data: { ngay_giao_du_kien: currentReport.ngay_giao_de_xuat },
        });

        // 1.1 Cập nhật loại hình cung cấp và ngày bắt đầu cung cấp của Bài đăng tương ứng
        if (donHang.baidang_id) {
          await this.prisma.baiDang.update({
            where: { baidang_id: donHang.baidang_id },
            data: {
              loai_cung_cap: 'du_kien',
              ngay_bat_dau_cung_cap: new Date(currentReport.ngay_giao_de_xuat),
            },
          });
        }

        // Gửi thông báo cho Doanh nghiệp & Nông dân
        await this.prisma.thongBao.createMany({
          data: [
            {
              user_id: donHang.nguoi_mua_id,
              tieu_de: `Đơn hàng #${donHang.ma_don_hang} đã được gia hạn giao hàng`,
              noi_dung: `Admin đã chấp nhận đề xuất gia hạn từ Nông dân. Ngày giao hàng dự kiến mới: ${new Date(currentReport.ngay_giao_de_xuat).toLocaleDateString('vi-VN')}.`,
              loai: 'he_thong',
            },
            {
              user_id: donHang.nguoi_ban_id,
              tieu_de: `Đề xuất gia hạn cho Đơn hàng #${donHang.ma_don_hang} đã được Admin duyệt`,
              noi_dung: `Admin đã chấp nhận gia hạn ngày giao hàng đến ${new Date(currentReport.ngay_giao_de_xuat).toLocaleDateString('vi-VN')}.`,
              loai: 'he_thong',
            },
          ],
        });
      } else if (currentReport.de_xuat === 'huy_hoan_tien') {
        // 2. Duyệt Hủy & Hoàn tiền: Hủy đơn hàng và CỘNG HOÀN LẠI SỐ LƯỢNG VỀ BÀI ĐĂNG
        await this.prisma.donHang.update({
          where: { donhang_id: donHang.donhang_id },
          data: { trang_thai_don: 'da_huy', ly_do_huy: 'Báo cáo sự cố trước giao hàng (Nông dân gửi)' },
        });

        // Tính tổng số lượng hàng trong đơn để hoàn lại bài đăng
        let tongSoLuongHoan = 0;
        if (donHang.chiTiets && donHang.chiTiets.length > 0) {
          tongSoLuongHoan = donHang.chiTiets.reduce((sum, item) => sum + Number(item.so_luong), 0);
        }

        if (tongSoLuongHoan > 0 && donHang.baidang_id) {
          await this.prisma.baiDang.update({
            where: { baidang_id: donHang.baidang_id },
            data: {
              so_luong_con_lai: {
                increment: tongSoLuongHoan,
              },
            },
          });
        }

        // Gửi thông báo cho Doanh nghiệp & Nông dân
        await this.prisma.thongBao.createMany({
          data: [
            {
              user_id: donHang.nguoi_mua_id,
              tieu_de: `Đơn hàng #${donHang.ma_don_hang} đã được Hủy & Hoàn tiền đặt cọc`,
              noi_dung: `Admin đã duyệt đề xuất hủy đơn & hoàn tiền do Nông dân báo cáo không đủ sản lượng/chất lượng. Tiền cọc đã được xử lý hoàn lại.`,
              loai: 'he_thong',
            },
            {
              user_id: donHang.nguoi_ban_id,
              tieu_de: `Đơn hàng #${donHang.ma_don_hang} đã được Hủy thành công`,
              noi_dung: `Admin đã chấp nhận hủy đơn & hoàn tiền. Số lượng nông sản (${tongSoLuongHoan}) đã được khôi phục về bài đăng để bạn điều chỉnh lại.`,
              loai: 'he_thong',
            },
          ],
        });
      }
    }

    return updated;
  }

  async remove(id: number) {
    return this.prisma.baoCao.delete({
      where: { baocao_id: id },
    });
  }
}
