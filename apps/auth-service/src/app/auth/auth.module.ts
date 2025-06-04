import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [PrismaService, AuthService, AuthResolver],
  exports: [],
})
export class AuthModule {
}
