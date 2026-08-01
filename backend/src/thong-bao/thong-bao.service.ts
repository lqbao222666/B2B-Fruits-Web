import { Injectable } from '@nestjs/common';
import { ThongBaoRepository } from './thong-bao.repository';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class ThongBaoService {
  constructor(
    private readonly repository: ThongBaoRepository,
    private readonly gateway: AppGateway,
  ) {}

  async create(createDto: CreateThongBaoDto) {
    const thongBao = await this.repository.create(createDto);
    this.gateway.sendToUser(createDto.user_id, 'new_notification', thongBao);
    return thongBao;
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

  async markAllAsRead(user_id: number) {
    return this.repository.markAllAsRead(user_id);
  }

  async remove(id: number) {
    await this.repository.findOne(id);
    return this.repository.remove(id);
  }
}
