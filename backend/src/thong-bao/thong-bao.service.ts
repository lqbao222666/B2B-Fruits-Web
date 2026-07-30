import { Injectable } from '@nestjs/common';
import { ThongBaoRepository } from './thong-bao.repository';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';

@Injectable()
export class ThongBaoService {
  constructor(private readonly repository: ThongBaoRepository) {}

  create(createDto: CreateThongBaoDto) {
    return this.repository.create(createDto);
  }

  findByUser(user_id: number) {
    return this.repository.findByUser(user_id);
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  async update(id: number, updateDto: UpdateThongBaoDto) {
    await this.repository.findOne(id);
    return this.repository.update(id, updateDto);
  }

  async markAsRead(id: number) {
    await this.repository.findOne(id);
    return this.repository.markAsRead(id);
  }

  async remove(id: number) {
    await this.repository.findOne(id);
    return this.repository.remove(id);
  }
}
