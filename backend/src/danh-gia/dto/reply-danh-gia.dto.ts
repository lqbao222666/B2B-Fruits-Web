import { IsNotEmpty, IsString } from 'class-validator';

export class ReplyDanhGiaDto {
  @IsNotEmpty()
  @IsString()
  tra_loi: string;
}
