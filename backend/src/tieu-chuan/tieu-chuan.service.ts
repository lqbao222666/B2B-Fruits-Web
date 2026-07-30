import { Injectable } from '@nestjs/common';
import { TieuChuanRepository } from './tieu-chuan.repository';
import { CreateTieuChuanDto } from './dto/create-tieu-chuan.dto';
import { UpdateTieuChuanDto } from './dto/update-tieu-chuan.dto';

@Injectable()
export class TieuChuanService {
  constructor(private readonly repository: TieuChuanRepository) {}

  async create(createDto: CreateTieuChuanDto) {
    return this.repository.create(createDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, updateDto: UpdateTieuChuanDto) {
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    return this.repository.remove(id);
  }
}
