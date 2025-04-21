import { All, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('/gateway-health')
  getGatewayHealth() {
    const uptime = process.uptime();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      service: 'api-gateway',
    };
  }
}
