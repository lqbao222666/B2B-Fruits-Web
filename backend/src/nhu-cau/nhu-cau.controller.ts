import { Role } from '../auth/role.enum';
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
  Query,
} from '@nestjs/common';
import { NhuCauService } from './nhu-cau.service';
import { CreateNhuCauDto } from './dto/create-nhu-cau.dto';
import { UpdateNhuCauDto } from './dto/update-nhu-cau.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('nhu-cau')
export class NhuCauController {
  constructor(private readonly service: NhuCauService) {}

  /// Doanh nghiệp đăng nhu cầu thu mua
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.doanh_nghiep, Role.admin)
  create(@Body() createDto: CreateNhuCauDto) {
    return this.service.create(createDto);
  }

  /// Nông dân & tất cả mọi người có thể xem danh sách nhu cầu thu mua
  @Get()
  findAll(
    @Query('ten_nong_san') ten_nong_san?: string,
    @Query('tinh_thanh_giao') tinh_thanh_giao?: string,
    @Query('danhmuc_id') danhmuc_id?: string,
    @Query('trang_thai') trang_thai?: string,
    @Query('mien') mien?: string,
    @Query('so_luong_min') so_luong_min?: string,
    @Query('gia_min') gia_min?: string,
    @Query('gia_max') gia_max?: string,
    @Query('yeu_cau_chung_nhan') yeu_cau_chung_nhan?: string,
    @Query('cho_thuong_luong') cho_thuong_luong?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.findAll({
      ten_nong_san,
      tinh_thanh_giao,
      danhmuc_id: danhmuc_id ? parseInt(danhmuc_id, 10) : undefined,
      trang_thai,
      mien,
      so_luong_min: so_luong_min ? parseFloat(so_luong_min) : undefined,
      gia_min: gia_min ? parseFloat(gia_min) : undefined,
      gia_max: gia_max ? parseFloat(gia_max) : undefined,
      yeu_cau_chung_nhan,
      cho_thuong_luong:
        cho_thuong_luong === 'true'
          ? true
          : cho_thuong_luong === 'false'
            ? false
            : undefined,
      sort,
    });
  }

  /// Admin xem danh sách nhu cầu chưa được thông báo hàng mới
  @Get('chua-thong-bao')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  findChuaThongBao() {
    return this.service.findChuaThongBao();
  }

  /// Lấy tất cả nhu cầu của 1 doanh nghiệp cụ thể
  @Get('doanh-nghiep/:id')
  findByDoanhNghiep(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByDoanhNghiep(id);
  }

  /// Xem chi tiết 1 nhu cầu thu mua
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /// Doanh nghiệp cập nhật nhu cầu của mình
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.doanh_nghiep, Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNhuCauDto,
  ) {
    return this.service.update(id, updateDto);
  }

  /// Admin đánh dấu đã thông báo hàng mới cho DN
  /// POST /nhu-cau/:id/thong-bao
  @Post(':id/thong-bao')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  thongBaoHangMoi(@Param('id', ParseIntPipe) id: number) {
    return this.service.thongBaoHangMoi(id);
  }

  /// Admin reset cờ thông báo — cho phép thông báo lại lần sau
  /// POST /nhu-cau/:id/reset-thong-bao
  @Post(':id/reset-thong-bao')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  resetThongBao(@Param('id', ParseIntPipe) id: number) {
    return this.service.resetThongBao(id);
  }

  /// Xoá nhu cầu thu mua (Doanh nghiệp sở hữu hoặc Admin)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.doanh_nghiep, Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
