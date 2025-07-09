import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiKeyGuard } from './auth/guards/api-key.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);

  app.useGlobalGuards(new ApiKeyGuard(reflector, configService));

  app.enableCors({
    origin: [
      configService.get('SITE_URL'),
      configService.get('MOBILE_URL'),
      configService.get('DASHBOARD_URL'),
    ].filter(Boolean),
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization, x-api-key',
    credentials: true, // Permite envio de cookies/auth headers
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Habilita a transformação de tipos (de string para number, etc)
      whitelist: true, // Remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades não permitidas
    }),
  );

  await app.listen(configService.get('PORT') ?? 3333);
}
bootstrap();