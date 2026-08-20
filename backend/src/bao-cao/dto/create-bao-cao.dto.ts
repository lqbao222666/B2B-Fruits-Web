import { IsString, IsInt, IsOptional, IsEnum, IsArray, IsDateString } from 'class-validator';
import { LoaiBaoCao, TrangThaiBaoCao, DeXuatBaoCao } from '@prisma/client';

export class CreateBaoCaoDto {
  @IsInt()
  nguoi_baocao_id: number;

  @IsOptional()
  @IsInt()
  nguoi_bi_bc_id?: number;

  @IsOptional()
  @IsInt()
  baidang_id?: number;

  @IsOptional()
  @IsInt()
  donhang_id?: number;

  @IsEnum(LoaiBaoCao)
  loai: LoaiBaoCao;

  @IsString()
  mo_ta: string;

  @IsOptional()
  @IsArray()
  bang_chung?: any[]; // mảng URL ảnh/video

  @IsOptional()
  @IsEnum(DeXuatBaoCao)
  de_xuat?: DeXuatBaoCao;

  @IsOptional()
  @IsDateString()
  ngay_giao_de_xuat?: string;

  @IsOptional()
  @IsEnum(TrangThaiBaoCao)
  trang_thai?: TrangThaiBaoCao;

  @IsOptional()
  @IsInt()
  xu_ly_boi?: number;

  @IsOptional()
  @IsString()
  ghi_chu_xu_ly?: string;
}
