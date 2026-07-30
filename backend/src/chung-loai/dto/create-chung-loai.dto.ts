import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateChungLoaiDto {
  @IsString()
  ten_chung_loai: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;

  @IsOptional()
  @IsString()
  icon_url?: string;

  @IsOptional()
  @IsInt()
  thu_tu?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
