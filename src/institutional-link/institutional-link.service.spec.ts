import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionalLinkService } from './institutional-link.service';

describe('InstitutionalLinkService', () => {
  let service: InstitutionalLinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstitutionalLinkService],
    }).compile();

    service = module.get<InstitutionalLinkService>(InstitutionalLinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
