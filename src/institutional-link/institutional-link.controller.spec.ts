import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionalLinkController } from './institutional-link.controller';
import { InstitutionalLinkService } from './institutional-link.service';

describe('InstitutionalLinkController', () => {
  let controller: InstitutionalLinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionalLinkController],
      providers: [InstitutionalLinkService],
    }).compile();

    controller = module.get<InstitutionalLinkController>(InstitutionalLinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
