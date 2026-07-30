import { Injectable } from '@nestjs/common';
import { NhuCauRepository } from './nhu-cau.repository';
import { CreateNhuCauDto } from './dto/create-nhu-cau.dto';
import { UpdateNhuCauDto } from './dto/update-nhu-cau.dto';

@Injectable()
export class NhuCauService {
  constructor(private readonly repository: NhuCauRepository) {}

  async create(createDto: CreateNhuCauDto) {
    return this.repository.create(createDto);
  }

  async findAll(query?: { ten_nong_san?: string; tinh_thanh_giao?: string }) {
    return this.repository.findAll(query);
  }

  async findByDoanhNghiep(doanh_nghiep_id: number) {
    return this.repository.findByDoanhNghiep(doanh_nghiep_id);
  }

  async findOne(id: number) {
    const item = await this.repository.findOne(id);
    // Tăng lượt xem mỗi khi có người xem chi tiết
    await this.repository.incrementLuotXem(id);
    return item;
  }

  async update(id: number, updateDto: UpdateNhuCauDto) {
    await this.repository.findOne(id); // Kiểm tra tồn tại
    return this.repository.update(id, updateDto);
  }

  /// Lấy danh sách nhu cầu chưa được thông báo — Admin dùng
  async findChuaThongBao() {
    return this.repository.findChuaThongBao();
  }

  /// Admin đánh dấu đã thông báo cho DN về hàng mới
  async thongBaoHangMoi(nhucau_id: number) {
    await this.repository.findOne(nhucau_id); // Kiểm tra tồn tại
    return this.repository.markDaThongBao(nhucau_id);
  }

  /// Reset cờ thông báo — cho phép admin thông báo lại khi có hàng mới nữa
  async resetThongBao(nhucau_id: number) {
    await this.repository.findOne(nhucau_id);
    return this.repository.resetThongBao(nhucau_id);
  }

  async remove(id: number) {
    await this.repository.findOne(id);
    return this.repository.remove(id);
  }
}
