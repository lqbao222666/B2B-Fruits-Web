import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SuggestPriceDto {
  @IsNotEmpty()
  @IsString()
  ten_nong_san: string;

  @IsOptional()
  @IsString()
  don_vi_tinh?: string;

  @IsNotEmpty()
  @IsString()
  tinh_thanh: string;
}
