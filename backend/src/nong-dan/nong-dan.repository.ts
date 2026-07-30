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
    return this.prisma.nongDan.update({
      where: { user_id: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.nongDan.delete({
      where: { user_id: id },
    });
  }
}
