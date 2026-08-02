import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PhanLoaiDto } from './phan-loai.dto';

export class CreateBaiDangDto {
  @IsInt()
  nguoi_dang_id: number;

  @IsInt()
  danhmuc_id: number;

  @IsString()
  tieu_de: string;

  @IsString()
  mo_ta: string;

  @IsString()
  ten_nong_san: string;

  /// Đơn vị: kg | tấn | thùng | bao | trái
  @IsString()
  don_vi_tinh: string;

  /// Số lượng ban đầu của lô hàng
  @IsNumber()
  @Min(0)
  so_luong_co: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  so_luong_toi_thieu?: number;

  /// Giá bán theo kg — Nông Dân tự định
  @IsNumber()
  @Min(0)
  gia_per_kg: number;

  @IsString()
  tinh_thanh: string;

  @IsOptional()
  @IsString()
  dia_chi_lay_hang?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsDateString()
  ngay_thu_hoach?: string;

  @IsOptional()
  @IsDateString()
  han_su_dung?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tieu_chuan_ids?: number[];

  @IsOptional()
  @IsArray()
  images?: any[];

  @IsOptional()
  @IsString()
  video_url?: string;

  @IsOptional()
  @IsBoolean()
  is_seasonal?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhanLoaiDto)
  phan_loais?: PhanLoaiDto[];
}
