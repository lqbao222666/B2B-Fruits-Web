import { IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ThuongLuongItemDto } from './create-thuong-luong.dto';

export class PhanHoiThuongLuongDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThuongLuongItemDto)
  items?: ThuongLuongItemDto[];

  @IsOptional()
  @IsString()
  ghi_chu?: string;

  @IsOptional()
  @IsString()
  trang_thai?:
    | 'cho_nong_dan'
    | 'cho_doanh_nghiep'
    | 'da_thong_nhat'
    | 'tu_choi'
    | 'da_huy';

  @IsOptional()
  @IsString()
  sender_role?: 'nong_dan' | 'doanh_nghiep' | 'admin' | 'he_thong';
}
