import { PartialType } from '@nestjs/mapped-types';
import { CreateTieuChuanDto } from './create-tieu-chuan.dto';

export class UpdateTieuChuanDto extends PartialType(CreateTieuChuanDto) {}
