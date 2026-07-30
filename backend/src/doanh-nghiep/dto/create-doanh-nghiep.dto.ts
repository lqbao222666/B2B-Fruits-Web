import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { TrangThaiTaiKhoan } from '@prisma/client';

export class CreateDoanhNghiepDto {
  @IsInt()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  ten_cong_ty: string;

  @IsOptional()
  @IsString()
  ma_so_thue?: string;

  @IsOptional()
  @IsString()
  nganh_kinh_doanh?: string;

  @IsString()
  @IsNotEmpty()
  tinh_thanh: string;

  @IsOptional()
  @IsString()
  dia_chi?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  giay_phep_kd_url?: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;

  @IsString()
  @IsNotEmpty()
  so_dien_thoai: string;

  @IsOptional()
  @IsString()
  email_lien_he?: string;

  @IsOptional()
  @IsString()
  nguoi_dai_dien?: string;

  @IsOptional()
  @IsString()
  chuc_vu?: string;

  @IsOptional()
  @IsEnum(TrangThaiTaiKhoan)
  trang_thai?: TrangThaiTaiKhoan;
}
