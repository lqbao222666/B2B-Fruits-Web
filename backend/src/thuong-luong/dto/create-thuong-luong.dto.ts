import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ThuongLuongItemDto {
  @IsNotEmpty()
  @IsNumber()
  phanloai_id: number;

  @IsNotEmpty()
  @IsNumber()
  so_luong_mua: number;

  @IsNotEmpty()
  @IsNumber()
  gia_de_xuat: number;
}

export class CreateThuongLuongDto {
  @IsNotEmpty()
  @IsNumber()
  baidang_id: number;

  @IsNotEmpty()
  @IsNumber()
  doanh_nghiep_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThuongLuongItemDto)
  items: ThuongLuongItemDto[];

  @IsNotEmpty()
  @IsString()
  don_vi: string;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  @IsString()
  hinh_thuc_giao_hang?: 'giao_tan_noi' | 'tu_den_lay';

  @IsOptional()
  @IsString()
  dia_chi_giao?: string;

  @IsOptional()
  @IsString()
  tinh_thanh_giao?: string;
}
