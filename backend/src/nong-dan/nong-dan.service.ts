import { Injectable, NotFoundException } from '@nestjs/common';
import { NongDanRepository } from './nong-dan.repository';
import { CreateNongDanDto } from './dto/create-nong-dan.dto';
import { UpdateNongDanDto } from './dto/update-nong-dan.dto';

@Injectable()
export class NongDanService {
  constructor(private readonly repository: NongDanRepository) {}

  async create(createDto: CreateNongDanDto) {
    return this.repository.create(createDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    const item = await this.repository.findOne(id);
    if (!item) throw new NotFoundException('Hồ sơ nông dân không tồn tại');
    return item;
  }

  async update(id: number, updateDto: UpdateNongDanDto) {
    await this.findOne(id); // verify exists
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
