import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { checkOtpRestrictions, sendOtp, trackOtpRequests, verifyOtp } from '../../utils/auth.helper';
import { RedisService } from '@packages/libs/redis/redis.service';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}

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

  async verifyRegistrationOtp({
    email,
    otp,
    password,
    name,
  }: {
    email: string;
    otp: string;
    password: string;
    name: string;
  }) {
    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exist with this email!');
    }
    await verifyOtp(email, otp, this.redisService);
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    return {
      success: true,
      message: 'User created successfully',
    };
  }

  async loginUser(email: string, password: string, response?: Response) {
    if (!email || !password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = this.jwtService.sign({ id: user.id, role: 'user' }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { id: user.id, role: 'user' },
      { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET }
    );
    const sessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await this.redisService.setSession(
      sessionId,
      {
        accessToken,
        refreshToken,
        createdAt: new Date().toISOString(),
      },
      7 * 24 * 60 * 60
    );
    if (response) {
      response.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  
  async validateSession(sessionId: string) {
    const session: any = await this.redisService.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session expired');
    }
    const accessToken = this.jwtService.verify(session.accessToken);
    if (!accessToken || accessToken.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Session expired');
    }
    const refreshToken = this.jwtService.verify(session.refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET });
    if (!refreshToken || refreshToken.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Session expired');
    }
    return session;
  }

  async userForgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    checkOtpRestrictions(email, this.redisService);
    trackOtpRequests(email, this.redisService);
    await sendOtp(user.name, email, 'user-forgot-password-mail', this.redisService);
    return {
      message: 'OTP sent to email, please check your email for verification',
    };
  }

  async verifyForgotPasswordOtp({ email, otp }: { email: string; otp: string }) {
    if (!email || !otp) {
      throw new BadRequestException('Invalid email or OTP');
    }
    await verifyOtp(email, otp, this.redisService);
    return {
      success: true,
      message: 'User password updated successfully',
    };
  }
  async userResetPassword(email: string, newPassword: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordSame = await bcrypt.compare(newPassword, user.password);
    if (isPasswordSame) {
      throw new ConflictException('New password is same as old password');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return {
      success: true,
      message: 'Password reset successfully',
    };
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

}
