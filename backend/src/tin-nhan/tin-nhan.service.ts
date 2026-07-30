import { Injectable, NotFoundException } from '@nestjs/common';
import { TinNhanRepository } from './tin-nhan.repository';
import { CreateTinNhanDto } from './dto/create-tin-nhan.dto';
import { UpdateTinNhanDto } from './dto/update-tin-nhan.dto';

@Injectable()
export class TinNhanService {
  constructor(private readonly repository: TinNhanRepository) {}

  async create(createDto: CreateTinNhanDto) {
    return this.repository.create(createDto);
  }

  // Lấy danh sách cuộc trò chuyện gần đây
  async getConversations(userId: number) {
    return this.repository.getRecentConversations(userId);
  }

  // Lấy lịch sử chat với một partner cụ thể
  async getConversation(userId: number, partnerId: number) {
    return this.repository.getConversation(userId, partnerId);
  }

  async findOne(id: number) {
    const tinNhan = await this.repository.findOne(id);
    if (!tinNhan) throw new NotFoundException('Tin nhắn không tồn tại');
    return tinNhan;
  }

  async markAsRead(id: number) {
    await this.findOne(id);
    return this.repository.markAsRead(id);
  }

  async update(id: number, updateDto: UpdateTinNhanDto) {
    await this.findOne(id);
    return this.repository.update(id, updateDto);
  }
}
