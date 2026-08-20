import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDanhGiaDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  donhang_id: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baidang_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nhucau_id?: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  nguoi_duoc_dg_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_tong: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_chat_luong?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_dung_hen?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_thai_do?: number;

  @IsOptional()
  @IsString()
  nhan_xet?: string;

  @IsOptional()
  @IsArray()
  images?: any[];
}
