import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTieuChuanDto } from './dto/create-tieu-chuan.dto';
import { UpdateTieuChuanDto } from './dto/update-tieu-chuan.dto';

@Injectable()
export class TieuChuanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTieuChuanDto) {
    return this.prisma.tieuChuan.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.tieuChuan.findMany({
      orderBy: { ten_tieu_chuan: 'asc' },
    });
  }

  async findOne(tieuchuan_id: number) {
    const item = await this.prisma.tieuChuan.findUnique({
      where: { tieuchuan_id },
    });
    if (!item) {
      throw new NotFoundException('Tiêu chuẩn không tồn tại');
    }
    return item;
  }

  async update(tieuchuan_id: number, data: UpdateTieuChuanDto) {
    await this.findOne(tieuchuan_id);
    return this.prisma.tieuChuan.update({
      where: { tieuchuan_id },
      data,
    });
  }

  async remove(tieuchuan_id: number) {
    await this.findOne(tieuchuan_id);
    return this.prisma.tieuChuan.delete({
      where: { tieuchuan_id },
    });
  }
}
