import { All, Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { RedisService } from '@packages/libs/redis/redis.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly redisService: RedisService) {}

  @Get('/ping')
  async getGatewayHealth() {
    const uptime = process.uptime();
    let redisHealth = {};
    try {
      redisHealth = await this.redisService.ping();
    } catch (error) {
      console.log('Error while pinging redis', error);
    }
    return {
      server: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        service: 'api-gateway',
      },
      redis: redisHealth,
    };
  }

  @Get('/favicon.ico')
  getFavicon(@Res() res: Response) {
    // Return a 204 No Content status for favicon requests
    // This prevents 404 errors and stops browsers from repeatedly requesting it
    res.status(204).end();
  }
}
