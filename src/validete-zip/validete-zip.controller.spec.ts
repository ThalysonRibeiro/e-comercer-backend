import { Test, TestingModule } from '@nestjs/testing';
import { ValideteZipController } from './validete-zip.controller';

describe('ValideteZipController', () => {
  let controller: ValideteZipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ValideteZipController],
    }).compile();

    controller = module.get<ValideteZipController>(ValideteZipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
