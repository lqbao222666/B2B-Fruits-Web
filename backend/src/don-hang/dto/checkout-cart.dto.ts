import { IsArray, IsInt, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { HinhThucGiaoHang } from '@prisma/client';

export class CheckoutCartDto {
  @Type(() => Number)
  @IsInt()
  nguoi_ban_id: number;

  @Type(() => Number)
  @IsInt()
  baidang_id: number;

  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  giohang_ids: number[];

  @IsString()
  dia_chi_giao: string;

  @IsString()
  tinh_thanh_giao: string;

  @IsString()
  hinh_thuc_giao_hang: HinhThucGiaoHang;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  khoang_cach?: number;

  @IsOptional()
  @IsString()
  ghi_chu?: string;
}
