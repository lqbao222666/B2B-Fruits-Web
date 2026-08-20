import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ThuongLuongRepository } from './thuong-luong.repository';
import { CreateThuongLuongDto } from './dto/create-thuong-luong.dto';
import { PhanHoiThuongLuongDto } from './dto/phan-hoi-thuong-luong.dto';
import { ThongBaoService } from '../thong-bao/thong-bao.service';
import { PrismaService } from '../prisma/prisma.service';
import { DonHangService } from '../don-hang/don-hang.service'; // We might use it, or just use Prisma

@Injectable()
export class ThuongLuongService {
  constructor(
    private readonly repository: ThuongLuongRepository,
    private readonly thongBaoService: ThongBaoService,
    private readonly prisma: PrismaService,
  ) {}

  async create(createDto: CreateThuongLuongDto) {
    const created = await this.repository.create(createDto);

    // Notify farmer
    await this.thongBaoService.create({
      user_id: (created as any).baiDang.nguoi_dang_id,
      loai: 'bai_dang',
      tieu_de: 'Có yêu cầu thương lượng giá mới',
      noi_dung: `Doanh nghiệp ${(created as any).doanhNghiep.ten_cong_ty} vừa gửi yêu cầu thương lượng mua ${(created as any).chiTiets.length} loại sản phẩm ${(created as any).baiDang.ten_nong_san}.`,
      ref_id: created.thuongluong_id,
      ref_type: 'thuong_luong_bai_dang',
    });

    return created;
  }

  findByBaiDang(id: number) {
    return this.repository.findByBaiDang(id);
  }

  findByDoanhNghiep(id: number) {
    return this.repository.findByDoanhNghiep(id);
  }

  findByNongDan(id: number) {
    return this.repository.findByNongDan(id);
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  async phanHoi(id: number, dto: PhanHoiThuongLuongDto) {
    // Prevent replying to already unified/rejected/cancelled negotiations
    const current = await this.repository.findOne(id);
    if (['da_thong_nhat', 'tu_choi', 'da_huy'].includes(current.trang_thai)) {
      throw new BadRequestException('Không thể phản hồi yêu cầu đã đóng');
    }

    const updated = await this.repository.phanHoi(id, dto);

    // Notification logic
    const isFarmerReplying = dto.sender_role === 'nong_dan';
    const recipient_id = isFarmerReplying
      ? updated.doanh_nghiep_id
      : updated.baiDang.nguoi_dang_id;
    const recipient_name = isFarmerReplying
      ? 'Nông dân'
      : 'Doanh nghiệp';

    let actionText = 'đã phản hồi yêu cầu';
    if (dto.trang_thai === 'da_thong_nhat') {
      actionText = 'đã đồng ý với yêu cầu';
    } else if (dto.trang_thai === 'tu_choi') {
      actionText = 'đã từ chối yêu cầu';
    }

    await this.thongBaoService.create({
      user_id: recipient_id,
      loai: 'bai_dang',
      tieu_de: `Phản hồi thương lượng giá`,
      noi_dung: `${recipient_name} ${actionText} thương lượng mua ${updated.baiDang.ten_nong_san}.`,
      ref_id: updated.thuongluong_id,
      ref_type: 'thuong_luong_bai_dang',
    });

    // If unified (da_thong_nhat), auto-create DonHang
    if (dto.trang_thai === 'da_thong_nhat') {
      await this.autoCreateOrder(updated);
    }

    return updated;
  }

  remove(id: number) {
    return this.repository.remove(id);
  }

  private async autoCreateOrder(thuongLuong: any) {
    // Generate order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
    const ma_don_hang = `B2B${dateStr}${uniqueSuffix}`;
    let tong_tien = 0;
    const chiTietsCreate = thuongLuong.chiTiets.map((ct: any) => {
      const thanh_tien = Number(ct.so_luong_mua) * Number(ct.gia_de_xuat);
      tong_tien += thanh_tien;
      return {
        phanloai_id: ct.phanloai_id,
        ten_san_pham: `${thuongLuong.baiDang.ten_nong_san} - ${ct.phanLoai?.ten_phan_loai || ''}`,
        so_luong: ct.so_luong_mua,
        don_gia: ct.gia_de_xuat,
        thanh_tien: thanh_tien,
      };
    });

    const tien_coc = tong_tien * 0.15; // 15% deposit

    const orderData: any = {
      ma_don_hang,
      nguoi_mua_id: thuongLuong.doanh_nghiep_id,
      nguoi_ban_id: thuongLuong.baiDang.nguoi_dang_id,
      baidang_id: thuongLuong.baidang_id,
      thuongluong_id: thuongLuong.thuongluong_id,
      tong_tien: tong_tien,
      tien_coc: tien_coc,
      dia_chi_giao: thuongLuong.dia_chi_giao || '',
      tinh_thanh_giao: thuongLuong.tinh_thanh_giao || '',
      hinh_thuc_giao_hang: thuongLuong.hinh_thuc_giao_hang,
      trang_thai_don: 'cho_xac_nhan', // which means cho_thanh_toan_coc
      chiTiets: {
        create: chiTietsCreate
      }
    };

    // Use transaction to create order
    await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.donHang.create({
        data: orderData
      });
      
      // Notify both parties about new order
      await this.thongBaoService.create({
        user_id: thuongLuong.doanh_nghiep_id,
        loai: 'don_hang',
        tieu_de: 'Đơn hàng mới đã được tạo',
        noi_dung: `Đơn hàng ${ma_don_hang} đã được tạo thành công từ thương lượng. Vui lòng thanh toán cọc.`,
        ref_id: newOrder.donhang_id,
        ref_type: 'don_hang'
      });
      await this.thongBaoService.create({
        user_id: thuongLuong.baiDang.nguoi_dang_id,
        loai: 'don_hang',
        tieu_de: 'Đơn hàng mới đã được tạo',
        noi_dung: `Đơn hàng ${ma_don_hang} đã được tạo thành công từ thương lượng. Doanh nghiệp đang chờ thanh toán cọc.`,
        ref_id: newOrder.donhang_id,
        ref_type: 'don_hang'
      });
    });
  }
}
