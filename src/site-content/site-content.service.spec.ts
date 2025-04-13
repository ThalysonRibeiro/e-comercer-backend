import { Test, TestingModule } from '@nestjs/testing';
import { SiteContentService } from './site-content.service';

describe('SiteContentService', () => {
  let service: SiteContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiteContentService],
    }).compile();

    service = module.get<SiteContentService>(SiteContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
