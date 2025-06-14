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
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { decode } from 'punycode';
import { setCookies, clearAuthCookies } from '../../utils/cookie.helper';

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
    // Generate tokens
    const accessToken = this.jwtService.sign({ id: user.id, role: 'user' }, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { id: user.id, role: 'user' },
      { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET }
    );

    if (response) {
      // Use helper to set cookies consistently
      const tokens = setCookies(response, accessToken, refreshToken);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        message: 'Login successful',
        tokens,
      };
    }

    // If no response object is provided, just return the data
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: 'Login successful',
    };
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

  async refreshToken(req: Request, res: Response) {
    let refreshToken = null;
    if (req.cookies && typeof req.cookies === 'object' && req.cookies.refreshToken) {
      refreshToken = req.cookies.refreshToken as string;
    }
    if (!refreshToken) throw new UnauthorizedException('Unauthorized! Refresh token not found.');

    try {
      const decoded = this.jwtService.verify(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET }) as {
        id: string;
        role: string;
        exp: number;
      };
      if (!decoded || !decoded.id || !decoded.role) throw new JsonWebTokenError('Forbidden! Invalid refresh token');

      let account;
      if (decoded.role === 'user') {
        account = await this.prisma.users.findUnique({
          where: { id: decoded.id },
        });
      } else {
        // account = await this.prisma.vendors.findUnique({
        //   where: { id: decoded.id },
        // });
      }
      if (!account) throw new NotFoundException('User/seller account not found');

      const newAccessToken = this.jwtService.sign({ id: account.id, role: decoded.role }, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(
        { id: account.id, role: decoded.role },
        { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET }
      );

      // Use the same helper for consistent cookie handling
      const tokens = setCookies(res, newAccessToken, newRefreshToken);

      return {
        message: 'Token refreshed successfully',
        status: true,
        user: {
          id: account.id,
          name: account.name,
          email: account.email,
        },
        tokens, // Include tokens in body for client backup
      };
    } catch (error) {
      // Use helper to clear cookies
      clearAuthCookies(res);
      throw new UnauthorizedException('Session expired. Please login again.');
    }
  }

  async logoutUser(res: Response) {
    clearAuthCookies(res);
    return {
      message: 'Logged out successfully',
      status: true,
    };
  }

  async getUser(req: any) {
    console.log(req.user.role);
    return { id: req.user.id, role: req.user.role };
  }

  async getAllUsers() {
    return this.prisma.users.findMany();
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
