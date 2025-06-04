import { createProxyMiddleware } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure CORS
  const corsOptions: CorsOptions = {
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  app.enableCors(corsOptions);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use((req, res, next) => {
    if (req.path === '/api/gateway-health') {
      Logger.log('Skipping proxy for /gateway-health');
      return next(); // Skip proxy and process normally
    }
    createProxyMiddleware({
      target: 'http://localhost:6001/api',
      changeOrigin: true,
    })(req, res, next);
  });

  // app.set('trust proxy', 1);

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
