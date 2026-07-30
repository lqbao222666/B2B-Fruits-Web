import { Test, TestingModule } from '@nestjs/testing';
import { TieuChuanService } from './tieu-chuan.service';

describe('TieuChuanService', () => {
  let service: TieuChuanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TieuChuanService],
    }).compile();

    service = module.get<TieuChuanService>(TieuChuanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
