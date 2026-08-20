import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';

@Injectable()
export class ThongBaoRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateThongBaoDto) {
    return this.prisma.thongBao.create({ data });
  }

  async findByUser(user_id: number) {
    return this.prisma.thongBao.findMany({
      where: { user_id },
      orderBy: { thoi_gian_gui: 'desc' },
    });
  }

  async findOne(tb_id: number) {
    const thongBao = await this.prisma.thongBao.findUnique({
      where: { tb_id },
    });
    if (!thongBao) throw new NotFoundException('Thông báo không tồn tại');
    return thongBao;
  }

  async update(tb_id: number, data: UpdateThongBaoDto) {
    return this.prisma.thongBao.update({
      where: { tb_id },
      data,
    });
  }

  async markAsRead(tb_id: number) {
    return this.prisma.thongBao.update({
      where: { tb_id },
      data: { da_doc: true },
    });
  }

  async markAllAsRead(user_id: number) {
    return this.prisma.thongBao.updateMany({
      where: { user_id, da_doc: false },
      data: { da_doc: true },
    });
  }

  async remove(tb_id: number) {
    return this.prisma.thongBao.delete({
      where: { tb_id },
    });
  }
}
