import { Test } from '@nestjs/testing';
import { EmailVerificationModule } from './email-verification.module';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';

jest.mock('./email-verification.controller');
jest.mock('./email-verification.service');
jest.mock('../prisma/prisma.module');
jest.mock('../email/email.module');

describe('EmailVerificationModule', () => {
  let emailVerificationModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [EmailVerificationModule],
    }).compile();

    emailVerificationModule = moduleRef.get(EmailVerificationModule);
  });

  it('should be defined', () => {
    expect(emailVerificationModule).toBeDefined();
  });

  describe('Module structure', () => {
    it('should import PrismaModule', () => {
      const imports = Reflect.getMetadata('imports', EmailVerificationModule);
      expect(imports).toContain(PrismaModule);
    });

    it('should import EmailModule', () => {
      const imports = Reflect.getMetadata('imports', EmailVerificationModule);
      expect(imports).toContain(EmailModule);
    });

    it('should import ConfigModule', () => {
      const imports = Reflect.getMetadata('imports', EmailVerificationModule);
      expect(imports).toContain(ConfigModule);
    });

    it('should declare EmailVerificationController', () => {
      const controllers = Reflect.getMetadata('controllers', EmailVerificationModule);
      expect(controllers).toContain(EmailVerificationController);
    });

    it('should provide EmailVerificationService', () => {
      const providers = Reflect.getMetadata('providers', EmailVerificationModule);
      expect(providers).toContain(EmailVerificationService);
    });
  });

  describe('Module exports', () => {
    it('should export EmailVerificationService', () => {
      const exports = Reflect.getMetadata('exports', EmailVerificationModule);
      expect(exports).toContain(EmailVerificationService);
    });
  });

  describe('Module integration', () => {
    it('should allow accessing EmailVerificationService from the module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailVerificationModule],
      })
        .overrideModule(PrismaModule)
        .useModule({
          module: class MockPrismaModule { },
          providers: [{ provide: 'PrismaService', useValue: {} }],
          exports: ['PrismaService'],
        })
        .overrideModule(EmailModule)
        .useModule({
          module: class MockEmailModule { },
          providers: [{ provide: 'EmailService', useValue: {} }],
          exports: ['EmailService'],
        })
        .compile();

      const emailVerificationService = moduleRef.get<EmailVerificationService>(EmailVerificationService);
      expect(emailVerificationService).toBeDefined();
    });

    it('should allow accessing EmailVerificationController from the module', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [EmailVerificationModule],
      })
        .overrideModule(PrismaModule)
        .useModule({
          module: class MockPrismaModule { },
          providers: [{ provide: 'PrismaService', useValue: {} }],
          exports: ['PrismaService'],
        })
        .overrideModule(EmailModule)
        .useModule({
          module: class MockEmailModule { },
          providers: [{ provide: 'EmailService', useValue: {} }],
          exports: ['EmailService'],
        })
        .compile();

      const emailVerificationController = moduleRef.get<EmailVerificationController>(EmailVerificationController);
      expect(emailVerificationController).toBeDefined();
    });
  });
});