import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  old_password: string;

  @IsNotEmpty()
  new_password: string;

  @IsNotEmpty()
  confirm_password: string;
}
