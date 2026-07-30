import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class AddToCartDto {
  @IsInt()
  baidang_id: number;

  @IsInt()
  phanloai_id: number;

  @IsNumber()
  @IsPositive()
  so_luong: number;
}

export class UpdateCartDto {
  @IsNumber()
  @IsPositive()
  so_luong: number;
}
