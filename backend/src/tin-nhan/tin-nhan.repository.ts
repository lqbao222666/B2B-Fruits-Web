import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTinNhanDto } from './dto/create-tin-nhan.dto';
import { UpdateTinNhanDto } from './dto/update-tin-nhan.dto';

@Injectable()
export class TinNhanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTinNhanDto) {
    return this.prisma.tinNhan.create({
      data: {
        nguoi_gui_id: Number(data.nguoi_gui_id),
        nguoi_nhan_id: Number(data.nguoi_nhan_id),
        noi_dung: data.noi_dung,
        donhang_id: data.donhang_id ? Number(data.donhang_id) : null,
        attachments: data.attachments ? (data.attachments as any) : null,
        da_doc: false,
      },
      include: {
        nguoiGui: { select: { user_id: true, full_name: true, avatar_url: true } },
        nguoiNhan: { select: { user_id: true, full_name: true, avatar_url: true } },
      },
    });
  }

  async getConversation(userId: number, partnerId: number) {
    return this.prisma.tinNhan.findMany({
      where: {
        OR: [
          { nguoi_gui_id: Number(userId), nguoi_nhan_id: Number(partnerId) },
          { nguoi_gui_id: Number(partnerId), nguoi_nhan_id: Number(userId) },
        ],
      },
      orderBy: { thoi_gian: 'asc' },
      include: {
        nguoiGui: { select: { user_id: true, full_name: true, avatar_url: true } },
        nguoiNhan: { select: { user_id: true, full_name: true, avatar_url: true } },
      },
    });
  }

  async getRecentConversations(userId: number) {
    const uid = Number(userId);
    const messages = await this.prisma.tinNhan.findMany({
      where: {
        OR: [
          { nguoi_gui_id: uid },
          { nguoi_nhan_id: uid },
        ],
      },
      orderBy: { thoi_gian: 'desc' },
      include: {
        nguoiGui: { select: { user_id: true, full_name: true, avatar_url: true } },
        nguoiNhan: { select: { user_id: true, full_name: true, avatar_url: true } },
      },
    });

    const conversationMap = new Map<number, any>();

    for (const msg of messages) {
      const partnerId = msg.nguoi_gui_id === uid ? msg.nguoi_nhan_id : msg.nguoi_gui_id;
      const partner = msg.nguoi_gui_id === uid ? msg.nguoiNhan : msg.nguoiGui;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: (msg.nguoi_nhan_id === uid && !msg.da_doc) ? 1 : 0,
        });
      } else {
        if (msg.nguoi_nhan_id === uid && !msg.da_doc) {
          conversationMap.get(partnerId).unreadCount++;
        }
      }
    }

    return Array.from(conversationMap.values());
  }

  async findOne(id: number) {
    return this.prisma.tinNhan.findUnique({
      where: { tinnhan_id: id },
      include: {
        nguoiGui: { select: { user_id: true, full_name: true, avatar_url: true } },
        nguoiNhan: { select: { user_id: true, full_name: true, avatar_url: true } },
      },
    });
  }

  async markAsRead(tinnhan_id: number) {
    return this.prisma.tinNhan.update({
      where: { tinnhan_id },
      data: { da_doc: true },
    });
  }

  async update(id: number, data: UpdateTinNhanDto) {
    return this.prisma.tinNhan.update({
      where: { tinnhan_id: id },
      data,
    });
  }

  async countUnread(userId: number) {
    return this.prisma.tinNhan.count({
      where: {
        nguoi_nhan_id: Number(userId),
        da_doc: false,
      },
    });
  }

  async searchUserByPhone(phone: string) {
    const user = await this.prisma.users.findUnique({
      where: { phone },
      select: { user_id: true, full_name: true, avatar_url: true, role_id: true }
    });
    if (!user) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException('Không tìm thấy người dùng với số điện thoại này');
    }
    return user;
  }
}
