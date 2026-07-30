import { PartialType } from '@nestjs/mapped-types';
import { CreateDoanhNghiepDto } from './create-doanh-nghiep.dto';

export class UpdateDoanhNghiepDto extends PartialType(CreateDoanhNghiepDto) {}
