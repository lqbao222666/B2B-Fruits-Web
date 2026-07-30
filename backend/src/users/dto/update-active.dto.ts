import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateActiveDto {
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}
