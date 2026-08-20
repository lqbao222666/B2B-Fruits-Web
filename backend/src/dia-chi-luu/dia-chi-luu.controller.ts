import { Controller, Get, Post, Patch, Body, Param, Delete } from '@nestjs/common';
import { DiaChiLuuService } from './dia-chi-luu.service';

@Controller('dia-chi-luu')
export class DiaChiLuuController {
  constructor(private readonly diaChiLuuService: DiaChiLuuService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.diaChiLuuService.create(createDto);
  }

  @Get('user/:user_id')
  findAllByUser(@Param('user_id') user_id: string) {
    return this.diaChiLuuService.findAllByUser(+user_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.diaChiLuuService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diaChiLuuService.remove(+id);
  }
}
