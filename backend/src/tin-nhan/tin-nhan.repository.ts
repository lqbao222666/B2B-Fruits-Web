import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
        nguoiGui: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
        nguoiNhan: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
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
        nguoiGui: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
        nguoiNhan: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
      },
    });
  }

  async getRecentConversations(userId: number) {
    const uid = Number(userId);
    const messages = await this.prisma.tinNhan.findMany({
      where: {
        OR: [{ nguoi_gui_id: uid }, { nguoi_nhan_id: uid }],
      },
      orderBy: { thoi_gian: 'desc' },
      include: {
        nguoiGui: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
        nguoiNhan: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
      },
    });

    const conversationMap = new Map<number, any>();

    for (const msg of messages) {
      const partnerId =
        msg.nguoi_gui_id === uid ? msg.nguoi_nhan_id : msg.nguoi_gui_id;
      const partner = msg.nguoi_gui_id === uid ? msg.nguoiNhan : msg.nguoiGui;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: msg,
          unreadCount: msg.nguoi_nhan_id === uid && !msg.da_doc ? 1 : 0,
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
        nguoiGui: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
        nguoiNhan: {
          select: { user_id: true, full_name: true, avatar_url: true },
        },
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
      select: {
        user_id: true,
        full_name: true,
        avatar_url: true,
        role_id: true,
      },
    });
    if (!user) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException(
        'Không tìm thấy người dùng với số điện thoại này',
      );
    }
    return user;
  }

  async searchUsers(query: string, currentUserId?: number) {
    if (!query || !query.trim()) return [];
    const q = query.trim();

    return this.prisma.users.findMany({
      where: {
        is_active: true,
        ...(currentUserId ? { user_id: { not: Number(currentUserId) } } : {}),
        OR: [
          { full_name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          {
            nongDan: {
              OR: [
                { ho_ten: { contains: q, mode: 'insensitive' } },
                { so_dien_thoai: { contains: q, mode: 'insensitive' } },
                { email_lien_he: { contains: q, mode: 'insensitive' } },
                { tinh_thanh: { contains: q, mode: 'insensitive' } },
                { huyen_xa: { contains: q, mode: 'insensitive' } },
                { dia_chi_cu_the: { contains: q, mode: 'insensitive' } },
                { ten_co_so_kd: { contains: q, mode: 'insensitive' } },
                { nong_san_chinh: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
          {
            doanhNghiep: {
              OR: [
                { ten_cong_ty: { contains: q, mode: 'insensitive' } },
                { so_dien_thoai: { contains: q, mode: 'insensitive' } },
                { email_lien_he: { contains: q, mode: 'insensitive' } },
                { tinh_thanh: { contains: q, mode: 'insensitive' } },
                { dia_chi: { contains: q, mode: 'insensitive' } },
                { nguoi_dai_dien: { contains: q, mode: 'insensitive' } },
                { nganh_kinh_doanh: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        ],
      },
      take: 20,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role_id: true,
        vaiTro: {
          select: {
            role_id: true,
            ten_vai_tro: true,
          },
        },
        nongDan: {
          select: {
            ho_ten: true,
            tinh_thanh: true,
            huyen_xa: true,
            dia_chi_cu_the: true,
            dien_tich_ha: true,
            nong_san_chinh: true,
            chung_nhan: true,
            mo_ta_ban_than: true,
            diem_trung_binh: true,
            tong_giao_dich: true,
            email_lien_he: true,
            so_dien_thoai: true,
            ten_co_so_kd: true,
            doi_tuong_dang_ky: true,
            ma_so_thue: true,
          },
        },
        doanhNghiep: {
          select: {
            ten_cong_ty: true,
            nganh_kinh_doanh: true,
            ma_so_thue: true,
            tinh_thanh: true,
            dia_chi: true,
            diem_trung_binh: true,
            mo_ta: true,
            tong_giao_dich: true,
            website: true,
            chuc_vu: true,
            email_lien_he: true,
            nguoi_dai_dien: true,
            so_dien_thoai: true,
          },
        },
      },
    });
  }

  async getUserDetail(userId: number) {
    const uid = Number(userId);
    const user = await this.prisma.users.findUnique({
      where: { user_id: uid },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar_url: true,
        gioi_tinh: true,
        ngay_sinh: true,
        role_id: true,
        vaiTro: {
          select: {
            role_id: true,
            ten_vai_tro: true,
          },
        },
        nongDan: {
          include: {
            baiDangs: {
              where: { trang_thai: 'dang_ban' },
              orderBy: { created_at: 'desc' },
              take: 6,
              select: {
                baidang_id: true,
                tieu_de: true,
                ten_nong_san: true,
                gia_per_kg: true,
                don_vi_tinh: true,
                so_luong_con_lai: true,
                tinh_thanh: true,
                images: true,
                created_at: true,
              },
            },
          },
        },
        doanhNghiep: {
          include: {
            nhuCauThuMua: {
              where: { trang_thai: 'dang_thu_mua' },
              orderBy: { created_at: 'desc' },
              take: 6,
              select: {
                nhucau_id: true,
                ten_nong_san: true,
                so_luong_can: true,
                don_vi: true,
                gia_tham_khao: true,
                tinh_thanh_giao: true,
                ngay_ket_thuc: true,
                created_at: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      const { NotFoundException } = require('@nestjs/common');
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    return user;
  }
}
