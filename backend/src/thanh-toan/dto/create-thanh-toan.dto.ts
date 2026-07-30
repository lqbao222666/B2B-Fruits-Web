import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PhuongThucThanhToan, TrangThaiThanhToan } from '@prisma/client';

export class CreateThanhToanDto {
  @IsNumber()
  donhang_id: number;

  @IsNumber()
  so_tien: number;

  @IsEnum(PhuongThucThanhToan)
  phuong_thuc: PhuongThucThanhToan;

  @IsString()
  @IsOptional()
  ma_gd_cong?: string;

  @IsEnum(TrangThaiThanhToan)
  @IsOptional()
  trang_thai?: TrangThaiThanhToan;

  @IsOptional()
  metadata?: any;
}
