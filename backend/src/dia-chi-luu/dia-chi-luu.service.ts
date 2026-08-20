import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
        longitude: createDto.longitude,
      },
    });
  }

  async findAllByUser(user_id: number) {
    return this.prisma.diaChiLuu.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async remove(id: number) {
    return this.prisma.diaChiLuu.delete({
      where: { id },
    });
  }

  async update(id: number, updateDto: any) {
    const data: any = {};
    if (updateDto.ten_goi !== undefined) data.ten_goi = updateDto.ten_goi;
    if (updateDto.dia_chi !== undefined) data.dia_chi = updateDto.dia_chi;
    if (updateDto.latitude !== undefined) data.latitude = updateDto.latitude;
    if (updateDto.longitude !== undefined) data.longitude = updateDto.longitude;

    return this.prisma.diaChiLuu.update({
      where: { id },
      data,
    });
  }
}
