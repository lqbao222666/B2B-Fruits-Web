import { Injectable } from '@nestjs/common';
import { CreateChungLoaiDto } from './dto/create-chung-loai.dto';
import { UpdateChungLoaiDto } from './dto/update-chung-loai.dto';
import { ChungLoaiRepository } from './chung-loai.repository';

@Injectable()
export class ChungLoaiService {
  constructor(private readonly chungLoaiRepo: ChungLoaiRepository) {}

  create(createChungLoaiDto: CreateChungLoaiDto) {
    return this.chungLoaiRepo.create(createChungLoaiDto);
  }

  findAll() {
    return this.chungLoaiRepo.findAll();
  }

  findOne(id: number) {
    return this.chungLoaiRepo.findOne(id);
  }

  update(id: number, updateChungLoaiDto: UpdateChungLoaiDto) {
    return this.chungLoaiRepo.update(id, updateChungLoaiDto);
  }

  remove(id: number) {
    return this.chungLoaiRepo.remove(id);
  }
}
