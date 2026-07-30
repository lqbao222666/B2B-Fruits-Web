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
import { BaoCaoService } from './bao-cao.service';
import { CreateBaoCaoDto } from './dto/create-bao-cao.dto';
import { UpdateBaoCaoDto } from './dto/update-bao-cao.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';
import { Role } from 'src/auth/role.enum';

@Controller('bao-cao')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BaoCaoController {
  constructor(private readonly baoCaoService: BaoCaoService) {}

  @Post()
  @Roles(Role.nong_dan, Role.doanh_nghiep)
  create(@Body() createDto: CreateBaoCaoDto) {
    return this.baoCaoService.create(createDto);
  }

  @Get()
  @Roles(Role.admin)
  findAll() {
    return this.baoCaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.baoCaoService.findOne(id);
  }

  @Get('user/:user_id')
  @Roles(Role.admin, Role.nong_dan, Role.doanh_nghiep)
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.baoCaoService.findByUser(user_id);
  }

  @Patch(':id')
  @Roles(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBaoCaoDto,
  ) {
    return this.baoCaoService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.baoCaoService.remove(id);
  }
}
