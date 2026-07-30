import { PartialType } from '@nestjs/swagger';
import { CreateDiaChiLuuDto } from './create-dia-chi-luu.dto';

export class UpdateDiaChiLuuDto extends PartialType(CreateDiaChiLuuDto) {}
