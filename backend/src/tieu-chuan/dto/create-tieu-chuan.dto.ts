import { IsString, IsOptional } from 'class-validator';

export class CreateTieuChuanDto {
  @IsString()
  ten_tieu_chuan: string;

  @IsOptional()
  @IsString()
  mo_ta?: string;

  @IsOptional()
  @IsString()
  icon_url?: string;
}
