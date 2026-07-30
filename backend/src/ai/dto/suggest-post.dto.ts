import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SuggestPostDto {
  @IsString()
  @IsOptional()
  tieu_de?: string;

  @IsString()
  @IsNotEmpty()
  ten_nong_san: string;

  @IsNumber()
  @IsOptional()
  so_luong_co?: number;

  @IsString()
  @IsOptional()
  don_vi_tinh?: string;

  @IsString()
  @IsNotEmpty()
  tinh_thanh: string;
}
