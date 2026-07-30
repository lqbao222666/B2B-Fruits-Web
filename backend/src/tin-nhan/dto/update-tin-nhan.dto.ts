import { PartialType } from '@nestjs/mapped-types';
import { CreateTinNhanDto } from './create-tin-nhan.dto';

export class UpdateTinNhanDto extends PartialType(CreateTinNhanDto) {}
