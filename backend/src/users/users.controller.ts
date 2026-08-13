import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ListUserDto } from './dto/list-user.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from '../auth/auth.jwt.guard';
import { RolesGuard } from '../auth/auth.role.guard';
import { Roles } from '../auth/auth.role.decorator';
import { Role } from 'src/auth/role.enum';
import { GetUser } from '../auth/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get('all')
  getAllUsers(@GetUser() currentUser: any) {
    return this.usersService.getAllUsers(currentUser);
  }

  @Get('featured-suppliers')
  getFeaturedSuppliers() {
    return this.usersService.getFeaturedSuppliers();
  }

  @Post()
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Get()
  getAll(@GetUser() currentUser: any) {
    return this.usersService.getAll(currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number, @GetUser() currentUser: any) {
    return this.usersService.getById(id, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/password')
  resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResetPasswordDto,
    @GetUser() currentUser: any,
  ) {
    return this.usersService.resetPassword(id, dto, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Put(':id/active')
  updateActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateActiveDto,
  ) {
    return this.usersService.updateActive(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Put(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.usersService.updateRole(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @GetUser() currentUser: any) {
    return this.usersService.delete(id, currentUser);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @Delete()
  deleteMany(@Body() dto: ListUserDto) {
    return this.usersService.deleteMany(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/avatar')
  updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvatarDto,
    @GetUser() currentUser: any,
  ) {
    return this.usersService.updateAvatar(id, dto, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/profile')
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @GetUser() currentUser: any,
  ) {
    return this.usersService.updateProfile(id, dto, currentUser);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './public/avatars';
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatarFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() currentUser: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }
    const avatar_url = `/avatars/${file.filename}`;
    const dto = new UpdateAvatarDto();
    dto.avatar_url = avatar_url;

    return this.usersService.updateAvatar(id, dto, currentUser);
  }
}
