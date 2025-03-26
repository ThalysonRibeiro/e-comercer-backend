import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: process.env.FRONTEND_URL,// Permitir todas as origens
    origin: '*', // Permitir todas as origens
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true, // Habilita a transformação de tipos (de string para number, etc)
      whitelist: true, // Remove propriedades não declaradas no DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
