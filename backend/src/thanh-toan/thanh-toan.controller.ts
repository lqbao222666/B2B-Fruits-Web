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
} from '@nestjs/common';
import { ThanhToanService } from './thanh-toan.service';
import { CreateThanhToanDto } from './dto/create-thanh-toan.dto';
import { UpdateThanhToanDto } from './dto/update-thanh-toan.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('thanh-toan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThanhToanController {
  constructor(private readonly thanhToanService: ThanhToanService) {}

  @Post()
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  create(@Body() createDto: CreateThanhToanDto) {
    return this.thanhToanService.create(createDto);
  }

  @Get()
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  findAll() {
    return this.thanhToanService.findAll();
  }

  @Get(':id')
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.thanhToanService.findOne(id);
  }

  @Get('don-hang/:donhang_id')
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  findByDonHang(@Param('donhang_id', ParseIntPipe) donhang_id: number) {
    return this.thanhToanService.findByDonHang(donhang_id);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateThanhToanDto,
  ) {
    return this.thanhToanService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.thanhToanService.remove(id);
  }
}
