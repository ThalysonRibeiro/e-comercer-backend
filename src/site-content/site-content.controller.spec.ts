import { Test, TestingModule } from '@nestjs/testing';
import { SiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

describe('SiteContentController', () => {
  let controller: SiteContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteContentController],
      providers: [SiteContentService],
    }).compile();

    controller = module.get<SiteContentController>(SiteContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
