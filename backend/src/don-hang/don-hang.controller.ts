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
  Request,
} from '@nestjs/common';
import { DonHangService } from './don-hang.service';
import { CreateDonHangDto } from './dto/create-don-hang.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { DatHangDto } from './dto/dat-hang.dto';
import { UpdateDonHangDto } from './dto/update-don-hang.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('don-hang')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DonHangController {
  constructor(private readonly donHangService: DonHangService) {}
  @Post()
  @Roles(Role.admin, Role.doanh_nghiep)
  create(@Body() createDto: CreateDonHangDto) {
    return this.donHangService.create(createDto);
  }

  @Post('checkout')
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  checkoutCart(@Request() req: any, @Body() dto: CheckoutCartDto) {
    // Keep this for backward compatibility if needed, or return error
    throw new Error('Endpoint /checkout is deprecated. Use /dat-hang instead.');
  }

  @Post('dat-hang')
  @Roles(Role.admin, Role.doanh_nghiep)
  datHang(@Request() req: any, @Body() dto: DatHangDto) {
    const userId = Number(req.user.id || req.user.user_id || req.user.sub);
    return this.donHangService.datHang(userId, dto);
  }

  @Post(':id/xac-nhan-giao-hang')
  @Roles(Role.admin, Role.nong_dan)
  xacNhanGiaoHang(
    @Param('id', ParseIntPipe) id: number,
    @Body('ma_xac_nhan') ma_xac_nhan: string,
  ) {
    return this.donHangService.xacNhanGiaoHang(id, ma_xac_nhan);
  }

  @Get()
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  findAll() {
    return this.donHangService.findAll();
  }

  @Get('user/:id')
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.donHangService.findByUser(id);
  }

  @Get(':id')
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.donHangService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDonHangDto,
  ) {
    return this.donHangService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.donHangService.remove(id);
  }
}
