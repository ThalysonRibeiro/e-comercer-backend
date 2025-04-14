import { Test, TestingModule } from '@nestjs/testing';
import { PromotionHeroService } from './promotion-hero.service';

describe('PromotionHeroService', () => {
  let service: PromotionHeroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionHeroService],
    }).compile();

    service = module.get<PromotionHeroService>(PromotionHeroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
