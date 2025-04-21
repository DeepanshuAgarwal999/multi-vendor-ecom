import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Injectable()
class CustomThrottlerGuard extends ThrottlerGuard {
  async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }

  protected getLimit(context: ExecutionContext): number {
    const request = context.switchToHttp().getRequest();
    return request.user ? 1000 : 100;
  }
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 15 * 60 * 1000,
        limit: 1000, // This will be overridden by CustomThrottlerGuard
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
