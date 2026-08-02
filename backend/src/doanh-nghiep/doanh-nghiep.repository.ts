import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoanhNghiepDto } from './dto/create-doanh-nghiep.dto';
import { UpdateDoanhNghiepDto } from './dto/update-doanh-nghiep.dto';

@Injectable()
export class DoanhNghiepRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDoanhNghiepDto) {
    return this.prisma.doanhNghiep.create({ data });
  }

  async findAll() {
    return this.prisma.doanhNghiep.findMany({
      include: { user: { select: { email: true, phone: true, full_name: true } } },
    });
  }

  async findOne(id: number) {
    return this.prisma.doanhNghiep.findUnique({
      where: { user_id: id },
      include: { user: { select: { email: true, phone: true, full_name: true } } },
    });
  }

  async update(id: number, data: UpdateDoanhNghiepDto) {
    const cleanData: any = { ...data };
    if (cleanData.ma_so_thue === '') cleanData.ma_so_thue = null;
    if (cleanData.email_lien_he === '') cleanData.email_lien_he = null;
    if (cleanData.user_id) delete cleanData.user_id;

    const user = await this.prisma.users.findUnique({ where: { user_id: id } });

    return this.prisma.doanhNghiep.upsert({
      where: { user_id: id },
      update: cleanData,
      create: {
        user_id: id,
        ten_cong_ty: cleanData.ten_cong_ty || user?.full_name || 'Doanh nghiệp',
        so_dien_thoai: cleanData.so_dien_thoai || user?.phone || `phone_${id}`,
        tinh_thanh: cleanData.tinh_thanh || 'Chưa cập nhật',
        ...cleanData,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.doanhNghiep.delete({
      where: { user_id: id },
    });
  }
}
