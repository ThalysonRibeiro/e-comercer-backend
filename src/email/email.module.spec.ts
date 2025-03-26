import { Test } from '@nestjs/testing';
import { EmailModule } from './email.module';
import { EmailService } from './email.service';

jest.mock('./email.service');

describe('EmailModule', () => {
  let emailModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EmailModule],
    }).compile();

    emailModule = moduleRef.get(EmailModule);
  });

  it('should be defined', () => {
    expect(emailModule).toBeDefined();
  });

  describe('Module structure', () => {
    it('should provide EmailService', () => {
      const providers = Reflect.getMetadata('providers', EmailModule);
      expect(providers).toContain(EmailService);
    });
  });

  describe('Module exports', () => {
    it('should export EmailService', () => {
      const exports = Reflect.getMetadata('exports', EmailModule);
      expect(exports).toContain(EmailService);
    });
  });

  describe('Module integration', () => {
    it('should allow accessing EmailService from the module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailModule],
      }).compile();

      const emailService = moduleRef.get<EmailService>(EmailService);
      expect(emailService).toBeDefined();
    });
  });
});
