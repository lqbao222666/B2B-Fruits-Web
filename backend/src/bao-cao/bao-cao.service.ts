import { Injectable, NotFoundException } from '@nestjs/common';
import { BaoCaoRepository } from './bao-cao.repository';
import { CreateBaoCaoDto } from './dto/create-bao-cao.dto';
import { UpdateBaoCaoDto } from './dto/update-bao-cao.dto';

@Injectable()
export class BaoCaoService {
  constructor(private readonly repository: BaoCaoRepository) {}

  async create(createDto: CreateBaoCaoDto) {
    return this.repository.create(createDto);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findByUser(user_id: number) {
    return this.repository.findByUser(user_id);
  }

  async findOne(id: number) {
    const baoCao = await this.repository.findOne(id);
    if (!baoCao) throw new NotFoundException('Báo cáo không tồn tại');
    return baoCao;
  }

  async update(id: number, updateDto: UpdateBaoCaoDto) {
    await this.findOne(id);
    return this.repository.update(id, updateDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repository.remove(id);
  }
}
