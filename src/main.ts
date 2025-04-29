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
    origin: process.env.FRONTEND_URL,
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization, x-api-key',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Habilita a transformação de tipos (de string para number, etc)
      whitelist: true, // Remove propriedades não declaradas no DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
