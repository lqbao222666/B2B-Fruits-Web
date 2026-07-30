import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBaoCaoDto } from './dto/create-bao-cao.dto';
import { UpdateBaoCaoDto } from './dto/update-bao-cao.dto';

@Injectable()
export class BaoCaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBaoCaoDto) {
    return this.prisma.baoCao.create({
      data,
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.baoCao.findMany({
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByUser(user_id: number) {
    return this.prisma.baoCao.findMany({
      where: { nguoi_baocao_id: user_id },
      include: {
        nguoiBiBaoCao: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.baoCao.findUnique({
      where: { baocao_id: id },
      include: {
        nguoiBaoCao: { select: { full_name: true, email: true } },
        nguoiBiBaoCao: { select: { full_name: true, email: true } },
      },
    });
  }

  async update(id: number, data: UpdateBaoCaoDto) {
    return this.prisma.baoCao.update({
      where: { baocao_id: id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.baoCao.delete({
      where: { baocao_id: id },
    });
  }
}
