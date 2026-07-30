import { Injectable, NotFoundException } from '@nestjs/common';
import { DoanhNghiepRepository } from './doanh-nghiep.repository';
import { CreateDoanhNghiepDto } from './dto/create-doanh-nghiep.dto';
import { UpdateDoanhNghiepDto } from './dto/update-doanh-nghiep.dto';

@Injectable()
export class DoanhNghiepService {
  constructor(private readonly repository: DoanhNghiepRepository) {}

  async create(createDto: CreateDoanhNghiepDto) {
    return this.repository.create(createDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const item = await this.repository.findOne(id);
    if (!item) throw new NotFoundException('Doanh nghiệp không tồn tại');
    return item;
  }

  async update(id: number, updateDto: UpdateDoanhNghiepDto) {
    await this.findOne(id); // verify exists
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
