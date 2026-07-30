import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/auth/role.enum';

export class UserResponseDto {
  @Expose()
  user_id: number;

  @Expose()
  email: string;

  @Exclude()
  password_hash: string;

  @Expose()
  full_name: string;

  @Expose()
  role: Role;

  @Expose()
  avatar_url: string | null;

  @Expose()
  is_verified: boolean;

  @Expose()
  is_active: boolean;

  @Expose()
  phone: string | null;

  @Expose()
  ngay_sinh: Date | null;

  @Expose()
  gioi_tinh: string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
