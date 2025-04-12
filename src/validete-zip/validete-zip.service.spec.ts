import { Test, TestingModule } from '@nestjs/testing';
import { ValideteZipService } from './validete-zip.service';

describe('ValideteZipService', () => {
  let service: ValideteZipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValideteZipService],
    }).compile();

    service = module.get<ValideteZipService>(ValideteZipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
