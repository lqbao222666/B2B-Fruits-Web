import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { ReplyDanhGiaDto } from './dto/reply-danh-gia.dto';

@Injectable()
export class DanhGiaRepository {
  constructor(private prisma: PrismaService) {}

  async create(nguoi_danhgia_id: number, data: CreateDanhGiaDto) {
    return this.prisma.$transaction(async (tx) => {
      const donhang_id = Number(data.donhang_id);
      const baidang_id = Number(data.baidang_id);
      const nguoi_duoc_dg_id = Number(data.nguoi_duoc_dg_id);
      const numericNguoiDanhGiaId = Number(nguoi_danhgia_id);

      if (isNaN(numericNguoiDanhGiaId) || numericNguoiDanhGiaId <= 0) {
        throw new BadRequestException(
          'Xác thực tài khoản người đánh giá thất bại',
        );
      }

      // 1. Kiểm tra đơn hàng có tồn tại và đã hoàn thành chưa
      const donHang = await tx.donHang.findUnique({ where: { donhang_id } });
      if (!donHang) throw new NotFoundException('Đơn hàng không tồn tại');
      if (donHang.trang_thai_don !== 'hoan_thanh') {
        throw new BadRequestException(
          'Chỉ có thể đánh giá khi đơn hàng đã hoàn thành',
        );
      }

      if (donHang.nguoi_mua_id !== numericNguoiDanhGiaId) {
        throw new BadRequestException(
          'Bạn chỉ có quyền đánh giá đơn hàng do mình mua',
        );
      }

      // 2. Kiểm tra xem đã đánh giá chưa
      const existing = await tx.danhGia.findUnique({ where: { donhang_id } });
      if (existing) {
        throw new BadRequestException('Đơn hàng này đã được đánh giá');
      }

      // 3. Tạo đánh giá
      const danhGia = await tx.danhGia.create({
        data: {
          donhang_id,
          baidang_id,
          nguoi_danhgia_id: numericNguoiDanhGiaId,
          nguoi_duoc_dg_id,
          diem_tong: Number(data.diem_tong),
          diem_chat_luong: data.diem_chat_luong
            ? Number(data.diem_chat_luong)
            : null,
          diem_dung_hen: data.diem_dung_hen ? Number(data.diem_dung_hen) : null,
          diem_thai_do: data.diem_thai_do ? Number(data.diem_thai_do) : null,
          nhan_xet: data.nhan_xet,
          images: data.images ?? [],
        },
      });

      // 4. Tính toán lại điểm trung bình cho Bài Đăng
      const baidangAgg = await tx.danhGia.aggregate({
        where: { baidang_id },
        _avg: { diem_tong: true },
      });
      if (
        baidangAgg._avg.diem_tong !== null &&
        baidangAgg._avg.diem_tong !== undefined
      ) {
        await tx.baiDang.update({
          where: { baidang_id },
          data: { diem_trung_binh: baidangAgg._avg.diem_tong },
        });
      }

      // 5. Tính toán lại điểm trung bình cho Nông Dân
      const nongDanAgg = await tx.danhGia.aggregate({
        where: { nguoi_duoc_dg_id },
        _avg: { diem_tong: true },
      });
      if (
        nongDanAgg._avg.diem_tong !== null &&
        nongDanAgg._avg.diem_tong !== undefined
      ) {
        const ndExists = await tx.nongDan.findUnique({
          where: { user_id: nguoi_duoc_dg_id },
        });
        if (ndExists) {
          await tx.nongDan.update({
            where: { user_id: nguoi_duoc_dg_id },
            data: { diem_trung_binh: nongDanAgg._avg.diem_tong },
          });
        }
      }

      return danhGia;
    });
  }

  async reply(
    danhgia_id: number,
    nguoi_tra_loi_id: number,
    data: ReplyDanhGiaDto,
  ) {
    const id = Number(danhgia_id);
    const existing = await this.prisma.danhGia.findUnique({
      where: { danhgia_id: id },
    });
    if (!existing) throw new NotFoundException('Đánh giá không tồn tại');

    if (existing.nguoi_duoc_dg_id !== Number(nguoi_tra_loi_id)) {
      throw new BadRequestException('Bạn không có quyền trả lời đánh giá này');
    }

    return this.prisma.danhGia.update({
      where: { danhgia_id: id },
      data: { tra_loi: data.tra_loi },
    });
  }

  async findByBaiDang(baidang_id: number) {
    return this.prisma.danhGia.findMany({
      where: { baidang_id: Number(baidang_id) },
      include: {
        nguoiDanhGia: { select: { full_name: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByNongDan(nguoi_duoc_dg_id: number) {
    return this.prisma.danhGia.findMany({
      where: { nguoi_duoc_dg_id: Number(nguoi_duoc_dg_id) },
      include: {
        nguoiDanhGia: { select: { full_name: true, avatar_url: true } },
        baiDang: {
          select: { tieu_de: true, ten_nong_san: true, images: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
