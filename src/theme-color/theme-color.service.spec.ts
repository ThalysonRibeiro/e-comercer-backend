import { Test, TestingModule } from '@nestjs/testing';
import { ThemeColorService } from './theme-color.service';

describe('ThemeColorService', () => {
  let service: ThemeColorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThemeColorService],
    }).compile();

    service = module.get<ThemeColorService>(ThemeColorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
