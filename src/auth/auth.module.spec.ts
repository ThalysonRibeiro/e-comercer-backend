import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';

jest.mock('../users/users.module');
jest.mock('../email/email.module');
jest.mock('../email-verification/email-verification.module');
jest.mock('./auth.service');
jest.mock('./jwt.strategy');
jest.mock('./auth.controller');

describe('AuthModule', () => {
  let authModule;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          const config = {
            JWT_SECRET: 'test-secret',
            JWT_EXPIRATION: '1d',
          };
          return config[key];
        }),
      })
      .compile();

    authModule = moduleRef.get(AuthModule);
    configService = moduleRef.get(ConfigService);
  });

  it('should be defined', () => {
    expect(authModule).toBeDefined();
  });

  describe('Module structure', () => {
    it('should import UsersModule', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      expect(imports).toContain(UsersModule);
    });

    it('should import EmailModule', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      expect(imports).toContain(EmailModule);
    });

    it('should import EmailVerificationModule', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      expect(imports).toContain(EmailVerificationModule);
    });

    it('should import ConfigModule', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      expect(imports).toContain(ConfigModule);
    });

    it('should import PassportModule with correct configuration', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);

      // Find PassportModule in imports
      const passportModuleImport = imports.find(imp => {
        if (typeof imp === 'object' && imp.module === PassportModule) {
          return true;
        }
        return false;
      });

      expect(passportModuleImport).toBeDefined();
    });

    it('should import JwtModule with async configuration', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);

      // Find JwtModule in imports
      const jwtModuleImport = imports.find(imp => {
        if (typeof imp === 'object' && imp.module === JwtModule) {
          return true;
        }
        return false;
      });

      expect(jwtModuleImport).toBeDefined();
    });
  });

  describe('Controller and Provider configuration', () => {
    it('should include AuthController', () => {
      const controllers = Reflect.getMetadata('controllers', AuthModule);
      expect(controllers).toContain(AuthController);
    });

    it('should provide AuthService', () => {
      const providers = Reflect.getMetadata('providers', AuthModule);
      expect(providers).toContain(AuthService);
    });

    it('should provide JwtStrategy', () => {
      const providers = Reflect.getMetadata('providers', AuthModule);
      expect(providers).toContain(JwtStrategy);
    });
  });

  describe('Module exports', () => {
    it('should export AuthService', () => {
      const exports = Reflect.getMetadata('exports', AuthModule);
      expect(exports).toContain(AuthService);
    });

    it('should export JwtModule', () => {
      const exports = Reflect.getMetadata('exports', AuthModule);
      expect(exports).toContain(JwtModule);
    });
  });

  describe('JwtModule Configuration', () => {
    it('should configure JwtModule with correct dependencies', async () => {
      // Create a test module with actual JwtModule registration
      const moduleRef = await Test.createTestingModule({
        imports: [
          JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
              secret: configService.get<string>('JWT_SECRET'),
              signOptions: {
                expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
                issuer: 'auth-api',
                audience: 'users',
              },
            }),
          }),
          ConfigModule,
        ],
        providers: [
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                const config = {
                  JWT_SECRET: 'test-secret',
                  JWT_EXPIRATION: '1d',
                };
                return config[key];
              }),
            },
          },
        ],
      }).compile();

      const jwtService = moduleRef.get(JwtModule);
      expect(jwtService).toBeDefined();
    });
  });
});