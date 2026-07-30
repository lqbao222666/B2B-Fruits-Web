import { PartialType } from '@nestjs/mapped-types';
import { CreateBaoCaoDto } from './create-bao-cao.dto';

export class UpdateBaoCaoDto extends PartialType(CreateBaoCaoDto) {}
