import { Test, TestingModule } from '@nestjs/testing';
import { ChungLoaiService } from './chung-loai.service';

describe('ChungLoaiService', () => {
  let service: ChungLoaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChungLoaiService],
    }).compile();

    service = module.get<ChungLoaiService>(ChungLoaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
