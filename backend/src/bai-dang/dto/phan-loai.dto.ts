import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PhanLoaiDto {
  @IsString()
  @IsNotEmpty()
  ten_phan_loai: string;

  @IsNumber()
  @IsPositive()
  gia: number;

  @IsNumber()
  @IsPositive()
  so_luong_co: number;
}
