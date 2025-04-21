import { Test, TestingModule } from '@nestjs/testing';
import { ThemeColorController } from './theme-color.controller';
import { ThemeColorService } from './theme-color.service';

describe('ThemeColorController', () => {
  let controller: ThemeColorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemeColorController],
      providers: [ThemeColorService],
    }).compile();

    controller = module.get<ThemeColorController>(ThemeColorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
