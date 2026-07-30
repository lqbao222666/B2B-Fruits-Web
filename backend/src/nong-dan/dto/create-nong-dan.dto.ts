import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { TrangThaiTaiKhoan } from '@prisma/client';

export class CreateNongDanDto {
  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  ho_ten: string;

  @IsOptional()
  @IsString()
  so_cmnd_cccd?: string;

  @IsString()
  @IsNotEmpty()
  tinh_thanh: string;

  @IsOptional()
  @IsString()
  huyen_xa?: string;

  @IsOptional()
  @IsString()
  dia_chi_cu_the?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  dien_tich_ha?: number;

  @IsOptional()
  @IsString()
  nong_san_chinh?: string;

  @IsOptional()
  @IsString()
  chung_nhan?: string;

  @IsOptional()
  @IsArray()
  giay_phep_urls?: any[];

  @IsOptional()
  @IsString()
  mo_ta_ban_than?: string;

  @IsString()
  @IsNotEmpty()
  so_dien_thoai: string;

  @IsOptional()
  @IsString()
  email_lien_he?: string;

  @IsOptional()
  @IsEnum(TrangThaiTaiKhoan)
  trang_thai?: TrangThaiTaiKhoan;
}
