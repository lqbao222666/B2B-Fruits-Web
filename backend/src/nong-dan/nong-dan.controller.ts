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
import { NongDanService } from './nong-dan.service';
import { CreateNongDanDto } from './dto/create-nong-dan.dto';
import { UpdateNongDanDto } from './dto/update-nong-dan.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('nong-dan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NongDanController {
  constructor(private readonly service: NongDanService) {}

  @Post()
  @Roles(Role.admin, Role.nong_dan)
  create(@Body() createDto: CreateNongDanDto) {
    return this.service.create(createDto);
  }

  @Get()
  @Roles(Role.admin, Role.doanh_nghiep)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.admin, Role.doanh_nghiep, Role.nong_dan)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.nong_dan)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateNongDanDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
