import { PartialType } from '@nestjs/mapped-types';
import { CreateBaiDangDto } from './create-bai-dang.dto';
import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { TrangThaiBaiDang } from '@prisma/client';

export class UpdateBaiDangDto extends PartialType(CreateBaiDangDto) {
  @IsOptional()
  trang_thai?: TrangThaiBaiDang;

  /// Admin ghi lý do khi ẩn / xoá bài đăng không hợp lệ
  @IsOptional()
  @IsString()
  ly_do_tu_choi?: string;

  /// Cập nhật số lượng còn lại (hệ thống tự trừ sau đơn hàng)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  so_luong_con_lai?: number;
}
