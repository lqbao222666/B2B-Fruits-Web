import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { SuggestPostDto } from './dto/suggest-post.dto';
import { SuggestPriceDto } from './dto/suggest-price.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/chat
   * Chat có xác thực — role được lấy tự động từ JWT token
   */
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Request() req: any, @Body() dto: ChatDto) {
    // Lấy role từ JWT nếu user không truyền lên
    if (!dto.role_nguoi_dung && req.user?.role) {
      dto.role_nguoi_dung = req.user.role as any;
    }
    return this.aiService.chat(dto);
  }

  /**
   * POST /ai/chat/public
   * Chat công khai — không cần đăng nhập, role mặc định là khách
   */
  @Post('chat/public')
  @HttpCode(HttpStatus.OK)
  async chatPublic(@Body() dto: ChatDto) {
    // Public endpoint không có role cụ thể
    dto.role_nguoi_dung = undefined;
    return this.aiService.chat(dto);
  }

  /**
   * POST /ai/suggest-post
   * Gợi ý nội dung mô tả bài đăng cho nông dân
   */
  @UseGuards(JwtAuthGuard)
  @Post('suggest-post')
  @HttpCode(HttpStatus.OK)
  async suggestPost(@Body() dto: SuggestPostDto) {
    return this.aiService.suggestPostDescription(dto);
  }

  /**
   * POST /ai/suggest-price
   * Gợi ý giá bán cho nông sản
   */
  @UseGuards(JwtAuthGuard)
  @Post('suggest-price')
  @HttpCode(HttpStatus.OK)
  async suggestPrice(@Body() dto: SuggestPriceDto) {
    return this.aiService.suggestPrice(dto);
  }
}
