import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  providers: [PrismaService, UserService, UserResolver],
  exports: [],
})
export class UserModule {}
