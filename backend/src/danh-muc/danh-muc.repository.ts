import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDanhMucDto } from './dto/create-danh-muc.dto';
import { UpdateDanhMucDto } from './dto/update-danh-muc.dto';

@Injectable()
export class DanhMucRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDanhMucDto) {
    return this.prisma.danhMuc.create({ data });
  }

  async findAll() {
    return this.prisma.danhMuc.findMany({
      include: { chungLoai: true },
      orderBy: { thu_tu: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.danhMuc.findUnique({
      where: { danhmuc_id: id },
      include: { chungLoai: true },
    });
  }

  async update(id: number, data: UpdateDanhMucDto) {
    return this.prisma.danhMuc.update({
      where: { danhmuc_id: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.danhMuc.delete({
      where: { danhmuc_id: id },
    });
  }
}
