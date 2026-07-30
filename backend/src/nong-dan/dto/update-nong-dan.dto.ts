import { PartialType } from '@nestjs/mapped-types';
import { CreateNongDanDto } from './create-nong-dan.dto';

export class UpdateNongDanDto extends PartialType(CreateNongDanDto) {}
