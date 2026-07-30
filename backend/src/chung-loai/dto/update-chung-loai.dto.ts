import { PartialType } from '@nestjs/mapped-types';
import { CreateChungLoaiDto } from './create-chung-loai.dto';

export class UpdateChungLoaiDto extends PartialType(CreateChungLoaiDto) {}
