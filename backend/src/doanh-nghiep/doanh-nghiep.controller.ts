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
import { DoanhNghiepService } from './doanh-nghiep.service';
import { CreateDoanhNghiepDto } from './dto/create-doanh-nghiep.dto';
import { UpdateDoanhNghiepDto } from './dto/update-doanh-nghiep.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('doanh-nghiep')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoanhNghiepController {
  constructor(private readonly service: DoanhNghiepService) {}

  @Post()
  @Roles(Role.admin, Role.doanh_nghiep)
  create(@Body() createDto: CreateDoanhNghiepDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles(Role.admin, Role.nong_dan)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.doanh_nghiep)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDoanhNghiepDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
