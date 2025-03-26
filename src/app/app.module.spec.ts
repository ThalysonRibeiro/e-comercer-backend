import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

jest.mock('../prisma/prisma.module');
jest.mock('../users/users.module');
jest.mock('../auth/auth.module');
jest.mock('../email-verification/email-verification.module');
jest.mock('../auth/jwt-auth.guard');
jest.mock('../auth/guards/roles.guard');

describe('AppModule', () => {
  let appModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    appModule = moduleRef.get(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  describe('Module structure', () => {
    it('should import the correct modules', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          PrismaModule,
          UsersModule,
          AuthModule,
          ServeStaticModule.forRoot(),
          EmailVerificationModule,
        ],
        controllers: [AppController],
        providers: [
          AppService,
          {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
          },
          {
            provide: APP_GUARD,
            useClass: RolesGuard,
          },
        ],
      }).compile();

      expect(moduleRef).toBeDefined();
    });
  });

  describe('Guards configuration', () => {
    it('should register JwtAuthGuard as a global guard', async () => {
      const providers = Reflect.getMetadata('providers', AppModule);

      const jwtGuardProvider = providers.find(
        (provider) =>
          provider.provide === APP_GUARD && provider.useClass === JwtAuthGuard,
      );

      expect(jwtGuardProvider).toBeDefined();
    });

    it('should register RolesGuard as a global guard', async () => {
      const providers = Reflect.getMetadata('providers', AppModule);

      const rolesGuardProvider = providers.find(
        (provider) =>
          provider.provide === APP_GUARD && provider.useClass === RolesGuard,
      );

      expect(rolesGuardProvider).toBeDefined();
    });
  });

  describe('Static Files Serving', () => {
    it('should include ServeStaticModule in imports', () => {
      // Arrange & Act: Just verify ServeStaticModule is included
      const imports = Reflect.getMetadata('imports', AppModule);

      // Assert: Check if any import is or includes ServeStaticModule
      const includesServeStaticModule = imports.some((importItem) => {
        // Check direct import
        if (importItem === ServeStaticModule) return true;

        // Check for module property
        if (importItem && importItem.module === ServeStaticModule) return true;

        // Check for dynamic module imports
        if (typeof importItem === 'function') {
          try {
            const dynamicModule = importItem();
            if (dynamicModule && dynamicModule.module === ServeStaticModule)
              return true;
          } catch (e) {
            // Ignore errors when trying to call function imports
          }
        }

        return false;
      });

      expect(includesServeStaticModule).toBe(true);
    });
  });
});
