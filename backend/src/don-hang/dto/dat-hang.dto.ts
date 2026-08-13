import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DatHangItemDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  phanloai_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  so_luong: number;
}

export class DatHangDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  baidang_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  nguoi_ban_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DatHangItemDto)
  items: DatHangItemDto[];

  @IsOptional()
  @IsString()
  dia_chi_giao?: string;

  @IsOptional()
  @IsString()
  tinh_thanh_giao?: string;

  @IsOptional()
  @IsString()
  hinh_thuc_giao_hang?: any; // HinhThucGiaoHang enum

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  khoang_cach?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  phi_van_chuyen?: number;

  @IsOptional()
  @IsString()
  ghi_chu?: string;
}
