import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TieuChuanService } from './tieu-chuan.service';
import { CreateTieuChuanDto } from './dto/create-tieu-chuan.dto';
import { UpdateTieuChuanDto } from './dto/update-tieu-chuan.dto';

@Controller('tieu-chuan')
export class TieuChuanController {
  constructor(private readonly tieuChuanService: TieuChuanService) {}

  @Post()
  create(@Body() createTieuChuanDto: CreateTieuChuanDto) {
    return this.tieuChuanService.create(createTieuChuanDto);
  }

  @Get()
  findAll() {
    return this.tieuChuanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tieuChuanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTieuChuanDto: UpdateTieuChuanDto) {
    return this.tieuChuanService.update(+id, updateTieuChuanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tieuChuanService.remove(+id);
  }
}
