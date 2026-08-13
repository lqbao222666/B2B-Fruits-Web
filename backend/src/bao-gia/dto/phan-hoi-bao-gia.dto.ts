import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TrangThaiBaoGia } from '@prisma/client';

export class PhanHoiBaoGiaDto {
  @IsOptional()
  @IsNumber()
  so_luong_cung_cap?: number;

  @IsOptional()
  @IsNumber()
  gia_de_xuat?: number;

  @IsOptional()
  @IsNumber()
  chenh_lech_gia?: number;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  @IsEnum(TrangThaiBaoGia)
  trang_thai?: TrangThaiBaoGia;

  @IsOptional()
  @IsString()
  sender_role?: string; // 'nong_dan' | 'doanh_nghiep'
}
