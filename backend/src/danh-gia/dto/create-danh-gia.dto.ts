import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsArray } from 'class-validator';

export class CreateDanhGiaDto {
  @IsNotEmpty()
  @IsNumber()
  donhang_id: number;

  @IsNotEmpty()
  @IsNumber()
  baidang_id: number;

  @IsNotEmpty()
  @IsNumber()
  nguoi_duoc_dg_id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_tong: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_chat_luong?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  diem_dung_hen?: number;

  @IsOptional()
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
