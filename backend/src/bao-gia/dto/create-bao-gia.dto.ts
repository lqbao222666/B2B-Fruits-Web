import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBaoGiaDto {
  @IsInt()
  nhucau_id: number;

  @IsInt()
  nong_dan_id: number;

  @IsNumber()
  so_luong_cung_cap: number;

  @IsString()
  don_vi: string;

  @IsNumber()
  gia_de_xuat: number;

  @IsOptional()
  @IsNumber()
  chenh_lech_gia?: number;

  @IsOptional()
  @IsString()
  dia_chi_cung_cap?: string;

  @IsOptional()
  @IsString()
  tinh_thanh_cung_cap?: string;

  @IsOptional()
  @IsNumber()
  latitude_cung_cap?: number;

  @IsOptional()
  @IsNumber()
  longitude_cung_cap?: number;

  @IsOptional()
  @IsNumber()
  khoang_cach_km?: number;

  @IsOptional()
  @IsNumber()
  phi_van_chuyen?: number;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  @IsString()
  trang_thai?: string;

  @IsOptional()
  @IsString()
  tieu_chuan_nong_dan?: string;
}
