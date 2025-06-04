import { Controller, Get } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get('redis')
  async checkRedisHealth() {
    try {
      const pingResult = await this.redisService.ping();
      return {
        status: 'healthy',
        redis: {
          connected: true,
          ping: pingResult,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        redis: {
          connected: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  @Get()
  async checkOverallHealth() {
    try {
      const redisHealth = await this.checkRedisHealth();
      return {
        status: redisHealth.status,
        services: {
          redis: redisHealth.redis,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
