/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { CustomExceptionFilter } from 'packages/error-handler/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: true, // Allow all origins
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.enableCors(corsOptions);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalFilters(new CustomExceptionFilter());
  const port = process.env.PORT || 6001;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
