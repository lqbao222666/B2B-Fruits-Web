import { IsString, IsOptional, IsInt, IsNumber, IsEnum } from 'class-validator';
import {
  TrangThaiDonHang,
  TrangThaiThanhToan,
  PhuongThucThanhToan,
  HinhThucGiaoHang,
} from '@prisma/client';

export class CreateDonHangDto {
  @IsInt()
  nguoi_mua_id: number;

  @IsInt()
  nguoi_ban_id: number;

  @IsInt()
  baidang_id: number;

  @IsString()
  ma_don_hang: string;

  @IsNumber()
  so_luong: number;

  @IsString()
  don_vi_tinh: string;

  @IsNumber()
  don_gia: number;

  @IsNumber()
  tong_tien: number;

  @IsString()
  dia_chi_giao: string;

  @IsString()
  tinh_thanh_giao: string;

  @IsOptional()
  @IsEnum(HinhThucGiaoHang)
  hinh_thuc_giao_hang?: HinhThucGiaoHang;

  @IsOptional()
  @IsNumber()
  khoang_cach?: number;

  @IsOptional()
  @IsNumber()
  phi_van_chuyen?: number;

  @IsOptional()
  @IsNumber()
  tien_coc?: number;

  @IsOptional()
  nong_dan_da_tt_vanchuyen?: boolean;

  @IsOptional()
  doanh_nghiep_da_tt_coc?: boolean;

  @IsOptional()
  @IsString()
  ma_xac_nhan?: string;

  @IsOptional()
  @IsEnum(PhuongThucThanhToan)
  phuong_thuc_tt?: PhuongThucThanhToan;

  @IsOptional()
  @IsEnum(TrangThaiThanhToan)
  trang_thai_tt?: TrangThaiThanhToan;

  @IsOptional()
  @IsEnum(TrangThaiDonHang)
  trang_thai_don?: TrangThaiDonHang;

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  @IsString()
  ly_do_huy?: string;
}
