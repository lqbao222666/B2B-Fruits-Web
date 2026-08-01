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
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { BaiDangService } from './bai-dang.service';
import { CreateBaiDangDto } from './dto/create-bai-dang.dto';
import { UpdateBaiDangDto } from './dto/update-bai-dang.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';
import { IsString } from 'class-validator';

class AnBaiDangDto {
  @IsString()
  ly_do_tu_choi: string;
}

@Controller('bai-dang')
export class BaiDangController {
  constructor(private readonly service: BaiDangService) {}

  /// POST /bai-dang
  /// Nông dân đăng lô hàng với gia_per_kg tự định
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  create(@Body() createDto: CreateBaiDangDto) {
    return this.service.create(createDto);
  }

  /// POST /bai-dang/upload
  /// Nông dân tải ảnh lên
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file');
    // Trả về đường dẫn để frontend lưu vào database
    return { url: `/uploads/${file.filename}` };
  }

  /// GET /bai-dang
  /// Danh sách bài đang bán — công khai (DN, nông dân đều xem được)
  @Get()
  findAll(
    @Query('tinh_thanh') tinh_thanh?: string,
    @Query('danhmuc_id') danhmuc_id?: string,
    @Query('ten_nong_san') ten_nong_san?: string,
    @Query('gia_min') gia_min?: string,
    @Query('gia_max') gia_max?: string,
  ) {
    return this.service.findAll({
      tinh_thanh,
      danhmuc_id: danhmuc_id ? parseInt(danhmuc_id) : undefined,
      ten_nong_san,
      gia_min: gia_min ? parseFloat(gia_min) : undefined,
      gia_max: gia_max ? parseFloat(gia_max) : undefined,
    });
  }

  /// GET /bai-dang/admin/all
  /// Admin xem tất cả bài (cho_duyet, dang_ban, da_ban, an)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  findAllForAdmin(@Query('trang_thai') trang_thai?: string) {
    return this.service.findAllForAdmin({ trang_thai });
  }

  /// GET /bai-dang/nong-dan/:id
  /// Xem bài đăng của một nông dân cụ thể
  @Get('nong-dan/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  findByNongDan(@Param('id', ParseIntPipe) id: number) {
    return this.service.findByNongDan(id);
  }

  /// GET /bai-dang/:id
  /// Xem chi tiết một bài đăng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  /// PATCH /bai-dang/:id/an
  /// Admin ẩn bài đăng vi phạm nội dung
  @Patch(':id/an')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  anBaiDang(@Param('id', ParseIntPipe) id: number, @Body() body: AnBaiDangDto) {
    return this.service.anBaiDang(id, body.ly_do_tu_choi);
  }

  /// PATCH /bai-dang/:id/mo-lai
  /// Nông dân / Admin mở lại bài đăng đang ẩn
  @Patch(':id/mo-lai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  moLaiBaiDang(@Param('id', ParseIntPipe) id: number) {
    return this.service.moLaiBaiDang(id);
  }

  /// PATCH /bai-dang/:id
  /// Nông dân / Admin cập nhật thông tin bài đăng
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBaiDangDto,
  ) {
    return this.service.update(id, updateDto);
  }

  /// DELETE /bai-dang/:id
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user?.id || req.user?.user_id || req.user?.sub);
    return this.service.remove(id, userId);
  }

  /// PUT /bai-dang/:id/ngung-cung-cap
  @Put(':id/ngung-cung-cap')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin, Role.nong_dan)
  ngungCungCap(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = Number(req.user?.id || req.user?.user_id || req.user?.sub);
    return this.service.ngungCungCap(id, userId);
  }
}
