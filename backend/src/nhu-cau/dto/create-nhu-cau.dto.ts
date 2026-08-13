import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { TrangThaiNhuCau } from '@prisma/client';

export class CreateNhuCauDto {
  @IsInt()
  doanh_nghiep_id: number;

  @IsOptional()
  @IsInt()
  danhmuc_id?: number;

  @IsString()
  ten_nong_san: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;

  @IsNumber()
  so_luong_can: number;

  @IsString()
  don_vi: string;

  @IsOptional()
  @IsNumber()
  gia_tham_khao?: number;

  @IsOptional()
  @IsBoolean()
  cho_thuong_luong?: boolean;

  @IsOptional()
  @IsString()
  yeu_cau_chung_nhan?: string;

  @IsOptional()
  @IsString()
  tinh_thanh_giao?: string;

  @IsOptional()
  @IsString()
  dia_chi_giao?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsDateString()
  ngay_bat_dau?: string;

  @IsOptional()
  @IsDateString()
  ngay_ket_thuc?: string;

  @IsOptional()
  @IsEnum(TrangThaiNhuCau)
  trang_thai?: TrangThaiNhuCau;
}
