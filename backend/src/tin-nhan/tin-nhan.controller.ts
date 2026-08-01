import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { TinNhanService } from './tin-nhan.service';
import { CreateTinNhanDto } from './dto/create-tin-nhan.dto';
import { UpdateTinNhanDto } from './dto/update-tin-nhan.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('tin-nhan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TinNhanController {
  constructor(private readonly tinNhanService: TinNhanService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/uploads';
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|webm|ogg)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh hoặc video'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit cho phép upload video
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file');
    return { url: `/uploads/${file.filename}`, type: file.mimetype.includes('video') ? 'video' : 'image' };
  }

  @Post()
  create(@Body() createDto: CreateTinNhanDto, @GetUser() currentUser: any) {
    createDto.nguoi_gui_id = currentUser.user_id || currentUser.id;
    return this.tinNhanService.create(createDto);
  }

  @Get('conversations')
  getConversations(@GetUser() currentUser: any) {
    const userId = currentUser.user_id || currentUser.id;
    return this.tinNhanService.getConversations(userId);
  }

  @Get('unread/count')
  countUnread(@GetUser() currentUser: any) {
    const userId = Number(currentUser.id || currentUser.user_id || currentUser.sub);
    return this.tinNhanService.countUnread(userId);
  }

  @Get('search-user/:phone')
  async searchUserByPhone(@Param('phone') phone: string) {
    return this.tinNhanService.searchUserByPhone(phone);
  }

  @Get('conversation/:partnerId')
  getConversation(
    @Param('partnerId', ParseIntPipe) partnerId: number,
    @GetUser() currentUser: any,
  ) {
    const userId = currentUser.user_id || currentUser.id;
    return this.tinNhanService.getConversation(userId, partnerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tinNhanService.findOne(id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.tinNhanService.markAsRead(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTinNhanDto,
  ) {
    return this.tinNhanService.update(id, updateDto);
  }
}
