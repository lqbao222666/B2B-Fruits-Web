import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { DanhGiaService } from './danh-gia.service';
import { CreateDanhGiaDto } from './dto/create-danh-gia.dto';
import { ReplyDanhGiaDto } from './dto/reply-danh-gia.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';

@Controller('danh-gia')
export class DanhGiaController {
  constructor(private readonly danhGiaService: DanhGiaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() data: CreateDanhGiaDto) {
    const userId = Number(req.user?.id || req.user?.user_id || req.user?.sub);
    return this.danhGiaService.create(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/reply')
  async reply(
    @Request() req,
    @Param('id') id: string,
    @Body() data: ReplyDanhGiaDto,
  ) {
    const userId = Number(req.user?.id || req.user?.user_id || req.user?.sub);
    return this.danhGiaService.reply(+id, userId, data);
  }

  @Get('bai-dang/:id')
  async findByBaiDang(@Param('id') id: string) {
    return this.danhGiaService.findByBaiDang(+id);
  }

  @Get('nong-dan/:id')
  async findByNongDan(@Param('id') id: string) {
    return this.danhGiaService.findByNongDan(+id);
  }
}
