import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BaoGiaService } from './bao-gia.service';
import { CreateBaoGiaDto } from './dto/create-bao-gia.dto';
import { PhanHoiBaoGiaDto } from './dto/phan-hoi-bao-gia.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';
import { Role } from '../auth/role.enum';

@Controller('bao-gia')
export class BaoGiaController {
  constructor(private readonly service: BaoGiaService) {}

  /// Nông dân gửi báo giá chào hàng cho nhu cầu của DN
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.nong_dan, Role.admin)
  create(@Body() createDto: CreateBaoGiaDto) {
    return this.service.create(createDto);
  }

  /// Lấy danh sách báo giá của 1 nhu cầu thu mua
  @Get('nhu-cau/:id')
  @UseGuards(JwtAuthGuard)
  findByNhuCau(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByNhuCau(id);
  }

  /// Lấy danh sách báo giá mà 1 Nông Dân đã gửi
  @Get('nong-dan/:id')
  @UseGuards(JwtAuthGuard)
  findByNongDan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByNongDan(id);
  }

  /// Lấy danh sách báo giá mà 1 Doanh Nghiệp nhận được
  @Get('doanh-nghiep/:id')
  @UseGuards(JwtAuthGuard)
  findByDoanhNghiep(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByDoanhNghiep(id);
  }

  /// Xem chi tiết 1 báo giá
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /// Phản hồi / Thương lượng lại báo giá (Cho cả Nông dân và Doanh nghiệp)
  @Patch(':id/phan-hoi')
  @UseGuards(JwtAuthGuard)
  phanHoi(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PhanHoiBaoGiaDto,
  ) {
    return this.service.phanHoi(id, dto);
  }

  /// Xoá / Hủy báo giá
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
