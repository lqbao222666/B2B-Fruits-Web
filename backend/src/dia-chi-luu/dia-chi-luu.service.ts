import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DiaChiLuuService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: any) {
    return this.prisma.diaChiLuu.create({
      data: {
        user_id: createDto.user_id,
        ten_goi: createDto.ten_goi,
        dia_chi: createDto.dia_chi,
        latitude: createDto.latitude,
        longitude: createDto.longitude
      }
    });
  }

  async findAllByUser(user_id: number) {
    return this.prisma.diaChiLuu.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    });
  }

  async remove(id: number) {
    return this.prisma.diaChiLuu.delete({
      where: { id }
    });
  }
}

