import { Injectable, NotFoundException } from '@nestjs/common';
import { TinNhanRepository } from './tin-nhan.repository';
import { CreateTinNhanDto } from './dto/create-tin-nhan.dto';
import { UpdateTinNhanDto } from './dto/update-tin-nhan.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class TinNhanService {
  constructor(
    private readonly repository: TinNhanRepository,
    private readonly gateway: AppGateway,
  ) {}

  async create(createDto: CreateTinNhanDto) {
    const message = await this.repository.create(createDto);
    this.gateway.sendToUser(createDto.nguoi_nhan_id, 'new_message', message);
    return message;
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

  async countUnread(userId: number) {
    return this.repository.countUnread(userId);
  }

  async searchUserByPhone(phone: string) {
    return this.repository.searchUserByPhone(phone);
  }

  async searchUsers(query: string, currentUserId?: number) {
    return this.repository.searchUsers(query, currentUserId);
  }

  async getUserDetail(userId: number) {
    return this.repository.getUserDetail(userId);
  }
}
