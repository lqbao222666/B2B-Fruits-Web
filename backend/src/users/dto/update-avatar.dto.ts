import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateAvatarDto {
  @IsNotEmpty()
  @IsString()
  avatar_url: string;
}
