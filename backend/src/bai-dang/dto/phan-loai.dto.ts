import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class PhanLoaiDto {
  @IsString()
  @IsNotEmpty()
  ten_phan_loai: string;

  @IsNumber()
  @Min(0)
  gia: number;

  @IsNumber()
  @Min(0)
  so_luong_co: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  so_luong_con_lai?: number;
}
