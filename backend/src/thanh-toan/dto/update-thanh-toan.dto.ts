import { PartialType } from '@nestjs/mapped-types';
import { CreateThanhToanDto } from './create-thanh-toan.dto';

export class UpdateThanhToanDto extends PartialType(CreateThanhToanDto) {}
