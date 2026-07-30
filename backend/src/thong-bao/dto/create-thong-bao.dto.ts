import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LoaiThongBao, KenhThongBao } from '@prisma/client';

export class CreateThongBaoDto {
  @IsNumber()
  user_id: number;

  @IsEnum(LoaiThongBao)
  loai: LoaiThongBao;

  @IsString()
  tieu_de: string;

  @IsString()
  noi_dung: string;

  @IsNumber()
  @IsOptional()
  ref_id?: number;

  @IsString()
  @IsOptional()
  ref_type?: string;

  @IsEnum(KenhThongBao)
  @IsOptional()
  kenh?: KenhThongBao;

  @IsBoolean()
  @IsOptional()
  da_doc?: boolean;
}
