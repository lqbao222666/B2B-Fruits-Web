import { PartialType } from '@nestjs/mapped-types';
import { CreateNhuCauDto } from './create-nhu-cau.dto';

export class UpdateNhuCauDto extends PartialType(CreateNhuCauDto) {}
