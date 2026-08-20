import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ThuongLuongService } from './thuong-luong.service';
import { CreateThuongLuongDto } from './dto/create-thuong-luong.dto';
import { PhanHoiThuongLuongDto } from './dto/phan-hoi-thuong-luong.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';
import { Role } from '../auth/role.enum';

@Controller('thuong-luong')
export class ThuongLuongController {
  constructor(private readonly service: ThuongLuongService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.doanh_nghiep, Role.admin)
  create(@Body() dto: CreateThuongLuongDto) {
    return this.service.create(dto);
  }

  @Get('bai-dang/:id')
  @UseGuards(JwtAuthGuard)
  findByBaiDang(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByBaiDang(id);
  }

  @Get('doanh-nghiep/:id')
  @UseGuards(JwtAuthGuard)
  findByDoanhNghiep(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByDoanhNghiep(id);
  }

  @Get('nong-dan/:id')
  @UseGuards(JwtAuthGuard)
  findByNongDan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByNongDan(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/phan-hoi')
  @UseGuards(JwtAuthGuard)
  phanHoi(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PhanHoiThuongLuongDto,
  ) {
    return this.service.phanHoi(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
