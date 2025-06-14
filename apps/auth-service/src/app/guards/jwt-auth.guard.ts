import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-core';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Injectable()
// In order to use AuthGuard together with GraphQL, you have to extend
// the built-in AuthGuard class and override getRequest() method.
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    // Extract token with safe property access
    const token = this.extractTokenFromRequest(req);
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    try {
      const decoded = this.jwt.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET }) as {
        id: string;
        role: string;
      };

      const account = await this.prisma.users.findUnique({
        where: { id: decoded.id },
      });

      if (!account) {
        throw new AuthenticationError('User not found');
      }
      req.user = decoded;
      return true;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Invalid token');
    }
  }

  private extractTokenFromRequest(req: any): string | undefined {
    // Check parsed cookies first (with safe access)
    if (req.cookies && typeof req.cookies === 'object' && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }

    // If cookies aren't parsed, manually parse the cookie header
    if (req.headers?.cookie) {
      const cookies = this.parseCookies(req.headers.cookie);
      if (cookies.accessToken) {
        return cookies.accessToken;
      }
    }

    // Then check Authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return undefined;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};

    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });

    return cookies;
  }
}
