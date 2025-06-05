import { Module } from '@nestjs/common';
import { RedisModule as IORedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    IORedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
        options: {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          keepAlive: 0,
          connectTimeout: 10000,
          commandTimeout: 5000,
          enableReadyCheck: false,
          maxLoadingTimeout: 0,
          // Handle connection errors gracefully
          reconnectOnError: err => {
            console.error('Redis reconnection error:', err.message);
            return false;
          },
          retryDelayOnClusterDown: 300,
          enableOfflineQueue: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
