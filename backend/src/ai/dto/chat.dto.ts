import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LichSuTinNhanDto {
  @IsEnum(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsEnum(['nong_dan', 'doanh_nghiep', 'admin'])
  role_nguoi_dung?: 'nong_dan' | 'doanh_nghiep' | 'admin';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LichSuTinNhanDto)
  lich_su?: LichSuTinNhanDto[];
}
