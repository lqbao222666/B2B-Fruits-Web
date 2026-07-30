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
    return this.prisma.doanhNghiep.update({
      where: { user_id: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.doanhNghiep.delete({
      where: { user_id: id },
    });
  }
}
