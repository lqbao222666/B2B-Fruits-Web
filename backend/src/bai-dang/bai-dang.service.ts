import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaiDangRepository } from './bai-dang.repository';
import { CreateBaiDangDto } from './dto/create-bai-dang.dto';
import { UpdateBaiDangDto } from './dto/update-bai-dang.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BaiDangService implements OnModuleInit {
  constructor(
    private readonly repository: BaiDangRepository,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      await this.prisma.baiDang.updateMany({
        where: { trang_thai: 'cho_duyet' },
        data: { trang_thai: 'dang_ban' },
      });
    } catch (e) {
      // ignore
    }
  }

  /// Nông Dân đăng bài với giá tự định — hệ thống kiểm tra tự động
  async create(createDto: CreateBaiDangDto) {
    return this.repository.create(createDto);
  }

  /// Danh sách bài đang bán — công khai (DN, nông dân đều xem được)
  async findAll(filters?: {
    tinh_thanh?: string;
    danhmuc_id?: number;
    ten_nong_san?: string;
    gia_min?: number;
    gia_max?: number;
  }) {
    return this.repository.findAll(filters);
  }

  /// Admin xem tất cả bài kể cả cho_duyet, da_ban, an
  async findAllForAdmin(filters?: { trang_thai?: string }) {
    return this.repository.findAllForAdmin(filters);
  }

  /// Nông dân xem bài đăng của chính mình
  async findByNongDan(nguoi_dang_id: number) {
    return this.repository.findByNongDan(nguoi_dang_id);
  }

  async findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, updateDto: UpdateBaiDangDto) {
    await this.findOne(id); // verify exists
    return this.repository.update(id, updateDto);
  }

  /// Admin ẩn bài đăng vi phạm nội dung
  async anBaiDang(id: number, ly_do_tu_choi: string) {
    return this.repository.anBaiDang(id, ly_do_tu_choi);
  }

  /// Nông dân / Admin mở lại bài đăng đang ẩn
  async moLaiBaiDang(id: number) {
    return this.repository.moLaiBaiDang(id);
  }

  /// Hệ thống trừ số lượng sau đơn hàng (gọi từ DonHangService)
  async truSoLuong(baidang_id: number, so_luong_ban: number) {
    return this.repository.truSoLuong(baidang_id, so_luong_ban);
  }

  async remove(id: number, nguoi_dang_id: number) {
    return this.repository.remove(id, nguoi_dang_id);
  }

  async ngungCungCap(id: number, nguoi_dang_id: number) {
    return this.repository.ngungCungCap(id, nguoi_dang_id);
  }

  async xoaBaiDang(id: number, nguoi_dang_id: number) {
    return this.repository.xoaBaiDang(id, nguoi_dang_id);
  }
}
