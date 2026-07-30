import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateTinNhanDto {
  @IsOptional()
  @IsInt()
  nguoi_gui_id?: number; // Controller sẽ tự inject từ JWT token

  @IsInt()
  nguoi_nhan_id: number;

  @IsOptional()
  @IsInt()
  donhang_id?: number;

  @IsString()
  noi_dung: string;

  @IsOptional()
  @IsArray()
  attachments?: any[];

  @IsOptional()
  @IsBoolean()
  da_doc?: boolean;
}
