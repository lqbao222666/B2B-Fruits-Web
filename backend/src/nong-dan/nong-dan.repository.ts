import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNongDanDto } from './dto/create-nong-dan.dto';
import { UpdateNongDanDto } from './dto/update-nong-dan.dto';

@Injectable()
export class NongDanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNongDanDto) {
    return this.prisma.nongDan.create({ data });
  }

  async findAll() {
    return this.prisma.nongDan.findMany({
      include: { 
        user: { select: { email: true, phone: true, full_name: true } }
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.nongDan.findUnique({
      where: { user_id: id },
      include: { 
        user: { select: { email: true, phone: true, full_name: true } }
      },
    });
  }

  async update(id: number, data: UpdateNongDanDto) {
    const cleanData: any = { ...data };
    if (cleanData.ma_so_thue === '') cleanData.ma_so_thue = null;
    if (cleanData.so_cmnd_cccd === '') cleanData.so_cmnd_cccd = null;
    if (cleanData.email_lien_he === '') cleanData.email_lien_he = null;
    if (cleanData.user_id) delete cleanData.user_id;

    const user = await this.prisma.users.findUnique({ where: { user_id: id } });

    return this.prisma.nongDan.upsert({
      where: { user_id: id },
      update: cleanData,
      create: {
        user_id: id,
        ho_ten: cleanData.ho_ten || user?.full_name || 'Nông dân',
        so_dien_thoai: cleanData.so_dien_thoai || user?.phone || `phone_${id}`,
        tinh_thanh: cleanData.tinh_thanh || 'Chưa cập nhật',
        ...cleanData,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.nongDan.delete({
      where: { user_id: id },
    });
  }
}
