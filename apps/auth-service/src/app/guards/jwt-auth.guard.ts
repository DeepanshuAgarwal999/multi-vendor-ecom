import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticationError } from 'apollo-server-core';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
// In order to use AuthGuard together with GraphQL, you have to extend
// the built-in AuthGuard class and override getRequest() method.
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      throw new AuthenticationError('No session found');
    }
    const session = await this.authService.validateSession(sessionId);
    
    req.user = session;
    return true;
  }
}
