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
import { ThongBaoService } from './thong-bao.service';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';

@Controller('thong-bao')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) {}

  @Post()
  @Roles(Role.admin) // Thuong he thong se goi service truc tiep de tao, API nay dung cho admin
  create(@Body() createDto: CreateThongBaoDto) {
    return this.thongBaoService.create(createDto);
  }

  @Get('user/:user_id')
  // Tất cả role đều có quyền xem thông báo của mình, nên không cần @Roles, chỉ cần JwtAuthGuard
  findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.thongBaoService.findByUser(user_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.thongBaoService.findOne(id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    const user_id = req.user.user_id;
    return this.thongBaoService.markAllAsRead(user_id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.thongBaoService.markAsRead(id);
  }

  @Patch(':id')
  @Roles(Role.admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateThongBaoDto,
  ) {
    return this.thongBaoService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(Role.admin) // Người dùng có thể xóa thông báo của mình nếu muốn, nhưng default admin quản lý
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.thongBaoService.remove(id);
  }
}
