import { Injectable, NotFoundException } from '@nestjs/common';
import { DanhMucRepository } from './danh-muc.repository';
import { CreateDanhMucDto } from './dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh-muc.dto';

@Injectable()
export class DanhMucService {
  constructor(private readonly repository: DanhMucRepository) {}

  async create(createDto: CreateDanhMucDto) {
    return this.repository.create(createDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const item = await this.repository.findOne(id);
    if (!item) throw new NotFoundException('Danh mục không tồn tại');
    return item;
  }

  async update(id: number, updateDto: UpdateDanhMucDto) {
    await this.findOne(id); // verify exists
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
