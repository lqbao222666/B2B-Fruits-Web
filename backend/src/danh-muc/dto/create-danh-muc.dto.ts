import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateDanhMucDto {
  @IsString()
  ten_danh_muc: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsInt()
  chungloai_id?: number;

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
