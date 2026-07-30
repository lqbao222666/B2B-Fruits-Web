import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChungLoaiService } from './chung-loai.service';
import { CreateChungLoaiDto } from './dto/create-chung-loai.dto';
import { UpdateChungLoaiDto } from './dto/update-chung-loai.dto';

@Controller('chung-loai')
export class ChungLoaiController {
  constructor(private readonly chungLoaiService: ChungLoaiService) {}

  @Post()
  create(@Body() createChungLoaiDto: CreateChungLoaiDto) {
    return this.chungLoaiService.create(createChungLoaiDto);
  }

  @Get()
  findAll() {
    return this.chungLoaiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chungLoaiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChungLoaiDto: UpdateChungLoaiDto) {
    return this.chungLoaiService.update(+id, updateChungLoaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chungLoaiService.remove(+id);
  }
}
