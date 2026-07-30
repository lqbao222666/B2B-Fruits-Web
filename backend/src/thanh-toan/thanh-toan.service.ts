import { Injectable } from '@nestjs/common';
import { ThanhToanRepository } from './thanh-toan.repository';
import { CreateThanhToanDto } from './dto/create-thanh-toan.dto';
import { UpdateThanhToanDto } from './dto/update-thanh-toan.dto';

@Injectable()
export class ThanhToanService {
  constructor(private readonly repository: ThanhToanRepository) {}

  create(createDto: CreateThanhToanDto) {
    return this.repository.create(createDto);
  }

  findAll() {
    return this.repository.findAll();
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  findByDonHang(donhang_id: number) {
    return this.repository.findByDonHang(donhang_id);
  }

  async update(id: number, updateDto: UpdateThanhToanDto) {
    await this.repository.findOne(id);
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.repository.findOne(id);
    return this.repository.remove(id);
  }
}
