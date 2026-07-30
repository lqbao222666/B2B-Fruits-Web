import { Test, TestingModule } from '@nestjs/testing';
import { TieuChuanController } from './tieu-chuan.controller';

describe('TieuChuanController', () => {
  let controller: TieuChuanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TieuChuanController],
    }).compile();

    controller = module.get<TieuChuanController>(TieuChuanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
