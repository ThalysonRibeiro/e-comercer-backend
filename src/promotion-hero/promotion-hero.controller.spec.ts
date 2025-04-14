import { Test, TestingModule } from '@nestjs/testing';
import { PromotionHeroController } from './promotion-hero.controller';
import { PromotionHeroService } from './promotion-hero.service';

describe('PromotionHeroController', () => {
  let controller: PromotionHeroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionHeroController],
      providers: [PromotionHeroService],
    }).compile();

    controller = module.get<PromotionHeroController>(PromotionHeroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
