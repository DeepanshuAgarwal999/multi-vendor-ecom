import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { checkOtpRestrictions, sendOtp, trackOtpRequests, verifyOtp } from '../../utils/auth.helper';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly redisService: RedisService) {}

  async userRegistration({ name, email }) {
    const userExist = await this.prisma.users.findUnique({
      where: { email },
    });
    if (userExist) {
      throw new ConflictException('User already exist with this email!');
    }

    await checkOtpRestrictions(email, this.redisService);
    await trackOtpRequests(email, this.redisService);

    // Send OTP for verification
    return await sendOtp(name, email, 'user-activation-mail', this.redisService);
  }

  async verifyRegistrationOtp(email: string, otp: string) {
    return await verifyOtp(email, otp, this.redisService);
  }

  async getAllUsers() {
    return this.prisma.users.findMany();
  }

  async getUser(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async updateUser(id: string, name: string, email: string) {
    return this.prisma.users.update({
      where: { id },
      data: { name, email },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.users.delete({
      where: { id },
    });
  }

  // Cache user data
  async cacheUser(userId: string, userData: any, ttl: number = 3600) {
    await this.redisService.setCache(`user:${userId}`, userData, ttl);
  }

  async getCachedUser(userId: string) {
    return await this.redisService.getCache(`user:${userId}`);
  }

  async removeCachedUser(userId: string) {
    return await this.redisService.delCache(`user:${userId}`);
  }

  // Session management
  async createSession(userId: string, sessionData: any, ttl: number = 86400) {
    // 24 hours
    const sessionId = `session_${userId}_${Date.now()}`;
    await this.redisService.setSession(sessionId, { userId, ...sessionData }, ttl);
    return sessionId;
  }

  async getSession(sessionId: string) {
    return await this.redisService.getSession(sessionId);
  }

  async destroySession(sessionId: string) {
    return await this.redisService.deleteSession(sessionId);
  }
}
