import { Injectable as NestInjectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, ChungLoai } from '@prisma/client';

@NestInjectable()
export class ChungLoaiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ChungLoaiCreateInput): Promise<ChungLoai> {
    return this.prisma.chungLoai.create({ data });
  }

  async findAll(): Promise<ChungLoai[]> {
    return this.prisma.chungLoai.findMany({
      orderBy: { thu_tu: 'asc' },
    });
  }

  async findOne(id: number): Promise<ChungLoai | null> {
    return this.prisma.chungLoai.findUnique({
      where: { chungloai_id: id },
    });
  }

  async update(id: number, data: Prisma.ChungLoaiUpdateInput): Promise<ChungLoai> {
    return this.prisma.chungLoai.update({
      where: { chungloai_id: id },
      data,
    });
  }

  async remove(id: number): Promise<ChungLoai> {
    return this.prisma.chungLoai.delete({
      where: { chungloai_id: id },
    });
  }
}
