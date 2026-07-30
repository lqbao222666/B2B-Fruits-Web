import { Injectable } from '@nestjs/common';
import { DanhGiaRepository } from './danh-gia.repository';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { ReplyDanhGiaDto } from './dto/reply-danh-gia.dto';

@Injectable()
export class DanhGiaService {
  constructor(private readonly repository: DanhGiaRepository) {}

  async create(nguoi_danhgia_id: number, data: CreateDanhGiaDto) {
    return this.repository.create(nguoi_danhgia_id, data);
  }

  async reply(danhgia_id: number, nguoi_tra_loi_id: number, data: ReplyDanhGiaDto) {
    return this.repository.reply(danhgia_id, nguoi_tra_loi_id, data);
  }

  async findByBaiDang(baidang_id: number) {
    return this.repository.findByBaiDang(baidang_id);
  }

  async findByNongDan(nguoi_duoc_dg_id: number) {
    return this.repository.findByNongDan(nguoi_duoc_dg_id);
  }
}
