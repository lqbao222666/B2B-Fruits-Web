import { Test, TestingModule } from '@nestjs/testing';
import { ChungLoaiController } from './chung-loai.controller';

describe('ChungLoaiController', () => {
  let controller: ChungLoaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChungLoaiController],
    }).compile();

    controller = module.get<ChungLoaiController>(ChungLoaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
