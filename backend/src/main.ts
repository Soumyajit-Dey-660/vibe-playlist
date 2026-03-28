import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const corsOrigin = configService.get<string>('app.corsOrigin');

  // Increase JSON body size limit for base64 canvas images
  app.use(express.json({ limit: '10mb' }));

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(port ?? 3001);
  console.log(`Vibe Playlist backend running on http://localhost:${port}/api`);
}
bootstrap();
