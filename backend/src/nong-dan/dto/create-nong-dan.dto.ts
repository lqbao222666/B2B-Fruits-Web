import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsObject,
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
  @IsString()
  phuong_thuc_nhan_tien?: string;

  @IsOptional()
  @IsString()
  ngan_hang?: string;

  @IsOptional()
  @IsString()
  so_tai_khoan?: string;

  @IsOptional()
  @IsString()
  chu_tai_khoan?: string;

  @IsOptional()
  @IsNumber()
  diem_trung_binh?: number;

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
  @IsString()
  ma_so_thue?: string;

  @IsOptional()
  @IsString()
  ten_co_so_kd?: string;

  @IsOptional()
  @IsString()
  doi_tuong_dang_ky?: string;

  @IsOptional()
  @IsObject()
  thong_tin_xuat_hoa_don?: any;

  @IsOptional()
  @IsEnum(TrangThaiTaiKhoan)
  trang_thai?: TrangThaiTaiKhoan;
}
