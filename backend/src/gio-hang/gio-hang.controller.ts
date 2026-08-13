import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GioHangService } from './gio-hang.service';
import { AddToCartDto, UpdateCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('gio-hang')
export class GioHangController {
  constructor(private readonly gioHangService: GioHangService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.gioHangService.getCart(req.user.user_id || req.user.id);
  }

  @Post()
  addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.gioHangService.addToCart(req.user.user_id || req.user.id, dto);
  }

  @Patch(':id')
  updateQuantity(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.gioHangService.updateQuantity(
      +id,
      req.user.user_id || req.user.id,
      dto.so_luong,
    );
  }

  @Delete(':id')
  removeItem(@Request() req: any, @Param('id') id: string) {
    return this.gioHangService.removeItem(+id, req.user.user_id || req.user.id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.gioHangService.clearCart(req.user.user_id || req.user.id);
  }
}
